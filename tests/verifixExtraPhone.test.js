const test = require('node:test');
const assert = require('node:assert/strict');
const verifixController = require('../src/controllers/verifixController');

test('employee primary phone values are read only from extra_phone fields', () => {
    const employee = {
        phone_number: '+998901111111',
        main_phone: '+998902222222',
        mobile_phone: '+998903333333',
        phone: '+998904444444',
        extra_phone: '+998905555555',
        fields: [
            { code: 'phone_number', value: '+998906666666' },
            { code: 'extra_phone', value: '+998907777777' }
        ],
        dynamic_fields: [
            { field_name: 'main_phone', value: '+998908888888' },
            { field_name: 'extra_phone', field_value: '+998909999999' }
        ]
    };

    assert.deepEqual(verifixController._employeePhoneValues(employee), [
        '+998905555555',
        '+998907777777',
        '+998909999999'
    ]);
});

test('employee lookup prefers extra_phone before phone_number fallback', async () => {
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
                            extra_phone: '+998901111111'
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

test('employee lookup matches documented fields extra_phone value', async () => {
    const instance = {
        async post() {
            return {
                data: {
                    data: [
                        {
                            employee_id: 1,
                            state: 'A',
                            fields: [
                                { code: 'extra_phone', value: '+998901111111' }
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

test('employee lookup tolerates exrta_phone field code typo', async () => {
    const instance = {
        async post() {
            return {
                data: {
                    data: [
                        {
                            employee_id: 1,
                            state: 'A',
                            fields: [
                                { code: 'exrta_phone', value: '+998901111111' }
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

test('employee lookup falls back to phone_number when extra_phone is not found', async () => {
    const instance = {
        async post() {
            return {
                data: {
                    data: [
                        {
                            employee_id: 1,
                            state: 'A',
                            phone_number: '+998901111111',
                            extra_phone: '+998902222222'
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

test('employee lookup scans all pages for extra_phone before using phone_number fallback', async () => {
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
                        extra_phone: '+998901111111'
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
