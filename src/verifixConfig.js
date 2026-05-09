require('dotenv').config();

module.exports = {
    verifix: {
        baseUrl: process.env.VERIFIX_BASE_URL || 'https://app.verifix.com',
        clientId: process.env.VERIFIX_CLIENT_ID || '',
        clientSecret: process.env.VERIFIX_CLIENT_SECRET || '',
        projectCode: process.env.VERIFIX_PROJECT_CODE || '',
        filialId: process.env.VERIFIX_FILIAL_ID || '',
    }
};