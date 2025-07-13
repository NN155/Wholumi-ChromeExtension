/**
 * Global WebSocket Loader
 * Загружается на всех страницах и инициализирует WebSocket соединение
 */

// Проверяем, не загружен ли уже WebSocket
if (!window.WholiumiWebSocketLoaded) {
    window.WholiumiWebSocketLoaded = true;
    
    console.log('[Wholumi] Initializing WebSocket on page:', window.location.href);
    
    // Функция для динамической загрузки скриптов
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            (document.head || document.documentElement).appendChild(script);
        });
    }
    
    // Функция для загрузки скрипта как модуля
    function loadAndExecuteScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = chrome.runtime.getURL(url);
            script.onload = resolve;
            script.onerror = reject;
            (document.head || document.documentElement).appendChild(script);
        });
    }
    
    // Инициализация WebSocket
    async function initWebSocket() {
        try {
            // Загружаем конфигурацию WebSocket
            await loadAndExecuteScript('content/services/websocket/WebSocketConfig.js');
            console.log('[Wholumi] WebSocket config loaded');
            
            // Загружаем WebSocket клиент
            await loadAndExecuteScript('content/services/websocket/WebSocketClient.js');
            console.log('[Wholumi] WebSocket client loaded');
            
            // Небольшая задержка для инициализации
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Загружаем интеграционный сервис
            await loadAndExecuteScript('content/services/websocket/WebSocketIntegrationService.js');
            console.log('[Wholumi] WebSocket integration service loaded');
            
            // Уведомляем о готовности WebSocket
            const event = new CustomEvent('wholumi-websocket-ready', {
                detail: {
                    client: window.WholiumiWebSocket,
                    integration: window.WholiumiWebSocketIntegration
                }
            });
            window.dispatchEvent(event);
            
        } catch (error) {
            console.error('[Wholumi] Error loading WebSocket:', error);
        }
    }
    
    // Ждем загрузки DOM, затем инициализируем WebSocket
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWebSocket);
    } else {
        initWebSocket();
    }
}

// Добавляем обработчик для сообщений от background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'websocket-command') {
        if (window.WholiumiWebSocket) {
            switch (message.command) {
                case 'connect':
                    window.WholiumiWebSocket.connect();
                    break;
                case 'disconnect':
                    window.WholiumiWebSocket.disconnect();
                    break;
                case 'status':
                    sendResponse(window.WholiumiWebSocket.getStatus());
                    return true;
                case 'broadcast':
                    window.WholiumiWebSocket.broadcastToRoom(message.room, message.data);
                    break;
            }
        }
    }
});
