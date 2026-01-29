(async function() {
    'use strict';

    if (typeof chrome === 'undefined' || !chrome.storage) return;

    // --- 1. データの同期ロード (Chrome Storage -> Memory) ---
    const storageCache = await chrome.storage.local.get(null);

    // 値の変更を監視するリスナーを保持するオブジェクト
    const changeListeners = {};

    // 別のタブやウィンドウでデータが変更された場合、メモリキャッシュも即座に更新する
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local') {
            for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
                // キャッシュの更新
                if (newValue === undefined) {
                    delete storageCache[key];
                } else {
                    storageCache[key] = newValue;
                }

                // GM_addValueChangeListener で登録されたコールバックを実行
                // UserScriptの仕様に合わせて (name, oldVal, newVal, remote) を渡す
                if (changeListeners[key]) {
                    changeListeners[key].forEach(callback => {
                        try {
                            // remote引数は「他のインスタンスからの変更」を示しますが、
                            // Chrome拡張機能のonChangedは自身の変更でも発火するため、
                            // 簡易的に常に true (または文脈による) として扱います。
                            // ここでは同期を機能させるために true を渡します。
                            callback(key, oldValue, newValue, true);
                        } catch (e) {
                            console.error("GM_addValueChangeListener callback error:", e);
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
        storageCache[key] = value;
        chrome.storage.local.set({ [key]: value });
    };

    window.GM_deleteValue = function(key) {
        delete storageCache[key];
        chrome.storage.local.remove(key);
    };

    // GM_addValueChangeListener の実装
    window.GM_addValueChangeListener = function(key, callback) {
        if (!changeListeners[key]) {
            changeListeners[key] = [];
        }
        changeListeners[key].push(callback);
        // 本来はリスナーIDを返すべきですが、今回は削除機能が使われていないため簡易的な値を返します
        return changeListeners[key].length;
    };

    // GM_removeValueChangeListener の実装 (念のため定義)
    window.GM_removeValueChangeListener = function(listenerId) {
        // 今回のコードでは使用されていないため、空実装または簡易実装で十分です
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
    // Manifestでの読み込み順序により content.js は既に読み込まれ、関数が定義されているはずですが、
    // 万が一のために存在チェックを行います。
    if (typeof window.__X_ADV_SEARCH_MAIN__ === 'function') {
        window.__X_ADV_SEARCH_MAIN__();
    }

})();
