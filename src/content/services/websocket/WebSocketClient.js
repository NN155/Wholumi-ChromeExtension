/**
 * Wholumi WebSocket Client
 * Singleton класс для управления WebSocket соединениями
 */
class WholiumiWebSocketClient {
    constructor() {
        if (WholiumiWebSocketClient.instance) {
            return WholiumiWebSocketClient.instance;
        }

        this.ws = null;
        this.clientId = null;
        this.isConnected = false;
        this.isReconnecting = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // ms
        this.maxReconnectDelay = 30000; // ms
        this.heartbeatInterval = null;
        this.heartbeatTimeoutInterval = 30000; // 30 seconds
        
        // Event listeners storage
        this.eventListeners = new Map();
        
        // Message queue for when disconnected
        this.messageQueue = [];
        this.maxQueueSize = 100;
        
        // Rooms the client is currently in
        this.joinedRooms = new Set();
        
        // Server configuration
        this.serverConfig = window.WholiumiWebSocketConfig || {
            url: 'ws://localhost:8081',
            reconnect: true,
            autoJoinRooms: ['general'] // Rooms to auto-join on connect
        };

        WholiumiWebSocketClient.instance = this;
        this.init();
    }

    static getInstance() {
        if (!WholiumiWebSocketClient.instance) {
            WholiumiWebSocketClient.instance = new WholiumiWebSocketClient();
        }
        return WholiumiWebSocketClient.instance;
    }

    async init() {
        // Load configuration from extension config
        await this.loadConfig();
        
        // Get user information from page
        this.getUserInfo();
        
        // Connect to WebSocket server
        this.connect();
        
        // Setup page tracking
        this.setupPageTracking();
        
        // Setup page unload handler
        window.addEventListener('beforeunload', () => {
            this.sendUserEvent('page_unload', { url: window.location.href });
            this.disconnect();
        });
    }

    getUserInfo() {
        // Get user info from global variables
        this.userInfo = {
            loginHash: window.dle_login_hash || null,
            username: window.visitor_name || 'anonymous',
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: Date.now()
        };
        
        console.log('[Wholumi WebSocket] User info:', this.userInfo);
    }

    setupPageTracking() {
        // Track page changes
        let lastUrl = window.location.href;
        
        // Check for URL changes periodically
        setInterval(() => {
            if (window.location.href !== lastUrl) {
                this.sendUserEvent('page_change', {
                    from: lastUrl,
                    to: window.location.href
                });
                lastUrl = window.location.href;
            }
        }, 1000);
        
        // Track focus/blur events
        window.addEventListener('focus', () => {
            this.sendUserEvent('tab_focus', { url: window.location.href });
        });
        
        window.addEventListener('blur', () => {
            this.sendUserEvent('tab_blur', { url: window.location.href });
        });
        
        // Track clicks on important elements
        document.addEventListener('click', (event) => {
            const target = event.target;
            if (target.matches('.btn, .button, .club__boost-btn, .trade-btn, a[href*="trade"], a[href*="club"]')) {
                this.sendUserEvent('element_click', {
                    element: target.tagName,
                    className: target.className,
                    text: target.textContent?.substring(0, 50),
                    url: window.location.href
                });
            }
        });
    }

    async loadConfig() {
        try {
            if (typeof ExtensionConfig !== 'undefined') {
                const config = await ExtensionConfig.getConfig("websocketConfig");
                if (config) {
                    this.serverConfig = { ...this.serverConfig, ...config };
                }
            }
        } catch (error) {
            console.warn('[Wholumi WebSocket] Could not load config, using defaults:', error);
        }
    }

    connect() {
        if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
            console.log('[Wholumi WebSocket] Already connected or connecting');
            return;
        }

