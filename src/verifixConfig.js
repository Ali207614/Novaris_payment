require('dotenv').config();

function optionalEnv(name, placeholders = []) {
    const value = (process.env[name] || '').trim();
    if (!value || placeholders.includes(value)) {
        return '';
    }
    return value;
}

module.exports = {
    verifix: {
        baseUrl: optionalEnv('VERIFIX_BASE_URL') || 'https://app.verifix.com',
        clientId: optionalEnv('VERIFIX_CLIENT_ID', ['your_client_id_here']),
        clientSecret: optionalEnv('VERIFIX_CLIENT_SECRET', ['your_client_secret_here']),
        projectCode: optionalEnv('VERIFIX_PROJECT_CODE', ['your_project_code_here']),
        filialId: optionalEnv('VERIFIX_FILIAL_ID', ['your_filial_id_here']),
        factValueUnit: optionalEnv('VERIFIX_FACT_VALUE_UNIT') || 'seconds',
        timeKinds: {
            present: Number(optionalEnv('VERIFIX_TIME_KIND_PRESENT_ID')) || 81,
            late: Number(optionalEnv('VERIFIX_TIME_KIND_LATE_ID')) || 82,
            earlyLeave: Number(optionalEnv('VERIFIX_TIME_KIND_EARLY_LEAVE_ID')) || 83,
            absence: Number(optionalEnv('VERIFIX_TIME_KIND_ABSENCE_ID')) || 84
        }
    }
};
