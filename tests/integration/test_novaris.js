const axios = require('axios');
require('dotenv').config();

async function discover() {
    const baseUrl = process.env.VERIFIX_BASE_URL || 'https://app.verifix.com';
    const clientId = process.env.VERIFIX_CLIENT_ID;
    const clientSecret = process.env.VERIFIX_CLIENT_SECRET;

    try {
        console.log(`Getting token with project_code="novaris", filial_id="1"...`);
        const response = await axios.post(`${baseUrl}/security/oauth/token`, {
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }, {
            headers: { 
                'Content-Type': 'application/json',
                'project_code': 'novaris',
                'filial_id': '1'
            }
        });
        console.log('SUCCESS for novaris!');
    } catch (err) {
        console.log('Failed for novaris:', err.response ? err.response.data : err.message);
    }
}

discover();
