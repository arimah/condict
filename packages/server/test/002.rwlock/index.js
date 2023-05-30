const assert = require('assert');

const {_INTERNAL_RwLock: RwLock} = require('../../dist');

describe('RwLock', () => {
  const assertGuard = (g, disposition) => {
    const reader = disposition === 'reader';
    const writer = disposition === 'writer';
    const valid = reader || writer;

    assert(
      g.guard.isValid === valid,
      valid ? 'Guard should be valid' : 'Guard should be revoked'
    );
    assert(
      g.guard.isReader === reader,
      reader ? 'Guard should be a reader' : 'Guard should not be a reader'
    );
    assert(
      g.guard.isWriter === writer,
      writer ? 'Guard should be a writer' : 'Guard should not be a writer'
    );
  };

  const assertEvent = (actual, events) => {
    assert.strictEqual(actual, events.shift());
  };

  const assertNoMoreEvents = events => {
    assert.deepStrictEqual(events, []);
  };

  const heldLock = (guard, name, events) => ({
    guard,
    upgrade: async () => {
      assertEvent(`${name}: request upgrade`, events);
      try {
        await guard.upgrade();
        assertEvent(`${name}: upgraded`, events);
      } catch (e) {
        assertEvent(`${name}: upgrade rejected: ${e.message}`, events);
      }
    },
    downgrade: () => {
      assertEvent(`${name}: request downgrade`, events);
      try {
        guard.downgrade();
        assertEvent(`${name}: downgraded`, events);
      } catch (e) {
        assertEvent(`${name}: downgrade rejected: ${e.message}`, events);
      }
    },
    finish: () => {
      guard.finish();
      assertEvent(`${name}: disposed`, events);
    },
  });

  const reader = async (lock, name, events) => {
    assertEvent(`${name}: request reader`, events);
    const guard = await lock.reader();
    assertEvent(`${name}: acquired reader`, events);
    return heldLock(guard, name, events);
  };

  const writer = async (lock, name, events) => {
    assertEvent(`${name}: request writer`, events);
    const guard = await lock.writer();
    assertEvent(`${name}: acquired writer`, events);
    return heldLock(guard, name, events);
  };

  it('closes the lock with no issued guards', async () => {
    const lock = new RwLock();
    assert(!lock.isClosed, 'Lock should not be closed');

    await lock.close();
    assert(lock.isClosed, 'Lock should be closed');
  });

  it('issues a single reader', async () => {
    const lock = new RwLock();

    const events = [
      'r: request reader',
      'r: acquired reader',
    ];
    const r = await reader(lock, 'r', events);
    assertGuard(r, 'reader');

    events.push('r: disposed');
    r.finish();
    assertGuard(r, null);

    await lock.close();
    assertNoMoreEvents(events);
  });

  it('issues two simultaneous readers', async () => {
    const lock = new RwLock();

    const events = [
      'r1: request reader',
      'r1: acquired reader',
      'r2: request reader',
      'r2: acquired reader',
    ];
    const r1 = await reader(lock, 'r1', events);
    assertGuard(r1, 'reader');

    const r2 = await reader(lock, 'r2', events);
    assertGuard(r2, 'reader');

    events.push('r1: disposed');
    r1.finish();
    assertGuard(r1, null);

    events.push('r2: disposed');
    r2.finish();
    assertGuard(r2, null);

    await lock.close();
    assertNoMoreEvents(events);
  });

  it('issues a single writer', async () => {
    const lock = new RwLock();

    const events = [
      'w: request writer',
      'w: acquired writer',
    ];
    const w = await writer(lock, 'w', events);
    assertGuard(w, 'writer');

    events.push('w: disposed');
    w.finish();
    assertGuard(w, null);

    await lock.close();
    assertNoMoreEvents(events);
  });

  it('issues a writer when a single reader finishes', async () => {
    const lock = new RwLock();

    const events = [
      'r: request reader',
      'r: acquired reader',
    ];
    const r = await reader(lock, 'r', events);
    assertGuard(r, 'reader');

    events.push('w: request writer');
    const wp = writer(lock, 'w', events);

    events.push('r: disposed');
    r.finish();
    assertGuard(r, null);

    events.push('w: acquired writer');
    const w = await wp;
    assertGuard(w, 'writer');

    events.push('w: disposed');
    w.finish();
    assertGuard(w, null);

    await lock.close();
    assertNoMoreEvents(events);
  });

  it('issues a writer when all readers have finished', async () => {
    const lock = new RwLock();

    const events = [
      'r1: request reader',
      'r2: request reader',
      'r1: acquired reader',
      'r2: acquired reader',
    ];
    const [r1, r2] = await Promise.all([
      reader(lock, 'r1', events),
      reader(lock, 'r2', events),
    ]);
    assertGuard(r1, 'reader');
    assertGuard(r2, 'reader');

    events.push('w: request writer');
    const wp = writer(lock, 'w', events);

    events.push('r1: disposed');
    r1.finish();
    assertGuard(r1, null);

    events.push('r2: disposed');
    r2.finish();
    assertGuard(r2, null);

    events.push('w: acquired writer');
    const w = await wp;
    assertGuard(w, 'writer');

    events.push('w: disposed');
    w.finish();
    assertGuard(w, null);

    await lock.close();
    assertNoMoreEvents(events);
  });

  it('issues pending readers when a writer finishes', async () => {
    const lock = new RwLock();

    const events = [
      'w: request writer',
      'w: acquired writer',
    ];
    const w = await writer(lock, 'w', events);
    assertGuard(w, 'writer');

    events.push('r1: request reader');
    const r1p = reader(lock, 'r1', events);

    events.push('r2: request reader');
    const r2p = reader(lock, 'r2', events);

    events.push('w: disposed');
    w.finish();

    events.push(
      'r1: acquired reader',
      'r2: acquired reader'
    );
    const r1 = await r1p;
    assertGuard(r1, 'reader');

    const r2 = await r2p;
    assertGuard(r2, 'reader');

    events.push('r1: disposed');
    r1.finish();
    assertGuard(r1, null);

    events.push('r2: disposed');
    r2.finish();
    assertGuard(r2, null);

    await lock.close();
    assertNoMoreEvents(events);
  });

  it('issues a writer when the current writer finishes', async () => {
    const lock = new RwLock();

    const events = [
      'w1: request writer',
      'w1: acquired writer',
    ];
    const w1 = await writer(lock, 'w1', events);
    assertGuard(w1, 'writer');

    events.push('w2: request writer');
    const w2p = writer(lock, 'w2', events);

    events.push('w1: disposed');
    w1.finish();
    assertGuard(w1, null);

    events.push('w2: acquired writer');
    const w2 = await w2p;
    assertGuard(w2, 'writer');

    events.push('w2: disposed');
    w2.finish();
    assertGuard(w2, null);

    await lock.close();
    assertNoMoreEvents(events);
  });

  it('upgrades a reader', async () => {
    const lock = new RwLock();

    const events = [
      'g: request reader',
      'g: acquired reader',
    ];
    const g = await reader(lock, 'g', events);
    assertGuard(g, 'reader');

    events.push(
      'g: request upgrade',
      'g: upgraded'
    );
    await g.upgrade();
    assertGuard(g, 'writer');

    events.push('g: disposed');
    g.finish();
    assertGuard(g, null);

    await lock.close();
    assertNoMoreEvents(events);
  });

  it('downgrades a writer', async () => {
    const lock = new RwLock();

    const events = [
      'g: request writer',
      'g: acquired writer',
    ];
    const g = await writer(lock, 'g', events);
    assertGuard(g, 'writer');

    events.push(
      'g: request downgrade',
      'g: downgraded'
    );
    g.downgrade();
    assertGuard(g, 'reader');

    events.push('g: disposed');
    g.finish();
    assertGuard(g, null);

    await lock.close();
    assertNoMoreEvents(events);
  });

  it('issues pending readers after downgrading a writer', async () => {
    const lock = new RwLock();

    const events = [
      'g: request writer',
      'g: acquired writer',
    ];
    const g = await writer(lock, 'g', events);
    assertGuard(g, 'writer');

    events.push('r1: request reader');
    const r1p = reader(lock, 'r1', events);

    events.push('r2: request reader');
    const r2p = reader(lock, 'r2', events);

    events.push(
      'g: request downgrade',
      'g: downgraded'
    );
    g.downgrade();
    assertGuard(g, 'reader');

    events.push(
      'r1: acquired reader',
      'r2: acquired reader'
    );
    const r1 = await r1p;
    assertGuard(r1, 'reader');

    const r2 = await r2p;
    assertGuard(r2, 'reader');

    events.push('g: disposed');
    g.finish();
    assertGuard(g, null);

    events.push('r1: disposed');
    r1.finish();
    assertGuard(r1, null);

    events.push('r2: disposed');
    r2.finish();
    assertGuard(r2, null);

    await lock.close();
    assertNoMoreEvents(events);
  });

  it('closes the lock after the outstanding reader finishes', async () => {
    const lock = new RwLock();

    const events = [
      'r: request reader',
      'r: acquired reader',
    ];
    const r = await reader(lock, 'r', events);
    assertGuard(r, 'reader');

    const closep = lock.close().then(() =>
      assertEvent('lock closed', events)
    );

    events.push('r: disposed');
    r.finish();
    assertGuard(r, null);

    events.push('lock closed');
    await closep;
    assert(lock.isClosed, 'Lock should be closed');

    assertNoMoreEvents(events);
  });

  it('closes the lock after the outstanding writer finishes', async () => {
    const lock = new RwLock();

    const events = [
      'w: request writer',
      'w: acquired writer',
    ];
    const w = await writer(lock, 'w', events);
    assertGuard(w, 'writer');

    const closep = lock.close().then(() =>
      assertEvent('lock closed', events)
    );

    events.push('w: disposed');
    w.finish();
    assertGuard(w, null);

    events.push('lock closed');
    await closep;
    assert(lock.isClosed, 'Lock should be closed');

    assertNoMoreEvents(events);
  });

  it('rejects new readers after closing the lock', async () => {
    const lock = new RwLock();

    await lock.close();
    assert(lock.isClosed, 'Lock should be closed');

    const events = [
      'r: request reader',
    ];
    try {
      await reader(lock, 'r', events);
    } catch (e) {
      assert.strictEqual(e.message, 'The lock is closed');
    }

    assertNoMoreEvents(events);
  });

  it('rejects new writers after closing the lock', async () => {
    const lock = new RwLock();

    await lock.close();
    assert(lock.isClosed, 'Lock should be closed');

    const events = [
      'w: request writer',
    ];
    try {
      await writer(lock, 'w', events);
    } catch (e) {
      assert.strictEqual(e.message, 'The lock is closed');
    }

    assertNoMoreEvents(events);
  });

  it('rejects an upgrade after closing the lock', async () => {
    const lock = new RwLock();

    const events = [
      'r: request reader',
      'r: acquired reader',
    ];
    const r = await reader(lock, 'r', events);
    assertGuard(r, 'reader');

    // This promise won't actually resolve until we've finished the reader,
    // but we must invoke `close` to mark the lock as closed.
    const closep = lock.close().then(() => {
      assertEvent('lock closed', events);
    });

    events.push(
      'r: request upgrade',
      // The lock closes first, when the reader is unlocked
      'lock closed',
      // Then the upgrade is rejected when we attempt to acquire a writer
      'r: upgrade rejected: The lock is closed',
    );
    await r.upgrade();
    // The guard should now be revoked
    assertGuard(r, null);

    // And now the close promise resolves
    await closep;

    assert(lock.isClosed, 'Lock should be closed');

    assertNoMoreEvents(events);
  });

  it('rejects a downgrade after closing the lock', async () => {
    const lock = new RwLock();

    const events = [
      'w: request writer',
      'w: acquired writer',
    ];
    const w = await writer(lock, 'w', events);
    assertGuard(w, 'writer');

    const closep = lock.close().then(() => {
      assertEvent('lock closed', events);
    });

    events.push(
      'w: request downgrade',
      // The downgrade is rejected *synchronously* when the lock is closed
      'w: downgrade rejected: The lock is closed',
      // Then the lock closes asynchronously, after the writer is unlocked
      'lock closed',
    );
    w.downgrade();
    // The guard should now be revoked
    assertGuard(w, null);

    // And now the close promise resolves
    await closep;

    assert(lock.isClosed, 'Lock should be closed');

    assertNoMoreEvents(events);
  });

  it('rejects an upgrade on a revoked guard', async () => {
    const lock = new RwLock();

    const events = [
      'r: request reader',
      'r: acquired reader',
    ];
    const r = await reader(lock, 'r', events);
    assertGuard(r, 'reader');

    events.push('r: disposed');
    r.finish();
    assertGuard(r, null);

    events.push(
      'r: request upgrade',
      'r: upgrade rejected: Invalid guard'
    );
    await r.upgrade();
    // The guard should still be revoked
    assertGuard(r, null);

    await lock.close();
    assert(lock.isClosed, 'Lock should be closed');

    assertNoMoreEvents(events);
  });

  it('rejects a downgrade on a revoked guard', async () => {
    const lock = new RwLock();

    const events = [
      'w: request writer',
      'w: acquired writer',
    ];
    const w = await writer(lock, 'w', events);
    assertGuard(w, 'writer');

    events.push('w: disposed');
    w.finish();
    assertGuard(w, null);

    events.push(
      'w: request downgrade',
      'w: downgrade rejected: Invalid guard'
    );
    w.downgrade();
    // The guard should still be revoked
    assertGuard(w, null);

    await lock.close();
    assert(lock.isClosed, 'Lock should be closed');

    assertNoMoreEvents(events);
  });
});
