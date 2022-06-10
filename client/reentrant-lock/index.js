import ReentrantLock from '../../src/ReentrantLock.js';

const $ = (s, c = document) => c.querySelector(s);

let reentrantLock = new ReentrantLock();
async function sleepWithLockByClient(millis) {
  await reentrantLock.acquire();
  let p = fetch('/api/sleep?millis=' + millis).then((res) => {
    if (!res.ok) {
      throw new Error('Error ' + res.status);
    }
    return res.text();
  });
  p.finally(() => {
    reentrantLock.release();
  });
  return p;
}
function sleepWithLockByServer(millis) {
  return fetch('/api/sleep-reentrant-lock?millis=' + millis).then((res) => {
    if (!res.ok) {
      throw new Error('Error ' + res.status);
    }
    return res.text();
  });
}

function main() {
  $('#btn1').addEventListener('click', (event) => {
    event.target.disabled = true;
    let promises = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(() => {
      return sleepWithLockByClient(800 + Math.floor(Math.random() * 200));
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
    let promises = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(() => {
      return sleepWithLockByServer(800 + Math.floor(Math.random() * 200));
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
