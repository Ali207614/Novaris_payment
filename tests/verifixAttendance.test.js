const test = require('node:test');
const assert = require('node:assert/strict');
const {
    extractVerifixAttendanceCorrections,
    hasExistingTrack,
    normalizeTime,
    syncVerifixAttendanceForRequest
} = require('../src/helpers/verifixAttendance');

test('Verifix attendance parser accepts common date and time formats', () => {
    const corrections = extractVerifixAttendanceCorrections(`
Sana: 01.07.2025
Kelish(vaqt): 8:00
Ketish(vaqt): 18.30

Sana: 30.06.25
Kelish(vaqt): 07;00

Sana: 2025.07.03
Ketish(vaqt): 19:15
`);

    assert.deepEqual(corrections, [
        { date: '2025-07-01', arrivalTime: '08:00:00', exitTime: '18:30:00' },
        { date: '2025-06-30', arrivalTime: '07:00:00', exitTime: '' },
        { date: '2025-07-03', arrivalTime: '', exitTime: '19:15:00' }
    ]);
});

test('Verifix attendance parser applies one time pair to multiple dates', () => {
    const corrections = extractVerifixAttendanceCorrections(`
Sana: 01.07.2025, 2025.07.03
Kelish(vaqt): 8.00
Ketish(vaqt): 17:45
`);

    assert.deepEqual(corrections, [
        { date: '2025-07-01', arrivalTime: '08:00:00', exitTime: '17:45:00' },
        { date: '2025-07-03', arrivalTime: '08:00:00', exitTime: '17:45:00' }
    ]);
});

test('Verifix attendance parser accepts blank arrival or exit values', () => {
    const corrections = extractVerifixAttendanceCorrections(`
Sana: 01.07.2025
Kelish(vaqt):
Ketish(vaqt): 18:00
`);

    assert.deepEqual(corrections, [
        { date: '2025-07-01', arrivalTime: '', exitTime: '18:00:00' }
    ]);
    assert.equal(normalizeTime(''), '');
});

test('existing Verifix tracks are detected by employee, type and datetime', () => {
    assert.equal(
        hasExistingTrack(
            [{ employee_id: 77, track_type: 'I', track_datetime: '2025-07-01T08:00:00+05:00' }],
            77,
            'I',
            '2025-07-01 08:00:00'
        ),
        true
    );
});

test('Verifix attendance sync creates requester-only missing I/O marks', async () => {
    const created = [];
    const listCalls = [];
    const verifixController = {
        async listTracks(filters) {
            listCalls.push(filters);
            return {
                status: true,
                data: [
                    {
                        employee_id: 77,
                        track_type: 'I',
                        track_datetime: '2025-07-01 08:00:00'
                    }
                ]
            };
        },
        async createTrack(payload) {
            created.push(payload);
            return { status: true };
        }
    };

    const result = await syncVerifixAttendanceForRequest({
        request: {
            menu: 11,
            comment: 'Sana: 01.07.2025\nKelish(vaqt): 8:00\nKetish(vaqt): 18:00'
        },
        requester: { EmployeeID: 77 },
        verifixController
    });

    assert.equal(result.status, true);
    assert.equal(result.created, 1);
    assert.equal(result.duplicateSkipped, 1);
    assert.deepEqual(listCalls[0].employee_ids, [77]);
    assert.deepEqual(created, [
        {
            employee_id: 77,
            track_type: 'O',
            track_datetime: '2025-07-01 18:00:00',
            mark_type: 'C',
            comment: 'Sana: 01.07.2025\nKelish(vaqt): 8:00\nKetish(vaqt): 18:00'
        }
    ]);
});

test('Verifix attendance sync fails without a parseable correction', async () => {
    let createCalled = false;
    const result = await syncVerifixAttendanceForRequest({
        request: { menu: 11, comment: 'Sana yoq' },
        requester: { EmployeeID: 77 },
        verifixController: {
            async listTracks() {
                return { status: true, data: [] };
            },
            async createTrack() {
                createCalled = true;
                return { status: true };
            }
        }
    });

    assert.equal(result.status, false);
    assert.equal(createCalled, false);
});
