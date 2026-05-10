const axios = require('axios');
require('dotenv').config();

async function discover() {
    const baseUrl = process.env.VERIFIX_BASE_URL || 'https://app.verifix.com';
    const clientId = process.env.VERIFIX_CLIENT_ID;
    const clientSecret = process.env.VERIFIX_CLIENT_SECRET;

    try {
        const tokenResponse = await axios.post(`${baseUrl}/security/oauth/token`, {
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        const token = tokenResponse.data.access_token;

        const endpoints = [
            '/b/biruni/m:company$info',
            '/b/biruni/m:company$list',
            '/b/vhr/api/v1/core/company$info'
        ];

        for (const endpoint of endpoints) {
            try {
                console.log(`Trying ${endpoint}...`);
                const response = await axios.post(`${baseUrl}${endpoint}`, {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log(`Success ${endpoint}:`, response.data);
            } catch (e) {}
        }

    } catch (err) {}
}

discover();
