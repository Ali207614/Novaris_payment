const axios = require('axios');
require('dotenv').config();

async function discover() {
    const baseUrl = process.env.VERIFIX_BASE_URL || 'https://app.verifix.com';
    const clientId = process.env.VERIFIX_CLIENT_ID;
    const clientSecret = process.env.VERIFIX_CLIENT_SECRET;

    console.log('Getting token...');
    let token;
    try {
        const response = await axios.post(`${baseUrl}/security/oauth/token`, {
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        token = response.data.access_token;
        console.log('Token obtained!');
    } catch (err) {
        console.error('Failed to get token:', err.response ? err.response.data : err.message);
        return;
    }

    const endpoints = [
        '/api/v1/filials',
        '/api/v1/project/info',
        '/b/vhr/api/v1/core/project$info',
        '/b/vhr/api/v1/core/filial$list'
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`Trying GET ${endpoint}...`);
            const response = await axios.get(`${baseUrl}${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`Success GET ${endpoint}:`, JSON.stringify(response.data, null, 2));
        } catch (err) {
            console.log(`Failed GET ${endpoint}:`, err.response ? err.response.status : err.message);
            
            // Try POST just in case (most Verifix endpoints use POST)
            try {
                console.log(`Trying POST ${endpoint}...`);
                const postResponse = await axios.post(`${baseUrl}${endpoint}`, {}, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                console.log(`Success POST ${endpoint}:`, JSON.stringify(postResponse.data, null, 2));
            } catch (postErr) {
                console.log(`Failed POST ${endpoint}:`, postErr.response ? postErr.response.status : postErr.message);
            }
        }
    }
}

discover();
