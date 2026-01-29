(async function() {
    'use strict';

    if (typeof chrome === 'undefined' || !chrome.storage) return;

    // リスナー管理用マップ { key: Set(callback) }
    const changeListeners = new Map();

    // --- 1. データの同期ロード (Chrome Storage -> Memory) ---
    const storageCache = await chrome.storage.local.get(null);

    // ストレージの変更を監視 (他タブ・自タブ問わず発火)
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local') {
            for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
                // キャッシュ更新
                if (newValue === undefined) {
                    delete storageCache[key];
                } else {
                    storageCache[key] = newValue;
                }

                // 登録されたリスナーがあれば発火させる
                // GM_addValueChangeListener(name, oldVal, newVal, remote)
                if (changeListeners.has(key)) {
                    changeListeners.get(key).forEach(callback => {
                        try {
                            // 第4引数 remote は「他インスタンスからの変更か」だが、
                            // 拡張機能では storage.onChanged は常に「保存された事実」なので true 扱いにして
                            // 強制的に再描画させるのが最も確実
                            callback(key, oldValue, newValue, true);
                        } catch (e) {
                            console.error("[Adapter] Listener error:", e);
                        }
                    });
                }
            }
        }
    });

    // --- 2. GM_* API の Polyfill ---

    window.GM_getValue = function(key, defaultValue) {
        return Object.prototype.hasOwnProperty.call(storageCache, key) ? storageCache[key] : defaultValue;
    };

    window.GM_setValue = function(key, value) {
        // メモリキャッシュも即時更新（描画のチラつき防止）
        storageCache[key] = value;
        chrome.storage.local.set({ [key]: value });
    };

    window.GM_deleteValue = function(key) {
        delete storageCache[key];
        chrome.storage.local.remove(key);
    };

    // 同期に必要なリスナー登録関数
    window.GM_addValueChangeListener = function(key, callback) {
        if (!changeListeners.has(key)) {
            changeListeners.set(key, new Set());
        }
        changeListeners.get(key).add(callback);
        
        // 登録IDを返すのが仕様だが、今回は簡易的に callback 自体をID代わりにする
        return callback;
    };

    window.GM_addStyle = function(css) {
        const style = document.createElement('style');
        style.textContent = css;
        (document.head || document.documentElement).appendChild(style);
        return style;
    };

    // Background Script経由の通信プロキシ
    // X.comのCSP制限を回避するため、直接fetchせずService Workerに依頼する
    window.GM_xmlhttpRequest = function(details) {
        chrome.runtime.sendMessage({
            type: 'GM_xmlhttpRequest',
            details: {
                method: details.method,
                url: details.url,
                headers: details.headers,
                data: details.data
            }
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Runtime Error:", chrome.runtime.lastError);
                if (details.onerror) details.onerror({ error: chrome.runtime.lastError.message });
                return;
            }

            if (response && response.success) {
                if (details.onload) {
                    details.onload(response.response);
                }
            } else {
                if (details.onerror) {
                    details.onerror({ error: response ? response.error : 'Unknown error' });
                }
            }
        });
    };

    window.GM_info = {
        scriptHandler: "Chrome Extension Adapter",
        version: "7.0.3"
    };

    // --- 3. UserScript本体の起動 ---
    // manifest.json の記述順序が ["content.js", "adapter.js"] なので、
    // content.js が先に実行されて window.__X_ADV_SEARCH_MAIN__ に関数が入っている状態になる。
    if (typeof window.__X_ADV_SEARCH_MAIN__ === 'function') {
        window.__X_ADV_SEARCH_MAIN__();
    }

})();
