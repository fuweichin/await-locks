import Semaphore  from '../src/Semaphore.js';

let sleepAsync = (millis) => {
  return new Promise((resolve) => {
    setTimeout(resolve, millis);
  });
};

describe('Semaphore', () => {
  it('acquire', async () => {
    let semaphore = new Semaphore(2);
    semaphore.acquire(2).then(() => {
      setTimeout(() => {
        semaphore.release(2);
      }, 500);
    });
    let handleTask = async () => {
      await semaphore.acquire(1);
      try {
        await sleepAsync(500);
      } finally {
        semaphore.release(1);
      }
    };
    let t0 = performance.now();
    await Promise.all([3, 4, 5, 6, 7, 8].map(handleTask));
    expect(performance.now() - t0).toBeGreaterThan(2000);
  });
  it('tryAcquire in time', async () => {
    let semaphore = new Semaphore(2);
    semaphore.acquire(2).then(() => {
      setTimeout(() => {
        semaphore.release(2);
      }, 500);
    });
    let t0 = performance.now();
    let acquired = false;
    try {
      await semaphore.tryAcquire(1000, 1);
      acquired = true;
    } catch (error) {
      // NOOP
    } finally {
      if (acquired) {
        semaphore.release(1);
      }
    }
    expect(performance.now() - t0).toBeGreaterThan(500);
    expect(performance.now() - t0).toBeLessThan(1000);
  });
  it('tryAcquire timeout', async () => {
    let semaphore = new Semaphore(2);
    semaphore.acquire(2).then(() => {
      setTimeout(() => {
        semaphore.release(2);
      }, 1000);
    });
    let t0 = performance.now();
    let acquired = false;
    try {
      await semaphore.tryAcquire(500, 1);
      acquired = true;
    } catch (error) {
      expect(error.message).toBe('Timeout');
    } finally {
      if (acquired) {
        semaphore.release(1);
      }
    }
    expect(performance.now() - t0).toBeLessThan(1000);
  });
});
