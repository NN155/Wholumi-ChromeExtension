class WebSocketDashboard {
    constructor() {
        this.serverUrl = window.location.origin;
        this.logs = [];
        this.maxLogs = 1000;
        this.messageCount = 0;
        this.lastMinuteMessages = [];
        
        this.init();
    }

    async init() {
        console.log('Initializing WebSocket Dashboard');
        await this.loadInitialData();
        this.startPolling();
        this.setupEventListeners();
        this.updateMessageRate();
    }

    async loadInitialData() {
        try {
            const response = await fetch(`${this.serverUrl}/status`);
            const data = await response.json();
            this.updateStatus(data);
            this.updateServerStatus('Connected', 'success');
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.updateServerStatus('Connection Failed', 'error');
        }
    }

    startPolling() {
        // Poll server status every 2 seconds
        setInterval(async () => {
            try {
                const response = await fetch(`${this.serverUrl}/status`);
                const data = await response.json();
                this.updateStatus(data);
                this.updateServerStatus('Connected', 'success');
            } catch (error) {
                console.error('Polling failed:', error);
                this.updateServerStatus('Connection Lost', 'error');
            }
        }, 2000);

        // Poll clients every 5 seconds
        setInterval(async () => {
            try {
                const response = await fetch(`${this.serverUrl}/clients`);
                const clients = await response.json();
                this.updateClients(clients);
            } catch (error) {
                console.error('Failed to load clients:', error);
            }
        }, 5000);

        // Poll users every 3 seconds
        setInterval(async () => {
            try {
                const response = await fetch(`${this.serverUrl}/users`);
                const users = await response.json();
                this.updateUsers(users);
            } catch (error) {
                console.error('Failed to load users:', error);
            }
        }, 3000);

        // Poll logs every 2 seconds
        setInterval(async () => {
            try {
                const response = await fetch(`${this.serverUrl}/logs`);
                const logs = await response.json();
                this.updateLogs(logs);
            } catch (error) {
                console.error('Failed to load logs:', error);
            }
        }, 2000);
    }

    setupEventListeners() {
        // Auto-scroll checkbox
        document.getElementById('autoScroll').addEventListener('change', (e) => {
            if (e.target.checked) {
                this.scrollToBottom();
            }
        });

        // Broadcast form
        document.getElementById('broadcastMessage').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.sendBroadcast();
            }
        });
    }

    updateStatus(data) {
        document.getElementById('clientCount').textContent = data.clients || 0;
        document.getElementById('roomCount').textContent = data.rooms?.length || 0;
        document.getElementById('uptime').textContent = this.formatUptime(data.uptime || 0);
        
        // Update rooms list
        this.updateRooms(data.rooms || []);
    }

    updateServerStatus(status, type) {
        const statusElement = document.getElementById('serverStatus');
        statusElement.textContent = status;
        statusElement.className = `status status-${type}`;
        
        // Add status-specific styles
        if (type === 'success') {
            statusElement.style.color = '#81c784';
        } else if (type === 'error') {
            statusElement.style.color = '#e57373';
        } else {
            statusElement.style.color = 'rgba(255, 255, 255, 0.9)';
        }
    }

    updateUsers(users) {
        const usersList = document.getElementById('usersList');
        
        if (!users || users.length === 0) {
            usersList.innerHTML = '<div class="loading">No users connected</div>';
            this.updateUserSelect([]);
            return;
        }

        usersList.innerHTML = users.map(user => `
            <div class="user-item ${user.isOnline ? 'online' : 'offline'}" onclick="openUserModal('${user.username}')">
                <div class="user-name">${user.username}</div>
                <div class="user-status">
                    ${user.isOnline ? '🟢 Online' : '⚫ Offline'} • 
                    ${user.clientsCount} connection(s)
                </div>
                <div class="user-events">${user.totalEvents} events • ${user.pagesVisited.length} pages</div>
            </div>
        `).join('');
        
        // Update user select for request execution
        this.updateUserSelect(users);
    }

    updateUserSelect(users) {
        const targetUserSelect = document.getElementById('targetUser');
        if (!targetUserSelect) return;
        
        // Clear current options except the first one
        targetUserSelect.innerHTML = '<option value="">Select target user...</option>';
        
        // Add online users to the select
        const onlineUsers = users.filter(user => user.isOnline);
        onlineUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.username;
            option.textContent = `${user.username} (${user.clientsCount} connection(s))`;
            targetUserSelect.appendChild(option);
        });
    }

    async loadUserDetails(username) {
        try {
            const response = await fetch(`${this.serverUrl}/users/${username}`);
            const userDetails = await response.json();
            
            const eventsResponse = await fetch(`${this.serverUrl}/users/${username}/events?limit=50`);
            const events = await eventsResponse.json();
            
            this.displayUserDetails(userDetails, events);
        } catch (error) {
            console.error('Failed to load user details:', error);
            alert('Failed to load user details');
        }
    }

    displayUserDetails(user, events) {
        document.getElementById('modalUserName').textContent = `👤 ${user.username}`;
        
        const userDetails = document.getElementById('userDetails');
        userDetails.innerHTML = `
            <div class="detail-card">
                <div class="detail-label">Username</div>
                <div class="detail-value">${user.username}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">Login Hash</div>
                <div class="detail-value">${user.loginHash || 'N/A'}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">Status</div>
                <div class="detail-value">${user.isOnline ? '🟢 Online' : '⚫ Offline'}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">Active Connections</div>
                <div class="detail-value">${user.clients.length}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">Total Events</div>
                <div class="detail-value">${user.totalEvents}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">Pages Visited</div>
                <div class="detail-value">${user.pagesVisited.length}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">First Seen</div>
                <div class="detail-value">${this.formatDateTime(user.firstSeen)}</div>
            </div>
            <div class="detail-card">
                <div class="detail-label">Last Seen</div>
                <div class="detail-value">${this.formatDateTime(user.lastSeen)}</div>
            </div>
        `;
        
        const userEvents = document.getElementById('userEvents');
        if (events && events.length > 0) {
            userEvents.innerHTML = events.map(event => `
                <div class="event-item">
                    <span class="event-type">${event.type}</span>
                    <span class="event-timestamp">${this.formatDateTime(event.timestamp)}</span>
                    <div class="event-data">${this.formatEventData(event)}</div>
                </div>
            `).join('');
        } else {
            userEvents.innerHTML = '<div class="loading">No events recorded</div>';
        }
    }

    formatEventData(event) {
        if (event.type === 'request') {
            return `${event.method} ${event.url}`;
        } else if (event.data) {
            if (event.data.url) {
                return `URL: ${event.data.url}`;
            } else if (event.data.from && event.data.to) {
                return `${event.data.from} → ${event.data.to}`;
            } else {
                return JSON.stringify(event.data).substring(0, 100);
            }
        }
        return '';
    }

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString();
    }

    updateClients(clients) {
        const clientsList = document.getElementById('clientsList');
        
        if (!clients || clients.length === 0) {
            clientsList.innerHTML = '<div class="loading">No clients connected</div>';
            return;
        }

        clientsList.innerHTML = clients.map(client => `
            <div class="client-item">
                <div class="client-id">${client.id}</div>
                <div class="client-meta">
                    Rooms: ${client.rooms.join(', ') || 'None'}<br>
                    Connected: ${this.formatTime(client.metadata.connectedAt)}<br>
                    Last Activity: ${this.formatTime(client.metadata.lastActivity)}
                </div>
            </div>
        `).join('');
    }

    updateRooms(rooms) {
        const roomsList = document.getElementById('roomsList');
        
        if (!rooms || rooms.length === 0) {
            roomsList.innerHTML = '<div class="loading">No active rooms</div>';
            return;
        }

        roomsList.innerHTML = rooms.map(room => `
            <div class="room-item">
                <div class="room-name">${room.name}</div>
                <div class="room-count">${room.clients} client(s)</div>
            </div>
        `).join('');
    }

    updateLogs(serverLogs) {
        // Update logs only if they've changed
        if (serverLogs.length !== this.logs.length) {
            this.logs = serverLogs.map(log => ({
                type: log.level,
                message: `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}`,
                timestamp: new Date(log.timestamp).getTime()
            }));
            this.renderLogs();
        }
    }

    simulateServerLogs() {
        // This simulates server logs - replace with actual WebSocket connection to server logs
        const logTypes = ['info', 'warn', 'error', 'success', 'debug'];
        const messages = [
            'Client connected successfully',
            'Message broadcasted to room: general',
            'Client disconnected',
            'Room created: boost',
            'Heartbeat received from client',
            'Invalid message format received',
            'Client joined room: trade',
            'Client left room: config',
            'Server health check passed',
            'Memory usage: 45MB',
            'CPU usage: 12%',
            'WebSocket connection established',
            'HTTP request to /status',
            'Database connection healthy'
        ];

        if (Math.random() > 0.3) { // 70% chance of new log
            const type = logTypes[Math.floor(Math.random() * logTypes.length)];
            const message = messages[Math.floor(Math.random() * messages.length)];
            const timestamp = new Date().toLocaleTimeString();
            
            this.addLog(type, `[${timestamp}] ${message}`);
            this.messageCount++;
            this.lastMinuteMessages.push(Date.now());
        }
    }

    addLog(type, message) {
        const log = { type, message, timestamp: Date.now() };
        this.logs.push(log);
        
        // Keep only last maxLogs entries
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
        
        this.renderLogs();
    }

    renderLogs() {
        const container = document.getElementById('logsContainer');
        const autoScroll = document.getElementById('autoScroll').checked;
        const wasAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 10;
        
        container.innerHTML = this.logs.map(log => 
            `<div class="log-entry log-${log.type}">${this.escapeHtml(log.message)}</div>`
        ).join('');
        
        if (autoScroll && (wasAtBottom || this.logs.length === 1)) {
            this.scrollToBottom();
        }
    }

    scrollToBottom() {
        const container = document.getElementById('logsContainer');
        container.scrollTop = container.scrollHeight;
    }

    updateMessageRate() {
        setInterval(() => {
            const now = Date.now();
            const oneMinuteAgo = now - 60000;
            
            // Remove messages older than 1 minute
            this.lastMinuteMessages = this.lastMinuteMessages.filter(time => time > oneMinuteAgo);
            
            document.getElementById('messageRate').textContent = this.lastMinuteMessages.length;
        }, 1000);
    }

    async sendBroadcast() {
        const room = document.getElementById('broadcastRoom').value.trim();
        const message = document.getElementById('broadcastMessage').value.trim();
        
        if (!room || !message) {
            alert('Please enter both room name and message');
            return;
        }

        try {
            const response = await fetch(`${this.serverUrl}/broadcast`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ room, data: { message, from: 'Dashboard' } })
            });

            if (response.ok) {
                document.getElementById('broadcastMessage').value = '';
                this.addLog('success', `[${new Date().toLocaleTimeString()}] Broadcast sent to room: ${room}`);
            } else {
                throw new Error('Failed to send broadcast');
            }
        } catch (error) {
            console.error('Broadcast failed:', error);
            this.addLog('error', `[${new Date().toLocaleTimeString()}] Failed to send broadcast: ${error.message}`);
        }
    }

    formatUptime(seconds) {
        if (seconds < 60) return `${Math.floor(seconds)}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        return `${Math.floor(seconds / 86400)}d`;
    }

    formatTime(dateString) {
        return new Date(dateString).toLocaleTimeString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Create dashboard instance
const dashboard = new WebSocketDashboard();

// Global presets storage
let requestPresets = [];

// Load presets on init
async function loadRequestPresets() {
    try {
        const response = await fetch('/fetchPresets.json');
        requestPresets = await response.json();
        
        const presetSelect = document.getElementById('requestPreset');
        presetSelect.innerHTML = '<option value="">Select preset...</option>';
        
        requestPresets.forEach((preset, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = preset.name;
            presetSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load presets:', error);
    }
}

function loadPreset() {
    const presetSelect = document.getElementById('requestPreset');
    const selectedIndex = presetSelect.value;
    
    if (selectedIndex === '') return;
    
    const preset = requestPresets[selectedIndex];
    if (!preset) return;
    
    document.getElementById('requestMethod').value = preset.method || 'GET';
    document.getElementById('requestUrl').value = preset.url || '';
    document.getElementById('requestHeaders').value = preset.headers ? JSON.stringify(preset.headers, null, 2) : '';
    document.getElementById('requestBody').value = preset.body || '';
}

// Global functions for buttons
function clearLogs() {
    dashboard.logs = [];
    dashboard.renderLogs();
    dashboard.addLog('info', `[${new Date().toLocaleTimeString()}] Logs cleared`);
}

function downloadLogs() {
    const logsText = dashboard.logs.map(log => 
        `[${new Date(log.timestamp).toISOString()}] [${log.type.toUpperCase()}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `wholumi-server-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    dashboard.addLog('info', `[${new Date().toLocaleTimeString()}] Logs downloaded`);
}

function sendBroadcast() {
    dashboard.sendBroadcast();
}

function openUserModal(username) {
    document.getElementById('userModal').style.display = 'block';
    dashboard.loadUserDetails(username);
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

async function executeRequest() {
    const targetUser = document.getElementById('targetUser').value;
    const method = document.getElementById('requestMethod').value;
    const url = document.getElementById('requestUrl').value;
    const headersText = document.getElementById('requestHeaders').value;
    const bodyText = document.getElementById('requestBody').value;
    const resultDiv = document.getElementById('requestResult');
    
    // Validation
    if (!targetUser) {
        alert('Please select a target user');
        return;
    }
    
    if (!url) {
        alert('Please enter a URL');
        return;
    }
    
    // Parse headers
    let headers = {};
    if (headersText.trim()) {
        try {
            headers = JSON.parse(headersText);
        } catch (e) {
            alert('Invalid JSON format in headers');
            return;
        }
    }
    
    // Parse body
    let body = null;
    if (bodyText.trim() && method !== 'GET') {
        try {
            // Try to parse as JSON first
            body = JSON.parse(bodyText);
        } catch (e) {
            // If not JSON, use as string
            body = bodyText;
        }
    }
    
    // Show loading
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<div style="color: #007bff;">⏳ Executing request...</div>';
    
    try {
        const response = await fetch('/execute-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                targetUser: targetUser,
                method: method,
                url: url,
                headers: headers,
                body: body
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            resultDiv.innerHTML = `
                <div style="color: #28a745; margin-bottom: 10px;">✅ Request sent successfully</div>
                <div><strong>Request ID:</strong> ${result.requestId}</div>
                <div><strong>Target Client:</strong> ${result.targetClient}</div>
                <div style="margin-top: 10px; color: #6c757d;">⏳ Waiting for response...</div>
            `;
            
            dashboard.addLog('info', `[${new Date().toLocaleTimeString()}] Request ${result.requestId} sent to ${targetUser}: ${method} ${url}`);
            
            // Poll for result
            pollRequestResult(result.requestId, resultDiv);
        } else {
            resultDiv.innerHTML = `
                <div style="color: #dc3545;">❌ Request failed</div>
                <div><strong>Error:</strong> ${result.error}</div>
            `;
        }
    } catch (error) {
        resultDiv.innerHTML = `
            <div style="color: #dc3545;">❌ Network error</div>
            <div><strong>Error:</strong> ${error.message}</div>
        `;
    }
}

async function pollRequestResult(requestId, resultDiv) {
    let attempts = 0;
    const maxAttempts = 60; // 30 seconds with 0.5s intervals
    
    const poll = async () => {
        try {
            const response = await fetch(`/request-result/${requestId}`);
            const result = await response.json();
            
            if (result.success && result.status === 'completed') {
                // Display the result
                const res = result.result;
                resultDiv.innerHTML = `
                    <div style="color: #28a745; margin-bottom: 10px;">✅ Request completed</div>
                    <div><strong>Request ID:</strong> ${requestId}</div>
                    <div><strong>Status Code:</strong> ${res.statusCode || 'N/A'}</div>
                    <div><strong>Success:</strong> ${res.success ? 'Yes' : 'No'}</div>
                    ${res.error ? `<div style="color: #dc3545;"><strong>Error:</strong> ${res.error}</div>` : ''}
                    <div style="margin-top: 10px;"><strong>Response:</strong></div>
                    <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; max-height: 200px; overflow-y: auto; white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify(res.response, null, 2)}</pre>
                    ${res.headers ? `<div style="margin-top: 10px;"><strong>Headers:</strong></div><pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; max-height: 100px; overflow-y: auto; font-size: 11px;">${JSON.stringify(res.headers, null, 2)}</pre>` : ''}
                `;
                
                dashboard.addLog('info', `[${new Date().toLocaleTimeString()}] Request ${requestId} completed with status ${res.statusCode}`);
                return; // Stop polling
            } else if (result.success && result.status === 'pending') {
                // Continue polling
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(poll, 500);
                } else {
                    resultDiv.innerHTML = `
                        <div style="color: #ffc107;">⚠️ Request timeout</div>
                        <div><strong>Request ID:</strong> ${requestId}</div>
                        <div>The request is taking too long to complete.</div>
                    `;
                    dashboard.addLog('warn', `[${new Date().toLocaleTimeString()}] Request ${requestId} timed out`);
                }
            } else {
                resultDiv.innerHTML = `
                    <div style="color: #dc3545;">❌ Request not found</div>
                    <div><strong>Request ID:</strong> ${requestId}</div>
                    <div>The request may have expired or failed.</div>
                `;
            }
        } catch (error) {
            attempts++;
            if (attempts < maxAttempts) {
                setTimeout(poll, 500);
            } else {
                resultDiv.innerHTML = `
                    <div style="color: #dc3545;">❌ Polling error</div>
                    <div><strong>Error:</strong> ${error.message}</div>
                `;
            }
        }
    };
    
    // Start polling after a short delay
    setTimeout(poll, 500);
}

// Initialize dashboard when page loads
window.addEventListener('DOMContentLoaded', () => {
    dashboard.init();
    loadRequestPresets();
});