        try {
            console.log(`[Wholumi WebSocket] Connecting to ${this.serverConfig.url}`);
            this.ws = new WebSocket(this.serverConfig.url);
            
            this.ws.onopen = this.onOpen.bind(this);
            this.ws.onmessage = this.onMessage.bind(this);
            this.ws.onclose = this.onClose.bind(this);
            this.ws.onerror = this.onError.bind(this);
            
        } catch (error) {
            console.error('[Wholumi WebSocket] Connection error:', error);
            this.scheduleReconnect();
        }
    }

    onOpen() {
        console.log('[Wholumi WebSocket] Connected successfully');
        this.isConnected = true;
        this.isReconnecting = false;
        this.reconnectAttempts = 0;
        
        // Send user identification
        this.send({
            type: 'user_identify',
            data: this.userInfo
        });
        
        // Send initial page load event
        this.sendUserEvent('page_load', { url: window.location.href });
        
        // Start heartbeat
        this.startHeartbeat();
        
        // Process queued messages
        this.processMessageQueue();
        
        // Auto-join rooms
        this.serverConfig.autoJoinRooms.forEach(room => {
            this.joinRoom(room);
        });
        
        // Trigger connection event
        this.emit('connected', { clientId: this.clientId });
    }

    onMessage(event) {
        try {
            const message = JSON.parse(event.data);
            console.log('[Wholumi WebSocket] Received:', message);
            
            switch (message.type) {
                case 'connection':
                    this.clientId = message.clientId;
                    break;
                case 'pong':
                    // Heartbeat response received
                    break;
                case 'room_joined':
                    this.joinedRooms.add(message.room);
                    this.emit('room_joined', message);
                    break;
                case 'room_left':
                    this.joinedRooms.delete(message.room);
                    this.emit('room_left', message);
                    break;
                case 'room_broadcast':
                    this.emit('room_broadcast', message);
                    this.emit(`room_broadcast_${message.room}`, message);
                    break;
                case 'private_message':
                    this.emit('private_message', message);
                    break;
                case 'execute_request':
                    this.handleExecuteRequest(message);
                    break;
                case 'request_response':
                    this.emit('request_response', message);
                    break;
                case 'error':
                    console.error('[Wholumi WebSocket] Server error:', message.message);
                    this.emit('error', message);
                    break;
                default:
                    this.emit('message', message);
                    this.emit(`message_${message.type}`, message);
            }
        } catch (error) {
            console.error('[Wholumi WebSocket] Error parsing message:', error);
        }
    }

    onClose(event) {
        console.log('[Wholumi WebSocket] Connection closed:', event.code, event.reason);
        this.isConnected = false;
        this.clientId = null;
        this.joinedRooms.clear();
        
        this.stopHeartbeat();
        
        if (this.serverConfig.reconnect && !this.isReconnecting) {
            this.scheduleReconnect();
        }
        
        this.emit('disconnected', { code: event.code, reason: event.reason });
    }

    onError(error) {
        console.error('[Wholumi WebSocket] WebSocket error:', error);
        this.emit('error', { error });
    }

    scheduleReconnect() {
        if (!this.serverConfig.reconnect || this.isReconnecting) return;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('[Wholumi WebSocket] Max reconnection attempts reached');
            this.emit('max_reconnect_attempts_reached');
            return;
        }

        this.isReconnecting = true;
        this.reconnectAttempts++;
        
        const delay = Math.min(
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
            this.maxReconnectDelay
        );
        
        console.log(`[Wholumi WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            this.connect();
        }, delay);
    }

    startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected) {
                this.send({ type: 'ping' });
            }
        }, this.heartbeatTimeoutInterval);
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    send(data) {
        if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
            // Queue message if not connected
            if (this.messageQueue.length < this.maxQueueSize) {
                this.messageQueue.push(data);
                console.log('[Wholumi WebSocket] Message queued (not connected)');
            } else {
                console.warn('[Wholumi WebSocket] Message queue full, dropping message');
            }
            return false;
        }

        try {
            this.ws.send(JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('[Wholumi WebSocket] Error sending message:', error);
            return false;
        }
    }

    processMessageQueue() {
        while (this.messageQueue.length > 0 && this.isConnected) {
            const message = this.messageQueue.shift();
            this.send(message);
        }
    }

    // Room management
    joinRoom(room) {
        return this.send({
            type: 'join_room',
            data: { room: room }
        });
    }

    leaveRoom(room) {
        return this.send({
            type: 'leave_room',
            data: { room: room }
        });
    }

    broadcastToRoom(room, data) {
        return this.send({
            type: 'broadcast_to_room',
            room: room,
            data: data
        });
    }

    sendPrivateMessage(targetClientId, data) {
        return this.send({
            type: 'private_message',
            targetClientId: targetClientId,
            data: data
        });
    }

    // Wholumi specific methods
    sendBoostEvent(data) {
        return this.send({
            type: 'boost_event',
            data: data,
            userInfo: this.userInfo
        });
    }

    sendTradeEvent(data) {
        return this.send({
            type: 'trade_event',
            data: data,
            userInfo: this.userInfo
        });
    }

    sendConfigUpdate(data) {
        return this.send({
            type: 'config_update',
            data: data,
            userInfo: this.userInfo
        });
    }

    sendUserEvent(eventType, data) {
        return this.send({
            type: 'user_event',
            eventType: eventType,
            data: data,
            userInfo: this.userInfo,
            timestamp: Date.now()
        });
    }

    sendRequestEvent(method, url, data = {}) {
        return this.send({
            type: 'request_event',
            method: method,
            url: url,
            data: data,
            userInfo: this.userInfo,
            timestamp: Date.now()
        });
    }

    // Event system
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    off(event, callback) {
        if (!this.eventListeners.has(event)) return;
        
        const listeners = this.eventListeners.get(event);
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    emit(event, data) {
        if (!this.eventListeners.has(event)) return;
        
        this.eventListeners.get(event).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`[Wholumi WebSocket] Error in event listener for ${event}:`, error);
            }
        });
    }

    // Utility methods
    disconnect() {
        this.serverConfig.reconnect = false;
        this.stopHeartbeat();
        
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        
        this.isConnected = false;
        this.clientId = null;
        this.joinedRooms.clear();
    }

    getStatus() {
        return {
            isConnected: this.isConnected,
            clientId: this.clientId,
            joinedRooms: Array.from(this.joinedRooms),
            reconnectAttempts: this.reconnectAttempts,
            queuedMessages: this.messageQueue.length
        };
    }

    clearMessageQueue() {
        this.messageQueue = [];
    }

    async handleExecuteRequest(message) {
        const { requestId, method, url, headers, body } = message;
        
        console.log(`[Wholumi WebSocket] Executing request: ${method} ${url}`);
        
        try {
            // Prepare request options
            const requestOptions = {
                method: method,
                headers: headers || {}
            };
            
            // Add body if it's not a GET request
            if (method !== 'GET' && body) {
                if (typeof body === 'string') {
                    requestOptions.body = body;
                } else {
                    requestOptions.body = JSON.stringify(body);
                    if (!requestOptions.headers['Content-Type']) {
                        requestOptions.headers['Content-Type'] = 'application/json';
                    }
                }
            }
            
            // Execute the request using original fetch to avoid interception
            const originalFetch = window.WholiumiWebSocketIntegration?.originalFetch || window.fetch;
            const response = await originalFetch(url, requestOptions);
            
            // Get response data
            const responseText = await response.text();
            let responseData;
            
            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                responseData = responseText;
            }
            
            // Send success response
            const responseHeaders = {};
            try {
                for (const [key, value] of response.headers.entries()) {
                    responseHeaders[key] = value;
                }
            } catch (e) {
                console.warn('[Wholumi WebSocket] Error extracting headers:', e);
            }
            
            this.send({
                type: 'request_response',
                data: {
                    requestId: requestId,
                    success: true,
                    response: responseData,
                    statusCode: response.status,
                    headers: responseHeaders
                }
            });
            
            console.log(`[Wholumi WebSocket] Request ${requestId} completed successfully`);
            
        } catch (error) {
            console.error(`[Wholumi WebSocket] Request ${requestId} failed:`, error);
            
            // Send error response
            this.send({
                type: 'request_response',
                data: {
                    requestId: requestId,
                    success: false,
                    error: error.message,
                    statusCode: error.status || 0
                }
            });
        }
    }
}

// Global instance
window.WholiumiWebSocket = WholiumiWebSocketClient.getInstance();
