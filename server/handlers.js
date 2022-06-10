import Semaphore from '../src/Semaphore.js';
import ReentrantLock from '../src/ReentrantLock.js';
import RateLimiter from '../src/RateLimiter.js';

let sleepAsync = (millis) => {
  return new Promise((resolve) => {
    setTimeout(resolve, millis);
  });
};

let reentrantLock = new ReentrantLock();
let semaphore = new Semaphore(4);
let rateLimiter = new RateLimiter(4);

export default {
  async index(req, res, next) {
    res.status(200).type('text/html; charset=utf-8').send(/*html*/`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>List of APIs</title>
</head>
<body>
  <h1>List of APIs</h1>
  <ul>
    <li>GET /api/sleep?millis={{millis}}</li>
    <li>GET /api/sleep-reentrant-lock?millis={{millis}}</li>
    <li>GET /api/sleep-semaphore?millis={{millis}}</li>
    <li>GET /api/sleep-rate-limiter?millis={{millis}}</li>
  </ul>
</body>
</html>`).end();
  },
  async sleep(req, res, next) {
    let millis = +req.query.millis || 1000;
    let t0 = performance.now();
    await sleepAsync(millis);
    res.status(200).type('text/plain').send((performance.now() - t0).toFixed(0)).end();
  },
  async sleepReentrantLock(req, res, next) {
    let millis = parseInt(req.query.millis) || 1000;
    let t0 = performance.now();
    await reentrantLock.acquire();
    await sleepAsync(millis);
    res.status(200).type('text/plain').send((performance.now() - t0).toFixed(0)).end();
    reentrantLock.release();
  },
  async sleepSemaphore(req, res, next) {
    let millis = parseInt(req.query.millis) || 1000;
    let t0 = performance.now();
    await semaphore.acquire(1);
    await sleepAsync(millis);
    res.on('finish', () => {
      console.log('response finished');
      semaphore.release(1);
    });
    res.status(200).type('text/plain').send((performance.now() - t0).toFixed(0)).end();
  },
  async sleepRateLimiter(req, res, next) {
    let millis = parseInt(req.query.millis) || 1000;
    let t0 = performance.now();
    await rateLimiter.acquire();
    await sleepAsync(millis);
    res.status(200).type('text/plain').send((performance.now() - t0).toFixed(0)).end();
  }
};
