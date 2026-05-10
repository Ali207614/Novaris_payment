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

        const empResponse = await axios.post(`${baseUrl}/b/vhr/api/v1/core/employee$list`, { limit: 1 }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Full Employee Data:', JSON.stringify(empResponse.data.data[0], null, 2));

    } catch (err) {
        console.error('Error:', err.message);
    }
}

discover();
