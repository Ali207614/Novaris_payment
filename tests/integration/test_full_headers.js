const axios = require('axios');
require('dotenv').config();

async function test() {
    const baseUrl = process.env.VERIFIX_BASE_URL || 'https://app.verifix.com';
    const clientId = process.env.VERIFIX_CLIENT_ID;
    const clientSecret = process.env.VERIFIX_CLIENT_SECRET;

    const project = 'NOVARIS';
    const filial = '1';

    try {
        console.log(`Getting token with headers: project=${project}, filial=${filial}...`);
        const tokenResponse = await axios.post(`${baseUrl}/security/oauth/token`, {
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }, {
            headers: { 
                'Content-Type': 'application/json',
                'project_code': project,
                'filial_id': filial
            }
        });
        const token = tokenResponse.data.access_token;
        console.log('Token obtained!');

        const infoResponse = await axios.post(`${baseUrl}/b/vhr/api/v1/core/filial$info`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'project_code': project,
                'filial_id': filial
            }
        });
        console.log(`Success! Filial Name:`, infoResponse.data.filial_name);

    } catch (err) {
        console.log(`Failed:`, err.response ? err.response.data : err.message);
    }
}

test();
