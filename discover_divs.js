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

        const divResponse = await axios.post(`${baseUrl}/b/vhr/api/v1/core/division$list`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'project_code': 'novaris'
            }
        });
        console.log('Divisions with project_code=novaris:');
        console.log(JSON.stringify(divResponse.data.data, null, 2));

    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
}

discover();
