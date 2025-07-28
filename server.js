const WebSocket = require('ws');
const http = require('http');
const url = require('url');

// Create HTTP server
const server = http.createServer();

// Create WebSocket server
const wss = new WebSocket.Server({ 
    server,
    verifyClient: (info) => {
        // Allow all connections for this demo
        return true;
    }
});

// Store connected clients by channel
const channels = new Map();

wss.on('connection', (ws, request) => {
    const parameters = url.parse(request.url, true);
    const channelId = parameters.query.channel || 'default';
    
    console.log(`🔌 New connection to channel: ${channelId}`);
    
    // Add client to channel
    if (!channels.has(channelId)) {
        channels.set(channelId, new Set());
    }
    channels.get(channelId).add(ws);
    
    // Store channel info on the WebSocket
    ws.channelId = channelId;
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'system',
        message: `Welcome to channel: ${channelId}`,
        timestamp: new Date().toISOString(),
        channel: channelId
    }));
    
    // Broadcast to other clients in the same channel
    broadcastToChannel(channelId, {
        type: 'system',
        message: `User joined channel: ${channelId}`,
        timestamp: new Date().toISOString(),
        channel: channelId
    }, ws);
    
    // Handle messages
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            console.log(`📨 Message received in channel ${channelId}:`, message);
            
            // Broadcast message to all clients in the same channel
            broadcastToChannel(channelId, {
                type: 'message',
                message: message.message,
                timestamp: message.timestamp || new Date().toISOString(),
                channel: channelId
            });
            
        } catch (error) {
            console.error('Error parsing message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format',
                timestamp: new Date().toISOString(),
                channel: channelId
            }));
        }
    });
    
    // Handle connection close
    ws.on('close', () => {
        console.log(`❌ Connection closed for channel: ${channelId}`);
        
        // Remove client from channel
        if (channels.has(channelId)) {
            channels.get(channelId).delete(ws);
            
            // Remove empty channels
            if (channels.get(channelId).size === 0) {
                channels.delete(channelId);
            } else {
                // Notify other clients
                broadcastToChannel(channelId, {
                    type: 'system',
                    message: `User left channel: ${channelId}`,
                    timestamp: new Date().toISOString(),
                    channel: channelId
                });
            }
        }
    });
    
    // Handle errors
    ws.on('error', (error) => {
        console.error(`🚨 WebSocket error in channel ${channelId}:`, error);
    });
});

// Function to broadcast message to all clients in a channel
function broadcastToChannel(channelId, message, excludeClient = null) {
    if (channels.has(channelId)) {
        const clients = channels.get(channelId);
        const messageStr = JSON.stringify(message);
        
        clients.forEach(client => {
            if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
                client.send(messageStr);
            }
        });
    }
}

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`🚀 WebSocket server running on port ${PORT}`);
    console.log(`📡 Ready to accept connections for channel: lp607o3i`);
    console.log(`🌐 Connect using: ws://localhost:${PORT}?channel=lp607o3i`);
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
    console.log('\n🔌 Shutting down server...');
    
    // Close all WebSocket connections
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.close();
        }
    });
    
    server.close(() => {
        console.log('✅ Server shut down successfully');
        process.exit(0);
    });
});

// Log active channels periodically
setInterval(() => {
    if (channels.size > 0) {
        console.log(`📊 Active channels: ${Array.from(channels.keys()).join(', ')}`);
        channels.forEach((clients, channelId) => {
            console.log(`   - ${channelId}: ${clients.size} connected clients`);
        });
    }
}, 30000); // Every 30 seconds