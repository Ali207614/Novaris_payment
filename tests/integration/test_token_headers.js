const axios = require('axios');
require('dotenv').config();

async function discover() {
    const baseUrl = process.env.VERIFIX_BASE_URL || 'https://app.verifix.com';
    const clientId = process.env.VERIFIX_CLIENT_ID;
    const clientSecret = process.env.VERIFIX_CLIENT_SECRET;

    const guesses = [
        { project: 'vhr', filial: '1' },
        { project: 'novaris', filial: '1' },
        { project: 'app', filial: '1' }
    ];

    for (const guess of guesses) {
        try {
            console.log(`Getting token with project_code="${guess.project}", filial_id="${guess.filial}"...`);
            const response = await axios.post(`${baseUrl}/security/oauth/token`, {
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret
            }, {
                headers: { 
                    'Content-Type': 'application/json',
                    'project_code': guess.project,
                    'filial_id': guess.filial
                }
            });
            console.log('SUCCESS! Token obtained with these headers.');
            console.log('Token:', response.data.access_token);
            return;
        } catch (err) {
            console.log('Failed:', err.response ? err.response.data : err.message);
        }
    }
}

discover();
