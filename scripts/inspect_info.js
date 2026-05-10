const axios = require('axios');
require('dotenv').config();

async function discover() {
    const baseUrl = process.env.VERIFIX_BASE_URL || 'https://app.verifix.com';
    const clientId = process.env.VERIFIX_CLIENT_ID;
    const clientSecret = process.env.VERIFIX_CLIENT_SECRET;

    try {
        const response = await axios.post(`${baseUrl}/security/oauth/token`, {
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        const token = response.data.access_token;

        const infoResponse = await axios.post(`${baseUrl}/b/vhr/api/v1/core/filial$info`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Filial Info:', JSON.stringify(infoResponse.data, null, 2));

        // Let's try to find project code in the me info if possible
        try {
            const meResponse = await axios.post(`${baseUrl}/b/biruni/m:me`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Me Info:', JSON.stringify(meResponse.data, null, 2));
        } catch (e) {}

    } catch (err) {
        console.error('Error:', err.message);
    }
}

discover();
