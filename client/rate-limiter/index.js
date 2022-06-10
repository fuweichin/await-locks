import RateLimiter from '../../src/RateLimiter.js';

const $ = (s, c = document) => c.querySelector(s);

let rateLimiter = new RateLimiter(2);
async function sleepRateLimitedByClient(millis) {
  await rateLimiter.acquire();
  return fetch('/api/sleep?millis=' + millis).then((res) => {
    if (!res.ok) {
      throw new Error('Error ' + res.status);
    }
    return res.text();
  });
}
function sleepRateLimitedByServer(millis) {
  return fetch('/api/sleep-rate-limiter?millis=' + millis).then((res) => {
    if (!res.ok) {
      throw new Error('Error ' + res.status);
    }
    return res.text();
  });
}

function main() {
  $('#btn1').addEventListener('click', (event) => {
    event.target.disabled = true;
    let promises = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
      return sleepRateLimitedByClient(n);
    });
    Promise.all(promises).then((results) => {
      console.log(results.map(parseFloat));
    }, (err) => {
      console.error(err);
    }).finally(() => {
      event.target.disabled = false;
    });
  });
  $('#btn2').addEventListener('click', (event) => {
    event.target.disabled = true;
    let promises = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
      return sleepRateLimitedByServer(n);
    });
    Promise.all(promises).then((results) => {
      console.log(results.map(parseFloat));
    }, (err) => {
      console.error(err);
    }).finally(() => {
      event.target.disabled = false;
    });
  });
}
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', main) : main();
