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
    } catch (err) {
        console.error('Failed to get token');
        return;
    }

    try {
        console.log(`Testing project_code="${clientId}", filial_id="1"...`);
        const response = await axios.post(`${baseUrl}/b/vhr/api/v1/core/filial$info`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'project_code': clientId,
                'filial_id': '1'
            }
        });
        console.log('SUCCESS!');
        console.log('Data:', response.data);
    } catch (err) {
        console.log('Failed:', err.response ? err.response.data : err.message);
    }
}

discover();
