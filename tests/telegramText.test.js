const test = require('node:test');
const assert = require('node:assert/strict');
const {
    TELEGRAM_SAFE_MESSAGE_LIMIT,
    splitTelegramText
} = require('../src/helpers/telegramText');

test('Telegram text splitter keeps chunks under safe message limit', () => {
    const chunks = splitTelegramText('a'.repeat(TELEGRAM_SAFE_MESSAGE_LIMIT + 250));

    assert.equal(chunks.length, 2);
    assert.ok(chunks.every(chunk => chunk.length <= TELEGRAM_SAFE_MESSAGE_LIMIT));
    assert.equal(chunks.join('').length, TELEGRAM_SAFE_MESSAGE_LIMIT + 250);
});

test('Telegram text splitter handles a single overlong word', () => {
    const chunks = splitTelegramText('x'.repeat(TELEGRAM_SAFE_MESSAGE_LIMIT * 2 + 10));

    assert.equal(chunks.length, 3);
    assert.ok(chunks.every(chunk => chunk.length <= TELEGRAM_SAFE_MESSAGE_LIMIT));
    assert.equal(chunks.join(''), 'x'.repeat(TELEGRAM_SAFE_MESSAGE_LIMIT * 2 + 10));
});

test('Telegram text splitter prefers line boundaries when possible', () => {
    const chunks = splitTelegramText(`first\n${'b'.repeat(TELEGRAM_SAFE_MESSAGE_LIMIT)}\nthird`);

    assert.ok(chunks.length >= 2);
    assert.ok(chunks.every(chunk => chunk.length <= TELEGRAM_SAFE_MESSAGE_LIMIT));
    assert.equal(chunks.join('\n').replace(/\n\n/g, '\n'), `first\n${'b'.repeat(TELEGRAM_SAFE_MESSAGE_LIMIT)}\nthird`);
});
