/**
 * WebSocket Integration Service
 * Интегрирует WebSocket функциональность с существующими компонентами Wholumi
 */
class WebSocketIntegrationService {
    constructor() {
        this.ws = window.WholiumiWebSocket;
        this.isInitialized = false;
        this.originalFetch = window.fetch;
        
        // Store original fetch globally for request execution
        window.WholiumiWebSocketIntegration = this;
        
        this.setupEventListeners();
        this.interceptNetworkRequests();
    }

    interceptNetworkRequests() {
        // Intercept fetch requests
        window.fetch = async (...args) => {
            const [url, options] = args;
            const method = options?.method || 'GET';
            
            // Log the request
            this.ws.sendRequestEvent(method, url, {
                headers: options?.headers,
                body: options?.body ? 'present' : 'none',
                page: this.getCurrentPage()
            });
            
            try {
                const response = await this.originalFetch(...args);
                
                // Log successful response
                this.ws.sendRequestEvent(`${method}_SUCCESS`, url, {
                    status: response.status,
                    statusText: response.statusText,
                    page: this.getCurrentPage()
                });
                
                return response;
            } catch (error) {
                // Log failed response
                this.ws.sendRequestEvent(`${method}_ERROR`, url, {
                    error: error.message,
                    page: this.getCurrentPage()
                });
                throw error;
            }
        };

        // Intercept XMLHttpRequest if SaveFetchService uses it
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            this._wsMethod = method;
            this._wsUrl = url;
            return originalXHROpen.call(this, method, url, ...args);
        };

