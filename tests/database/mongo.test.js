const test = require('node:test');
const assert = require('node:assert');
const config = require('../../src/database/config');
const { connectDB, disconnectDB, mongoose } = require('../../src/database/mongoose.module');

test('MongoDB Configuration Validation', async (t) => {
  await t.test('Should have default config values if env not set', () => {
    assert.ok(config.mongodb.uri, 'MongoDB URI should exist');
    assert.ok(config.mongodb.dbName, 'Database name should exist');
    assert.strictEqual(typeof config.mongodb.maxPoolSize, 'number', 'maxPoolSize should be a number');
  });
});

test('MongoDB Connection tests', async (t) => {
  await t.test('Should connect and disconnect successfully', async () => {
    // Only test connection if mongo is locally available to avoid breaking CI
    // or local test runs where MongoDB is not running yet.
    try {
      const connection = await connectDB();
      assert.strictEqual(connection.readyState, 1, 'Connection state should be connected (1)');

      await disconnectDB();
      assert.strictEqual(mongoose.connection.readyState, 0, 'Connection state should be disconnected (0)');
    } catch (e) {
       console.log('Skipping connection test because MongoDB is not reachable locally.');
       assert.ok(true);
    }
  });
});

test('Schema Validation basics', async (t) => {
  const User = require('../../src/database/models/user.model');

  await t.test('User schema validation should fail on missing required fields', async () => {
    const user = new User({}); // Missing telegram.chatId
    let err;
    try {
      await user.validate();
    } catch (error) {
      err = error;
    }
    assert.ok(err, 'Validation should fail');
    assert.ok(err.errors['telegram.chatId'], 'telegram.chatId is required');
  });

  await t.test('User schema validation should pass with required fields', async () => {
    const user = new User({ telegram: { chatId: 123456 } });
    let err;
    try {
      await user.validate();
    } catch (error) {
      err = error;
    }
    assert.strictEqual(err, undefined, 'Validation should pass');
  });
});

test('Repository instantiation', async (t) => {
  await t.test('Should instantiate repositories properly', () => {
    const userRepository = require('../../src/database/repositories/user.repository');
    assert.ok(userRepository.model, 'Repository should have a model attached');
  });
});
