const axios = require('axios');
require('dotenv').config();

async function test(projectCode) {
    const baseUrl = process.env.VERIFIX_BASE_URL || 'https://app.verifix.com';
    const clientId = process.env.VERIFIX_CLIENT_ID;
    const clientSecret = process.env.VERIFIX_CLIENT_SECRET;

    console.log(`--- Testing with project_code="${projectCode}" ---`);
    try {
        const tokenResponse = await axios.post(`${baseUrl}/security/oauth/token`, {
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }, {
            headers: { 
                'Content-Type': 'application/json',
                'project_code': projectCode,
                'filial_id': '1'
            }
        });
        const token = tokenResponse.data.access_token;

        const infoResponse = await axios.post(`${baseUrl}/b/vhr/api/v1/core/filial$info`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'project_code': projectCode,
                'filial_id': '1'
            }
        });
        console.log(`Filial Name for ${projectCode}:`, infoResponse.data.filial_name);

    } catch (err) {
        console.log(`Failed for ${projectCode}:`, err.response ? err.response.data : err.message);
    }
}

async function run() {
    await test('novaris');
    await test('vhr');
}

run();
