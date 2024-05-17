const express = require('express');
const axios = require('axios');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Create an HTTP server
const server = http.createServer(app);

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Function to check server status and measure ping
async function checkServer(url) {
    const start = Date.now();
    try {
        const response = await axios.get(url, { timeout: 5000 }); // Set timeout as 5 seconds
        const ping = Date.now() - start;
        if (response.status === 200) {
            return { status: 'online', ping };
        } else {
            return { status: 'degraded', ping };
        }
    } catch (error) {
        const ping = Date.now() - start;
        return { status: 'offline', ping };
    }
}

// Broadcast status to all connected clients
async function broadcastStatus() {
    const publicStatus = await checkServer('https://www.grabtalent.io/');
    const uatStatus = await checkServer('https://uat.grabtalent.ie/');
    const utilityStatus = await checkServer('https://txg-sandbox.onrender.com/');
    const staffStatus = await checkServer('https://uat.grabtalent.ie/management/dashboard');

    const status = {
        "Public": publicStatus,
        "UAT": uatStatus,
        "Utility": utilityStatus,
        "Staff Tools": staffStatus
    };

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(status));
        }
    });

    return status; // Return the status for API endpoint
}

// Set interval to check and broadcast status every 10 seconds
setInterval(broadcastStatus, 10000);

// Serve index.html for root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to get the status and ping information
app.get('/api/status', async (req, res) => {
    const status = await broadcastStatus();
    res.json(status);
});

// Handle WebSocket connections
wss.on('connection', ws => {
    console.log('Client connected');
    ws.send(JSON.stringify({ message: 'Connected to WebSocket server' }));
    // Optionally send initial status upon connection
    broadcastStatus();
});

// Start the server
server.listen(port, () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});
