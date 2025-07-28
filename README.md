# WebSocket Server Connection - Channel lp607o3i

This project includes a WebSocket server and client implementation for connecting to channel `lp607o3i`.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the WebSocket Server
```bash
npm start
```

The server will start on port 8080 by default.

### 3. Open the Web Client
Open `index.html` in your web browser. You'll see a connection panel in the top-right corner.

## Features

### Server Connection Panel
- **Status Display**: Shows current connection status for channel `lp607o3i`
- **Connect Button**: Establishes connection to the WebSocket server
- **Disconnect Button**: Closes the connection
- **Messages Button**: Opens/closes the messages panel

### Messages Panel
- **Real-time Messaging**: Send and receive messages in the channel
- **Message History**: View all messages in the channel
- **Enter Key Support**: Press Enter to send messages quickly

## Connection Details

- **Channel ID**: `lp607o3i`
- **Server URL**: `ws://localhost:8080`
- **Protocol**: WebSocket (ws://)

## How It Works

1. The client automatically attempts to connect when the page loads
2. All messages are broadcast to other clients in the same channel
3. System messages notify when users join/leave the channel
4. Connection status is displayed with color coding:
   - 🟢 Green: Connected
   - 🔴 Red: Disconnected
   - 🟠 Orange: Error

## Server Features

- **Multi-channel Support**: Each channel operates independently
- **Automatic Reconnection**: Client attempts to reconnect on disconnection
- **Message Broadcasting**: Messages are sent to all clients in the same channel
- **Connection Logging**: Server logs all connections and messages

## Troubleshooting

1. **Connection Failed**: Make sure the server is running (`npm start`)
2. **Port Already in Use**: Change the PORT environment variable
3. **Browser Console**: Check for error messages in browser developer tools

## Usage Example

```javascript
// Manual connection
serverConnection.connect('ws://localhost:8080');

// Send a message
serverConnection.sendMessage('Hello, channel lp607o3i!');

// Disconnect
serverConnection.disconnect();
```

## Server Configuration

The server can be configured using environment variables:

```bash
PORT=8080 npm start
```

Default settings:
- Port: 8080
- Channel: lp607o3i (specified in client)
- Reconnection attempts: 5
- Reconnection delay: 1 second (increasing)