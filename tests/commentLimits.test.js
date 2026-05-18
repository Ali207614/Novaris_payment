const test = require('node:test');
const assert = require('node:assert/strict');
const {
    COMMENT_MAX_LENGTH,
    validateCommentLength
} = require('../src/helpers/commentLimits');

test('comment validation accepts values at the default limit', () => {
    const result = validateCommentLength('a'.repeat(COMMENT_MAX_LENGTH));

    assert.equal(result.ok, true);
    assert.equal(result.length, COMMENT_MAX_LENGTH);
});

test('comment validation rejects values above the default limit', () => {
    const result = validateCommentLength('a'.repeat(COMMENT_MAX_LENGTH + 1));

    assert.equal(result.ok, false);
    assert.match(result.message, /Kommentariya juda uzun/);
    assert.match(result.message, new RegExp(String(COMMENT_MAX_LENGTH)));
});
