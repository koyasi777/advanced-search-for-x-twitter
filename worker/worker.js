/**
 * Secure Cloud Sync Worker
 * * Key Features:
 * - Copy-on-Write Architecture: Writes new data first, then switches the pointer. No data loss on race conditions.
 * - Server-Side PBKDF2: Additional hashing layer with unique server salts to prevent rainbow table attacks.
 * - Transactional Integrity: Uses D1 batch operations for atomic updates.
 * - Memory Safety: Enforces 10MB payload limit to prevent Worker OOM crashes.
 * - Anti-Caching: Explicit headers to ensure fresh data.
 */

// D1のバッチ制限およびWorkerのメモリ制限を考慮し、安全マージンを確保して小さくする
const CHUNK_SIZE = 500 * 1024; // 500KB

export default {
  async fetch(request, env, ctx) {
    // ========================================================================
    // 1. Strict CORS & Origin Validation
    // ========================================================================
    const origin = request.headers.get("Origin");
    
    // 許可するオリジン
    const allowedOrigins = ["https://x.com", "https://twitter.com"];
    
    // Originがない(拡張機能/アプリ)、または拡張機能由来の場合も許可する
    const isAllowedOrigin = !origin 
        || allowedOrigins.includes(origin) 
        || origin.startsWith("chrome-extension://") 
        || origin.startsWith("moz-extension://");

    const corsHeaders = {
      "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Sync-ID, Authorization",
      "Access-Control-Max-Age": "86400",
      "Vary": "Origin",
      // キャッシュ無効化ヘッダー: 最新の同期データを保証するため必須
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    };

    // Preflight Request
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Origin Check
    if (!isAllowedOrigin) {
      return new Response("Forbidden Origin", { status: 403, headers: corsHeaders });
    }

    // ========================================================================
    // 2. ID & Auth Token Validation (Handshake)
    // ========================================================================
    const syncId = request.headers.get("X-Sync-ID");
    const authToken = request.headers.get("Authorization")?.replace("Bearer ", "");

    // UUID形式の厳密なチェック (Version 4 準拠)
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!syncId || !uuidV4Regex.test(syncId)) {
      return new Response(JSON.stringify({ error: "Missing or Invalid ID" }), { 
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } 
      });
    }

    try {
      // ========================================================================
      // 3. Database Operations (Metadata Fetch)
      // ========================================================================
      
      // メタデータ（ロック情報・認証情報・サーバーソルト）を取得
      const meta = await env.DB.prepare(
        "SELECT id, revision, auth_hash, salt, server_salt FROM sync_store WHERE id = ?"
      ).bind(syncId).first();

      // ---------------------------------------------------------
      // Mode A: Pre-flight Salt Check (No Auth Token provided)
      // ---------------------------------------------------------
      if (!authToken) {
        if (request.method === "GET") {
          if (meta) {
            // 既存レコードがあればクライアント用ソルトと認証用ソルトを返す
            return new Response(JSON.stringify({ 
              status: "exists", 
              salt: meta.salt, 
              server_salt: meta.server_salt, // 認証用ソルトを追加
              revision: meta.revision
            }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
          } else {
            // レコードがなければ "new" ステータスを返す
            return new Response(JSON.stringify({ status: "new", salt: null }), { 
              headers: { "Content-Type": "application/json", ...corsHeaders } 
            });
          }
        } else {
          // GET以外でトークンなしは拒否
          return new Response(JSON.stringify({ error: "Unauthorized" }), { 
            status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } 
          });
        }
      }

      // ---------------------------------------------------------
      // Mode B: Authenticated Operations (Auth Token provided)
      // ---------------------------------------------------------
      
      // 認証チェック (レコードが存在する場合のみ)
      if (meta) {
        // サーバーソルトを使って入力トークンをハッシュ化し、保存値と比較
        const { hash: checkHash } = await hashToken(authToken, meta.server_salt);
        
        if (!safeCompare(meta.auth_hash, checkHash)) {
          return new Response(JSON.stringify({ error: "Unauthorized: Invalid Password" }), { 
            status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } 
          });
        }
      }

      // ---------------------------------------------------------
      // Method: GET (Download Chunks / Memory Safe)
      // ---------------------------------------------------------
      if (request.method === "GET") {
        if (!meta) {
          return new Response(JSON.stringify({ revision: 0, chunks: [], salt: null, server_salt: null }), { 
            headers: { "Content-Type": "application/json", ...corsHeaders } 
          });
        }

        // Copy-on-Write対応: 現在の有効なリビジョン(meta.revision)に紐づくチャンクを取得
        // ※ サーバー側で結合(join)やJSON.parseを行うとメモリ死するため、生のチャンク配列を返す
        const chunksResult = await env.DB.prepare(
          "SELECT chunk_index, data FROM sync_chunks WHERE store_id = ? AND revision = ? ORDER BY chunk_index ASC"
        ).bind(syncId, meta.revision).all();

        const chunks = chunksResult.results || [];

        return new Response(JSON.stringify({
          revision: meta.revision,
          chunks: chunks, // 結合せず配列のまま返す
          salt: meta.salt,
        }), { 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        });
      }

      // ---------------------------------------------------------
      // Method: POST (Split & Upload / Transactional Update)
      // ---------------------------------------------------------
      if (request.method === "POST") {
        // メモリ制限対策: 10MB制限
        const contentLength = request.headers.get("content-length");
        if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { 
          return new Response(JSON.stringify({ error: "Payload too large (Limit: 10MB)" }), {
            status: 413, headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }

        let clientBody;
        try {
          clientBody = await request.json();
        } catch(e) {
           return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
        }

        if (!clientBody.iv || !clientBody.ciphertext || !clientBody.signature) {
           return new Response(JSON.stringify({ error: "Invalid payload structure" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
        }

        const clientBaseRev = clientBody.baseRevision || 0;
        const now = Date.now();
        
        // 保存データを文字列化
        const payloadStr = JSON.stringify({
          iv: clientBody.iv,
          ciphertext: clientBody.ciphertext,
          signature: clientBody.signature
        });

        // === チャンク分割 ===
        const chunks = [];
        for (let i = 0; i < payloadStr.length; i += CHUNK_SIZE) {
          chunks.push(payloadStr.slice(i, i + CHUNK_SIZE));
        }

        // --- Scenario A: 新規作成 (INSERT) ---
        if (!meta) {
          const newClientSalt = clientBody.salt;
          if (!newClientSalt) {
              return new Response(JSON.stringify({ error: "Missing salt for new record" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
          }

          const { hash: newHashedToken, salt: newServerSalt } = await hashToken(authToken, null);
          
          // D1 batchによる完全アトミック操作 (メタデータとチャンクを一括コミット)
          // これにより「メタデータだけ出来て中身がない」状態を完全に防ぐ
          const batchStatements = [];

          // 1. メタデータ作成
          batchStatements.push(
            env.DB.prepare(
              "INSERT INTO sync_store (id, revision, auth_hash, salt, server_salt, total_chunks, updated_at) VALUES (?, 1, ?, ?, ?, ?, ?)"
            ).bind(syncId, newHashedToken, newClientSalt, newServerSalt, chunks.length, now)
          );

          // 2. チャンク挿入
          chunks.forEach((chunk, idx) => {
            batchStatements.push(
              env.DB.prepare("INSERT INTO sync_chunks (store_id, revision, chunk_index, data) VALUES (?, 1, ?, ?)")
              .bind(syncId, idx, chunk)
            );
          });

          // 1回のbatchで実行 (D1の制限: 通常100ステートメント程度まで安全。10MB制限なら分割数は収まる想定)
          try {
            await env.DB.batch(batchStatements);
          } catch (e) {
            // UNIQUE制約違反などは競合として扱う
            // D1 (SQLite) のエラーメッセージは環境によって "UNIQUE constraint failed" 等を含む
            if (String(e.message).includes("constraint") || String(e.message).includes("UNIQUE")) {
              return new Response(JSON.stringify({ 
                status: "conflict",
                error: "Initialization Conflict (Already initialized)"
              }), { 
                status: 409, headers: { "Content-Type": "application/json", ...corsHeaders } 
              });
            }
            throw e; // それ以外は外側のcatchへ投げる
          }

          return new Response(JSON.stringify({ status: "success", newRevision: 1 }), {
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }
        
        // --- Scenario B: 更新 (Update) ---
        else {
          // 型変換を明示し、厳格な比較を行うことでリプレイ（古いリクエストの再送信）を弾く
          // クライアントが「ベース」としているリビジョンが、現在のDBリビジョンと一致しない場合、
          // それは「誰かが既に更新した」か「古いリクエストの再送（攻撃）」であるため拒否する
          const safeClientRev = parseInt(clientBaseRev) || 0;
          
          if (safeClientRev !== meta.revision) {
              // 競合時: サーバーデータを返す
              const currentChunks = await env.DB.prepare(
                "SELECT chunk_index, data FROM sync_chunks WHERE store_id = ? AND revision = ? ORDER BY chunk_index ASC"
              ).bind(syncId, meta.revision).all();
              
              return new Response(JSON.stringify({
                status: "conflict",
                message: "Server has newer data",
                serverChunks: currentChunks.results || [],
                currentRevision: meta.revision,
                salt: meta.salt,
                server_salt: meta.server_salt
              }), { status: 409, headers: { "Content-Type": "application/json", ...corsHeaders } });
          }

          const nextRev = meta.revision + 1;
          
          // 更新時も全操作を単一batchにまとめる
          const batchStatements = [];

          // 1. チャンク挿入ステートメント
          chunks.forEach((chunk, idx) => {
            batchStatements.push(
              env.DB.prepare("INSERT OR REPLACE INTO sync_chunks (store_id, revision, chunk_index, data) VALUES (?, ?, ?, ?)")
              .bind(syncId, nextRev, idx, chunk)
            );
          });

          // 2. メタデータ更新ステートメント (末尾に追加)
          batchStatements.push(
            env.DB.prepare(
              "UPDATE sync_store SET revision = ?, total_chunks = ?, updated_at = ? WHERE id = ? AND revision = ?"
            ).bind(nextRev, chunks.length, now, syncId, clientBaseRev)
          );

          // 一括実行
          const results = await env.DB.batch(batchStatements);
          
          // 最後のステートメント(UPDATE)の結果を取得
          const updateResult = results[results.length - 1];
          
          // 更新行数を確認 (0なら他者が先に更新しているため失敗)
          if (updateResult.meta.changes > 0) {
            // 確率的GC
            if (Math.random() < 0.1) {
                // 直近10世代分は残す (即時削除によるダウンロードエラー防止)
                // 同期中の別端末が古いリビジョンを読み込んでいる可能性があるため、余裕を持たせる
                const SAFE_GENERATION_GAP = 10;
                ctx.waitUntil(
                    env.DB.prepare("DELETE FROM sync_chunks WHERE store_id = ? AND revision < ?")
                    .bind(syncId, nextRev - SAFE_GENERATION_GAP)
                    .run()
                );
            }
            return new Response(JSON.stringify({ status: "success", newRevision: nextRev }), {
              headers: { "Content-Type": "application/json", ...corsHeaders }
            });
          } else {
            // 競合発生: 直前にINSERTしてしまったチャンクを削除する（補償トランザクション）
            // これを行わないと、メタデータと紐付かない「未来のリビジョンのゴミデータ」が残留し、次回の正規更新を阻害する恐れがある
            ctx.waitUntil(
                env.DB.prepare("DELETE FROM sync_chunks WHERE store_id = ? AND revision = ?")
                .bind(syncId, nextRev)
                .run()
            );

            return new Response(JSON.stringify({ error: "Update failed (Race condition)" }), { status: 409, headers: { "Content-Type": "application/json", ...corsHeaders } });
          }
        }
      }

      // ========================================================================
      // Method: PUT (Password Rotation / Re-encryption)
      // ========================================================================
      if (request.method === "PUT") {
        if (!meta) {
          return new Response(JSON.stringify({ error: "Record not found" }), { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } });
        }

        // 1. 旧パスワードでの認証 (HeaderのAuthorizationを使用)
        const { hash: checkHash } = await hashToken(authToken, meta.server_salt);
        if (!safeCompare(meta.auth_hash, checkHash)) {
          return new Response(JSON.stringify({ error: "Unauthorized: Old password incorrect" }), { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } });
        }

        // 2. Body検証 (新しい認証トークンと再暗号化されたデータ)
        let clientBody;
        try {
          clientBody = await request.json();
        } catch(e) {
           return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
        }

        const newAuthToken = clientBody.newAuthToken; // 新しいパスワード由来のトークン
        const newClientSalt = clientBody.salt;        // 新しい暗号化用ソルト
        
        if (!newAuthToken || !newClientSalt || !clientBody.iv || !clientBody.ciphertext || !clientBody.signature) {
           return new Response(JSON.stringify({ error: "Missing required fields for rotation" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
        }

        // 3. 新しい認証情報の生成 (新しいサーバーソルトを生成)
        const { hash: newHashedToken, salt: newServerSalt } = await hashToken(newAuthToken, null);

        // 4. データ保存処理 (POSTと同様だが、認証情報も更新する)
        const nextRev = meta.revision + 1;
        const now = Date.now();
        
        const payloadStr = JSON.stringify({
          iv: clientBody.iv,
          ciphertext: clientBody.ciphertext,
          signature: clientBody.signature
        });

        const chunks = [];
        for (let i = 0; i < payloadStr.length; i += CHUNK_SIZE) {
          chunks.push(payloadStr.slice(i, i + CHUNK_SIZE));
        }

        const batchStatements = [];

        // 新しいチャンク挿入
        chunks.forEach((chunk, idx) => {
          batchStatements.push(
            env.DB.prepare("INSERT INTO sync_chunks (store_id, revision, chunk_index, data) VALUES (?, ?, ?, ?)")
            .bind(syncId, nextRev, idx, chunk)
          );
        });

        // メタデータ更新 (auth_hash, salt, server_salt をすべて刷新)
        batchStatements.push(
          env.DB.prepare(
            "UPDATE sync_store SET auth_hash = ?, server_salt = ?, salt = ?, revision = ?, total_chunks = ?, updated_at = ? WHERE id = ?"
          ).bind(newHashedToken, newServerSalt, newClientSalt, nextRev, chunks.length, now, syncId)
        );

        await env.DB.batch(batchStatements);

        // 古いデータの削除はレスポンス返却後に非同期で実行 (タイムアウト回避)
        // 今回のリビジョン(nextRev)より小さいものを全て削除
        ctx.waitUntil(
            env.DB.prepare("DELETE FROM sync_chunks WHERE store_id = ? AND revision < ?")
            .bind(syncId, nextRev)
            .run()
        );

        return new Response(JSON.stringify({ 
          status: "success", 
          message: "Password rotated successfully",
          newRevision: nextRev 
        }), { headers: { "Content-Type": "application/json", ...corsHeaders } });
      }
      
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } 
      });

    } catch (err) {
      const errorDetail = `D1 Error: ${err.name}: ${err.message}\nStack: ${err.stack}`;
      console.error(errorDetail);
      
      return new Response(JSON.stringify({ 
        error: "Worker Logic Failed", 
        detail: err.message
      }), { 
        status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } 
      });
    }
  }
};

/**
 * Helper: Server-side PBKDF2 Hashing (Top-Line Security)
 * サーバー側でもソルトとストレッチングを行い、万が一のDB漏洩時も耐性を持たせる
 */
async function hashToken(token, salt) {
  if (!token) return { hash: null, salt: null };

  const enc = new TextEncoder();
  
  // ソルトが渡されなければ新規生成（登録時）、あればそれを使用（認証時）
  let currentSalt = salt;
  if (!currentSalt) {
    const saltBuffer = new Uint8Array(16);
    crypto.getRandomValues(saltBuffer);
    currentSalt = Array.from(saltBuffer).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const keyMaterial = await crypto.subtle.importKey(
    "raw", 
    enc.encode(token), 
    { name: "PBKDF2" }, 
    false, 
    ["deriveBits"]
  );

  // サーバー側は計算リソースが貴重なため、反復回数はクライアント(60万回)より減らすのが一般的だが、
  // 安全性重視で10万回程度確保する
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: enc.encode(currentSalt),
      iterations: 100000, 
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );

  const hashHex = Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  return { hash: hashHex, salt: currentSalt };
}

/**
 * Helper: Constant-time comparison to prevent timing attacks
 * 長さが異なる場合も計算時間を均一化する
 */
function safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  
  const enc = new TextEncoder();
  const aBuf = enc.encode(a);
  const bBuf = enc.encode(b);

  // Web Crypto APIのtimingSafeEqualは長さが異なるとエラーになる仕様。
  // そのため、長さが違う場合は「自分自身と比較する」ことで計算時間を消費し、
  // 最後に「長さが違った」という事実に基づいてfalseを返す
  if (aBuf.byteLength !== bBuf.byteLength) {
     crypto.subtle.timingSafeEqual(aBuf, aBuf); // ダミー実行（時間の消費）
     return false;
  }

  return crypto.subtle.timingSafeEqual(aBuf, bBuf);
}
