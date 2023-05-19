const assert = require('assert');

const {CondictServer, createLogger} = require('../../dist');

const logger = createLogger({stdout: false, files: []});
const config = {
  database: {file: ':memory:'},
};

describe('CondictServer constructor', function() {
  // These tests tend to run a bit slower as they initialise various native
  // modules for the first time.
  this.slow(500);

  it('creates a new server', () => {
    const server = new CondictServer(logger, config);
    assert.strictEqual(server.getLogger(), logger);
    assert.strictEqual(server.getConfig(), config);
    assert(!server.isRunning(), 'Server should not be running');
  });
});

describe('CondictServer start and stop', function() {
  // These tests tend to run a bit slower as they initialise various native
  // modules for the first time.
  this.slow(500);

  it('starts the server', async () => {
    const server = new CondictServer(logger, config);

    assert(!server.isRunning(), 'Server should not be running');

    await server.start();
    assert(server.isRunning(), 'Server should be running');
  });

  it('ignores start() on a running server', async () => {
    const server = new CondictServer(logger, config);

    assert(!server.isRunning(), 'Server should not be running');

    await server.start();
    assert(server.isRunning(), 'Server should be running');

    await server.start();
    assert(server.isRunning(), 'Server should still be running');
  });

  it('stops a running server', async () => {
    const server = new CondictServer(logger, config);

    assert(!server.isRunning(), 'Server should not be running');

    await server.start();
    assert(server.isRunning(), 'Server should be running');

    await server.stop();
    assert(!server.isRunning(), 'Server should no longer be running');
  });

  it('ignores stop() on a stopped server', async () => {
    const server = new CondictServer(logger, config);

    assert(!server.isRunning(), 'Server should not be running');

    await server.start();
    assert(server.isRunning(), 'Server should be running');

    await server.stop();
    assert(!server.isRunning(), 'Server should no longer be running');

    await server.stop();
    assert(!server.isRunning(), 'Server should still not be running');
  });
});
