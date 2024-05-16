const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
