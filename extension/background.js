// 拡張機能の特権領域で通信を行うためのプロキシ
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GM_xmlhttpRequest') {
        const { method, url, headers, data } = request.details;
        
        fetch(url, {
            method: method || 'GET',
            headers: headers || {},
            body: data || null
        })
        .then(async (response) => {
            const text = await response.text();
            // レスポンスヘッダーを文字列化
            const responseHeaders = [...response.headers].map(h => `${h[0]}: ${h[1]}`).join("\r\n");
            
            sendResponse({
                success: true,
                response: {
                    status: response.status,
                    statusText: response.statusText,
                    responseText: text,
                    responseHeaders: responseHeaders,
                    finalUrl: response.url
                }
            });
        })
        .catch((error) => {
            sendResponse({
                success: false,
                error: error.toString()
            });
        });

        return true; // 非同期レスポンスのために true を返す
    }
});
