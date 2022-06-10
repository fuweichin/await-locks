import ReentrantLock  from '../src/ReentrantLock.js';

describe('ReentrantLock', () => {
  it('acquire', async () => {
    let lock = new ReentrantLock();
    lock.acquire().then(() => {
      setTimeout(() => {
        lock.release();
      }, 1000);
    });
    let t0 = performance.now();
    try {
      await lock.acquire();
    } finally {
      lock.release();
    }
    expect(performance.now() - t0).toBeGreaterThan(1000);
  });
  it('tryAcquire in time', async () => {
    let lock = new ReentrantLock();
    lock.acquire().then(() => {
      setTimeout(() => {
        lock.release();
      }, 1000);
    });
    let t0 = performance.now();
    try {
      await lock.tryAcquire(2000);
    } finally {
      lock.release();
    }
    expect(performance.now() - t0).toBeGreaterThan(1000);
  });
  it('tryAcquire timeout', async () => {
    let lock = new ReentrantLock();
    lock.acquire().then(() => {
      setTimeout(() => {
        lock.release();
      }, 1000);
    });
    let t0 = performance.now();
    let acquired = false;
    try {
      await lock.tryAcquire(500);
      acquired = true;
    } catch (error) {
      expect(error.message).toBe('Timeout');
    } finally {
      if (acquired) {
        lock.release();
      }
      expect(performance.now() - t0).toBeLessThan(1000);
    }
  });
});