        const originalXHRSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function(data) {
            if (this._wsMethod && this._wsUrl) {
                window.WholiumiWebSocket?.sendRequestEvent(this._wsMethod, this._wsUrl, {
                    body: data ? 'present' : 'none',
                    page: window.WholiumiWebSocketIntegration?.getCurrentPage()
                });
            }
            return originalXHRSend.call(this, data);
        };
    }

    setupEventListeners() {
        // WebSocket connection events
        this.ws.on('connected', () => {
            console.log('[Wholumi] WebSocket connected, joining relevant rooms');
            this.joinRelevantRooms();
            this.syncCurrentState();
        });

        this.ws.on('disconnected', () => {
            console.log('[Wholumi] WebSocket disconnected');
        });

        // Room broadcast events
        this.ws.on('room_broadcast_boost', (message) => {
            this.handleBoostBroadcast(message);
        });

        this.ws.on('room_broadcast_trade', (message) => {
            this.handleTradeBroadcast(message);
        });

        this.ws.on('room_broadcast_config', (message) => {
            this.handleConfigBroadcast(message);
        });

        // Setup DOM event listeners
        this.setupDOMEventListeners();
    }

    setupDOMEventListeners() {
        // Listen for boost events from clubs.js
        window.addEventListener('boost-card', (event) => {
            this.ws.sendBoostEvent({
                action: 'boost_initiated',
                cardId: event.detail.cardId,
                clubId: event.detail.clubId,
                timestamp: Date.now(),
                page: this.getCurrentPage()
            });
        });

        window.addEventListener('boost-success', (event) => {
            this.ws.sendBoostEvent({
                action: 'boost_success',
                timestamp: Date.now(),
                page: this.getCurrentPage()
            });
        });

        window.addEventListener('update-page-info', (event) => {
            this.ws.sendBoostEvent({
                action: 'page_updated',
                html: event.detail.html,
                count: event.detail.count,
                top: event.detail.top,
                timestamp: Date.now(),
                page: this.getCurrentPage()
            });
        });

        // Listen for config updates
        window.addEventListener('config-updated', (event) => {
            this.ws.sendConfigUpdate({
                key: event.detail.key,
                value: event.detail.value,
                timestamp: Date.now(),
                page: this.getCurrentPage()
            });
        });

        // Listen for trade events (если есть торговая функциональность)
        window.addEventListener('trade-created', (event) => {
            this.ws.sendTradeEvent({
                action: 'trade_created',
                tradeData: event.detail,
                timestamp: Date.now(),
                page: this.getCurrentPage()
            });
        });

        window.addEventListener('trade-completed', (event) => {
            this.ws.sendTradeEvent({
                action: 'trade_completed',
                tradeData: event.detail,
                timestamp: Date.now(),
                page: this.getCurrentPage()
            });
        });
    }

    joinRelevantRooms() {
        const currentPage = this.getCurrentPage();
        
        // Always join general room
        this.ws.joinRoom('general');
        
        // Join page-specific rooms
        switch (currentPage) {
            case 'clubs':
                this.ws.joinRoom('boost');
                break;
            case 'trade':
                this.ws.joinRoom('trade');
                break;
            case 'inventory':
                this.ws.joinRoom('inventory');
                break;
            case 'profile':
                this.ws.joinRoom('profile');
                break;
            default:
                this.ws.joinRoom('general');
        }

        // Join config room for all pages
        this.ws.joinRoom('config');
    }

    getCurrentPage() {
        const url = window.location.href;
        
        if (url.includes('/clubs/')) return 'clubs';
        if (url.includes('/trade/')) return 'trade';
        if (url.includes('/inventory/')) return 'inventory';
        if (url.includes('/profile/')) return 'profile';
        if (url.includes('/packs/')) return 'packs';
        
        return 'unknown';
    }

    syncCurrentState() {
        // Синхронизируем текущее состояние с другими клиентами
        const currentPage = this.getCurrentPage();
        
        if (currentPage === 'clubs' && typeof clubData !== 'undefined') {
            this.ws.sendBoostEvent({
                action: 'sync_state',
                clubData: {
                    autoBoost: clubData.autoBoost,
                    stopUpdating: clubData.stopUpdating,
                    countBoost: clubData.countBoost,
                    newDay: clubData.newDay
                },
                timestamp: Date.now(),
                page: currentPage
            });
        }
    }

    handleBoostBroadcast(message) {
        const data = message.data;
        
        switch (data.action) {
            case 'boost_initiated':
                this.showNotification(`Boost initiated on ${data.page}`, 'info');
                break;
            case 'boost_success':
                this.showNotification(`Boost successful on ${data.page}`, 'success');
                break;
            case 'page_updated':
                // Можно обновить счетчики или показать уведомление
                this.updateGlobalCounters(data);
                break;
            case 'sync_state':
                // Синхронизация состояния между вкладками
                this.syncStateFromRemote(data);
                break;
        }
    }

    handleTradeBroadcast(message) {
        const data = message.data;
        
        switch (data.action) {
            case 'trade_created':
                this.showNotification('New trade created', 'info');
                break;
            case 'trade_completed':
                this.showNotification('Trade completed', 'success');
                break;
        }
    }

    handleConfigBroadcast(message) {
        const data = message.data;
        this.showNotification(`Config updated: ${data.key}`, 'info');
        
        // Перезагружаем конфигурацию на всех страницах
        if (typeof ExtensionConfig !== 'undefined') {
            ExtensionConfig.reloadConfig(data.key);
        }
    }

    updateGlobalCounters(data) {
        // Обновляем глобальные счетчики на основе данных от других клиентов
        if (data.count && typeof clubData !== 'undefined') {
            // Можно обновить отображение общего количества бустов
            console.log('[Wholumi WebSocket] Global boost count updated:', data.count);
        }
    }

    syncStateFromRemote(data) {
        // Синхронизируем состояние с удаленными клиентами
        if (data.clubData && typeof clubData !== 'undefined') {
            // Не перезаписываем критичные настройки, только информационные
            console.log('[Wholumi WebSocket] Syncing state from remote client:', data.clubData);
        }
    }

    showNotification(message, type = 'info') {
        // Показываем уведомление пользователю
        console.log(`[Wholumi WebSocket] ${type.toUpperCase()}: ${message}`);
        
        // Если есть система уведомлений в расширении, используем её
        if (typeof window.WholiumiNotification !== 'undefined') {
            window.WholiumiNotification.show(message, type);
        } else {
            // Простое уведомление через консоль или можно создать toast
            this.createToastNotification(message, type);
        }
    }

    createToastNotification(message, type) {
        // Создаем простое toast уведомление
        const toast = document.createElement('div');
        toast.className = `wholumi-toast wholumi-toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            opacity: 0;
            transition: opacity 0.3s;
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Public API methods
    broadcastToAllTabs(message, room = 'general') {
        this.ws.broadcastToRoom(room, {
            type: 'tab_broadcast',
            message: message,
            timestamp: Date.now(),
            page: this.getCurrentPage()
        });
    }

    sendCustomEvent(eventType, data, room = 'general') {
        this.ws.broadcastToRoom(room, {
            type: 'custom_event',
            eventType: eventType,
            data: data,
            timestamp: Date.now(),
            page: this.getCurrentPage()
        });
    }

    getConnectionStatus() {
        return this.ws.getStatus();
    }
}

// Создаем глобальный экземпляр
window.WholiumiWebSocketIntegration = new WebSocketIntegrationService();
