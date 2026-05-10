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

    const combinations = [
        { project: 'vhr', filial: '31437' },
        { project: 'novaris', filial: '31437' },
        { project: 'vhr', filial: '1' },
        { project: 'novaris', filial: '1' }
    ];

    for (const combo of combinations) {
        try {
            console.log(`Testing project_code="${combo.project}", filial_id="${combo.filial}"...`);
            const response = await axios.post(`${baseUrl}/b/vhr/api/v1/core/filial$info`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'project_code': combo.project,
                    'filial_id': combo.filial
                }
            });
            console.log('SUCCESS!');
            console.log('Data:', response.data);
            return;
        } catch (err) {
            // console.log('Failed:', err.response ? err.response.data : err.message);
        }
    }
    console.log('All combinations failed.');
}

discover();
