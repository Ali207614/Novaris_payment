const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

test('admin removal flow does not call Verifix employee delete', () => {
    const source = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'modules', 'callback_query.js'),
        'utf8'
    );

    assert.equal(/\.deleteEmployee\s*\(/.test(source), false);
});
