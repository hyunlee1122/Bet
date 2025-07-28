// Server Connection Handler
class ServerConnection {
    constructor(channelId) {
        this.channelId = channelId;
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
    }

    connect(serverUrl = 'ws://localhost:8080') {
        try {
            console.log(`Attempting to connect to server with channel: ${this.channelId}`);
            
            // Create WebSocket connection
            this.socket = new WebSocket(`${serverUrl}?channel=${this.channelId}`);
            
            // Connection opened
            this.socket.onopen = (event) => {
                console.log(`✅ Connected to server in channel: ${this.channelId}`);
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.onConnectionOpen(event);
            };

            // Listen for messages
            this.socket.onmessage = (event) => {
                console.log('📨 Message received:', event.data);
                this.onMessageReceived(event.data);
            };

            // Connection closed
            this.socket.onclose = (event) => {
                console.log(`❌ Connection closed for channel: ${this.channelId}`);
                this.isConnected = false;
                this.onConnectionClosed(event);
                
                // Attempt to reconnect
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.attemptReconnect();
                }
            };

            // Connection error
            this.socket.onerror = (error) => {
                console.error(`🚨 Connection error for channel ${this.channelId}:`, error);
                this.onConnectionError(error);
            };

        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
        }
    }

    attemptReconnect() {
        this.reconnectAttempts++;
        console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            this.connect();
        }, this.reconnectDelay * this.reconnectAttempts);
    }

    sendMessage(message) {
        if (this.isConnected && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                channel: this.channelId,
                message: message,
                timestamp: new Date().toISOString()
            }));
            console.log('📤 Message sent:', message);
        } else {
            console.warn('Cannot send message: Not connected to server');
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            console.log(`🔌 Disconnected from channel: ${this.channelId}`);
        }
    }

    // Event handlers (can be overridden)
    onConnectionOpen(event) {
        // Override this method to handle connection open
        this.updateConnectionStatus('Connected');
    }

    onMessageReceived(data) {
        // Override this method to handle received messages
        try {
            const parsedData = JSON.parse(data);
            this.displayMessage(parsedData);
        } catch (error) {
            this.displayMessage({ message: data });
        }
    }

    onConnectionClosed(event) {
        // Override this method to handle connection close
        this.updateConnectionStatus('Disconnected');
    }

    onConnectionError(error) {
        // Override this method to handle connection errors
        this.updateConnectionStatus('Error');
    }

    // UI Helper methods
    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            statusElement.textContent = `Status: ${status} (Channel: ${this.channelId})`;
            statusElement.className = `connection-status ${status.toLowerCase()}`;
        }
    }

    displayMessage(data) {
        const messagesContainer = document.getElementById('messages-container');
        if (messagesContainer) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.innerHTML = `
                <span class="timestamp">${data.timestamp || new Date().toLocaleTimeString()}</span>
                <span class="content">${data.message || JSON.stringify(data)}</span>
            `;
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
}

// Initialize connection with the specified channel
const serverConnection = new ServerConnection('lp607o3i');

// Auto-connect when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing server connection...');
    
    // Try different server URLs
    const serverUrls = [
        'ws://localhost:8080',
        'ws://localhost:3000', 
        'wss://your-server-domain.com'  // Replace with actual server URL
    ];
    
    // Connect to the first available server
    serverConnection.connect(serverUrls[0]);
});

// UI Helper functions
function toggleMessagesPanel() {
    const panel = document.getElementById('messages-panel');
    if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
}

function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    if (message && serverConnection.isConnected) {
        serverConnection.sendMessage(message);
        input.value = '';
    } else if (!serverConnection.isConnected) {
        alert('Not connected to server. Please connect first.');
    }
}

// Handle Enter key in message input
document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
});

// Add CSS styles for connection status
const style = document.createElement('style');
style.textContent = `
    .connection-status.connected {
        color: #4CAF50 !important;
    }
    .connection-status.disconnected {
        color: #f44336 !important;
    }
    .connection-status.error {
        color: #ff9800 !important;
    }
    .message {
        margin: 2px 0;
        padding: 2px 5px;
        border-left: 2px solid #666;
        font-size: 11px;
    }
    .message .timestamp {
        color: #888;
        margin-right: 8px;
    }
    .message .content {
        color: #fff;
    }
`;
document.head.appendChild(style);

// Export for global access
window.ServerConnection = ServerConnection;
window.serverConnection = serverConnection;
window.toggleMessagesPanel = toggleMessagesPanel;
window.sendMessage = sendMessage;