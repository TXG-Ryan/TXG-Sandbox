const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Function to check server status
async function checkServer(url) {
    try {
        const response = await axios.get(url, { timeout: 5000 }); // Set timeout as 5 seconds
        if (response.status === 200) {
            return 'online';
        } else {
            return 'degraded'; // You can refine this based on specific status codes
        }
    } catch (error) {
        return 'offline';
    }
}

// API endpoint for status
app.get('/api/status', async (req, res) => {
    const publicStatus = await checkServer('https://www.grabtalent.io/');
    const uatStatus = await checkServer('https://uat.grabtalent.ie/');
    res.json({ "Public": publicStatus, "UAT": uatStatus, "Sandbox": "offline" }); // Sandbox static for now
});

// Serve index.html for root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
