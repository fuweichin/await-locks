# await-locks

Some JavaScript concurrency-control / frequency-control utility classes, inspired by Java, to manage async tasks easily.



<!--ts-->
   * [Background](#background)
   * [Install](#install)
   * [Usage](#usage)
      * [Usage in Browsers](#usage-in-browsers)
      * [Usage in Node.js](#usage-in-nodejs)
   * [Examples](#examples)
      * [Run Examples](#run-examples)
      * [Run Tests](#run-tests)
   * [License](#license)
<!--te-->



## Background

Web developers may have the following how-to questions

+ fetch numerous resources one by one
+ upload a bunch of files with specific num of parallel tasks
+ make actual handling of user actions/requests more even in time (distinguish from throttle/debounce which may drop requests)

In Java language, there are concepts below to manage concurrent tasks

+ Reentrant Lock
+ Semaphore
+ Rate Limiter

So this package is trying to port some Java concurrency concepts to JavaScript runtimes for web developers.



## Install

```sh
npm install await-locks
```



## Usage

This package contains the following classes:

+ [ReentrantLock](./src/ReentrantLock.js)
+ [Semaphore](/src/Semaphore.js)
+ [RateLimiter](./src/RateLimiter.js)

With these classes you may even implement a "Thread Pool Work Queue"-like pattern.

Take `Semaphore` as a example

### Usage in Browsers

```js
// import {Semaphore} from 'await-locks';
// import {Semaphore} from '/node_modules/await-locks/dist/await-locks.esm.js';
import Semaphore from '/node_modules/await-locks/src/Semaphore.js';

let semaphore = new Semaphore(4);
async function semaphoreClientExample(millis) {
  await semaphore.acquire(1);  // acquire 1 permit before request
  let p = fetch('/api/sleep?millis=' + millis).then((res) => {
    if (!res.ok) {
      throw new Error('Error ' + res.status);
    }
    return res.text();
  });
  p.finally(() => {
    semaphore.release(1); // release 1 permit after request finished
  });
  return p;
}

let promised = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((millis) => semaphoreClientExample(millis));
Promise.allSettled(promised).then((results) => {
  console.log(results);
});
```

### Usage in Node.js

server.js

```js
import http from 'http';
import express from 'express';
import {Semaphore} from 'await-locks';

let semaphore = new Semaphore(4);

let sleepAsync = (millis) => {
  return new Promise((resolve) => {
    setTimeout(resolve, millis);
  });
};

let handlers = {
  async sleep(req, res, next) {
    let millis = parseInt(req.query.millis) || 1000;
    let t0 = performance.now();
    await sleepAsync(millis);
    res.status(200).type('text/plain').send((performance.now() - t0).toFixed(0)).end();
  },
  async semaphoreServerExample(req, res, next) {
    let millis = parseInt(req.query.millis) || 1000;
    let t0 = performance.now();
    await semaphore.acquire(1); // acquire 1 permit before handling the request
    await sleepAsync(millis);
    res.on('finish', () => {
      semaphore.release(1); // release 1 permit after response finished
    });
    res.status(200).type('text/plain').send((performance.now() - t0).toFixed(0)).end();
  }
}

let app = express();
app.get('/api/sleep', handlers.sleep);
app.get('/api/sleep-semaphore', handlers.semaphoreServerExample);

let server = http.createServer({}, app);
server.listen(8080, '127.0.0.1', () => {
  console.log('server started.\nhttp://127.0.0.1:8080');
});
```



## Examples

See [client-side examples](./client), [server-side examples](./server) and [jasmine tests](./spec).

### Run Examples

Checkout [await-locks](https://github.com/fuweichin/await-locks) from github

```sh
npm install
npm run start
```

Open https://127.0.0.1:8443/client/ for client examples, open https://127.0.0.1:8443/api/ for server APIs. You may also use Java/Servlet to implement an equivalent server-side APIs to run client examples.

### Run Tests

```sh
npm install -g jasmine
npm run test
```



## License

[MIT](./LICENSE)

