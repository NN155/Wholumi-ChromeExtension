/**
 * WebSocket Configuration
 * Конфигурация для WebSocket соединения
 */

// Конфигурация по умолчанию для WebSocket
const defaultWebSocketConfig = {
    url: 'ws://localhost:8081',
    reconnect: true,
    autoJoinRooms: ['general'],
    heartbeatInterval: 30000, // 30 seconds
    maxReconnectAttempts: 5,
    reconnectDelay: 1000,
    maxReconnectDelay: 30000,
    maxQueueSize: 100
};

// Конфигурация для разных сред
const environmentConfigs = {
    development: {
        url: 'ws://localhost:8081',
        autoJoinRooms: ['general', 'dev']
    },
    production: {
        url: 'ws://localhost:8081',
        autoJoinRooms: ['general']
    },
    local: {
        url: 'ws://127.0.0.1:8081',
        autoJoinRooms: ['general', 'local']
    }
};

// Функция для получения конфигурации в зависимости от среды
function getWebSocketConfig() {
    const environment = getEnvironment();
    const envConfig = environmentConfigs[environment] || {};
    
    return {
        ...defaultWebSocketConfig,
        ...envConfig
    };
}

function getEnvironment() {
    // Определяем среду на основе URL или других факторов
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'local';
    } else if (hostname.includes('dev') || hostname.includes('test')) {
        return 'development';
    } else {
        return 'production';
    }
}

// Экспортируем конфигурацию
window.WholiumiWebSocketConfig = getWebSocketConfig();
