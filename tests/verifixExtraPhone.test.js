const test = require('node:test');
const assert = require('node:assert/strict');
const verifixController = require('../src/controllers/verifixController');

test('employee primary phone values are read from ad_Extra_Num fields and phone_number is fallback', () => {
    const employee = {
        phone_number: '+998901111111',
        main_phone: '+998902222222',
        mobile_phone: '+998903333333',
        phone: '+998904444444',
        extra_phone: '+998905555555',
        ad_Extra_Num: '+998906666666',
        fields: [
            { code: 'phone_number', value: '+998901111111' },
            { code: 'ad_Extra_Num', value: '+998907777777' }
        ],
        dynamic_fields: [
            { field_name: 'extra_phone', field_value: '+998905555555' },
            { field_name: 'ad_Extra_Num', field_value: '+998908888888' }
        ]
    };

    const { primary, fallback } = verifixController.getVerifixEmployeeSignInPhones(employee);

    assert.deepEqual(primary, [
        '+998906666666',
        '+998907777777',
        '+998908888888'
    ]);
    assert.deepEqual(fallback, [
        '+998901111111'
    ]);
});

test('employee lookup prefers ad_Extra_Num before phone_number fallback', async () => {
    const instance = {
        async post() {
            return {
                data: {
                    data: [
                        {
                            employee_id: 1,
                            state: 'A',
                            phone_number: '+998901111111'
                        },
                        {
                            employee_id: 2,
                            state: 'A',
                            ad_Extra_Num: '+998901111111'
                        }
                    ],
                    meta: { next_cursor: '-1' }
                }
            };
        }
    };

    const matchedEmployee = await verifixController._findEmployeeByPhone(instance, '+998901111111');

    assert.equal(matchedEmployee.employee_id, 2);
});

test('employee lookup does NOT succeed using deprecated extra_phone', async () => {
    const instance = {
        async post() {
            return {
                data: {
                    data: [
                        {
                            employee_id: 1,
                            state: 'A',
                            extra_phone: '+998901111111'
                        }
                    ],
                    meta: { next_cursor: '-1' }
                }
            };
        }
    };

    const matchedEmployee = await verifixController._findEmployeeByPhone(instance, '+998901111111');

    assert.equal(matchedEmployee, null);
});

test('employee lookup matches ad_Extra_Num dynamic field value', async () => {
    const instance = {
        async post() {
            return {
                data: {
                    data: [
                        {
                            employee_id: 1,
                            state: 'A',
                            dynamic_fields: [
                                { field_name: 'ad_Extra_Num', field_value: '+998330094112' }
                            ]
                        }
                    ],
                    meta: { next_cursor: '-1' }
                }
            };
        }
    };

    const matchedEmployee = await verifixController._findEmployeeByPhone(instance, '+998330094112');

    assert.equal(matchedEmployee.employee_id, 1);
});

test('employee lookup matches ad_Extra_Num direct employee field value', async () => {
    const instance = {
        async post() {
            return {
                data: {
                    data: [
                        {
                            employee_id: 1,
                            state: 'A',
                            ad_Extra_Num: '+998330094112'
                        }
                    ],
                    meta: { next_cursor: '-1' }
                }
            };
        }
    };

    const matchedEmployee = await verifixController._findEmployeeByPhone(instance, '+998330094112');

    assert.equal(matchedEmployee.employee_id, 1);
});

test('employee lookup matches ad_Extra_Num inside dynamicFields object', async () => {
    const instance = {
        async post() {
            return {
                data: {
                    data: [
                        {
                            employee_id: 1,
                            state: 'A',
                            dynamicFields: {
                                ad_Extra_Num: '+998330094112'
                            }
                        }
                    ],
                    meta: { next_cursor: '-1' }
                }
            };
        }
    };

    const matchedEmployee = await verifixController._findEmployeeByPhone(instance, '+998330094112');

    assert.equal(matchedEmployee.employee_id, 1);
});

test('employee lookup matches ad_Extra_Num inside additionalFields array', async () => {
    const instance = {
        async post() {
            return {
                data: {
                    data: [
                        {
                            employee_id: 1,
                            state: 'A',
                            additionalFields: [
                                { code: 'ad_Extra_Num', value: '+998330094112' }
                            ]
                        }
                    ],
                    meta: { next_cursor: '-1' }
                }
            };
        }
    };

    const matchedEmployee = await verifixController._findEmployeeByPhone(instance, '+998330094112');

    assert.equal(matchedEmployee.employee_id, 1);
});

test('employee lookup tolerates ad_extra_num field code typo (case/underscore variants)', async () => {
    const instance = {
        async post() {
            return {
                data: {
                    data: [
                        {
                            employee_id: 1,
                            state: 'A',
                            fields: [
                                { code: 'ad_extra_num', value: '+998901111111' }
                            ]
                        }
                    ],
                    meta: { next_cursor: '-1' }
                }
            };
        }
    };

    const matchedEmployee = await verifixController._findEmployeeByPhone(instance, '+998901111111');

    assert.equal(matchedEmployee.employee_id, 1);
});

test('employee lookup falls back to phone_number when ad_Extra_Num is not found or empty', async () => {
    const instance = {
        async post() {
            return {
                data: {
                    data: [
                        {
                            employee_id: 1,
                            state: 'A',
                            phone_number: '+998901111111',
                            ad_Extra_Num: ''
                        }
                    ],
                    meta: { next_cursor: '-1' }
                }
            };
        }
    };

    const matchedEmployee = await verifixController._findEmployeeByPhone(instance, '+998901111111');

    assert.equal(matchedEmployee.employee_id, 1);
});

test('employee lookup scans all pages for ad_Extra_Num before using phone_number fallback', async () => {
    const pages = [
        {
            data: {
                data: [
                    {
                        employee_id: 1,
                        state: 'A',
                        phone_number: '+998901111111'
                    }
                ],
                meta: { next_cursor: 'next-page' }
            }
        },
        {
            data: {
                data: [
                    {
                        employee_id: 2,
                        state: 'A',
                        ad_Extra_Num: '+998901111111'
                    }
                ],
                meta: { next_cursor: '-1' }
            }
        }
    ];
    const instance = {
        async post() {
            return pages.shift();
        }
    };

    const matchedEmployee = await verifixController._findEmployeeByPhone(instance, '+998901111111');

    assert.equal(matchedEmployee.employee_id, 2);
});
