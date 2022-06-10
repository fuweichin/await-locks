import RateLimiter  from '../src/RateLimiter.js';

describe('RateLimiter', () => {
  it('acquire', async () => {
    let rateLimiter = new RateLimiter(1);
    let t0 = performance.now();
    await rateLimiter.acquire(2);
    expect(performance.now() - t0).toBeGreaterThan(1000);
  });
  it('tryAcquire in time', async () => {
    let rateLimiter = new RateLimiter(1);
    let t0 = performance.now();
    let acquired = false;
    try {
      await rateLimiter.tryAcquire(1020, 2);
      acquired = true;
    } catch (error) {
      //
    }
    expect(acquired).toBe(true);
    expect(performance.now() - t0).toBeGreaterThan(1000);
    expect(performance.now() - t0).toBeLessThan(1020);
  });
  it('tryAcquire timeout', async () => {
    let rateLimiter = new RateLimiter(1);
    let t0 = performance.now();
    let acquired = false;
    try {
      await rateLimiter.tryAcquire(1020, 3);
      acquired = true;
    } catch (error) {
      expect(error.message).toBe('Timeout');
    }
    expect(acquired).toBe(false);
    expect(performance.now() - t0).toBeGreaterThan(1020);
    expect(performance.now() - t0).toBeLessThan(2020);
  });
});
