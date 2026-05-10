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

    const guesses = [
        { project: 'novaris', filial: '1' },
        { project: 'vhr', filial: '1' },
        { project: 'NOVARIS', filial: '1' },
        { project: 'novaris', filial: '100' },
        { project: 'vhr', filial: '100' }
    ];

    for (const guess of guesses) {
        try {
            console.log(`Trying project_code="${guess.project}", filial_id="${guess.filial}"...`);
            const response = await axios.post(`${baseUrl}/b/vhr/api/v1/core/filial$info`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'project_code': guess.project,
                    'filial_id': guess.filial
                }
            });
            console.log('SUCCESS!');
            console.log('Response data:', JSON.stringify(response.data, null, 2));
            return;
        } catch (err) {
            console.log('Failed:', err.response ? err.response.data : err.message);
        }
    }
    console.log('All guesses failed.');
}

discover();
