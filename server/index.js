import fs from 'fs';
// import https from 'https';
import http2 from 'http2';
import http2Express from 'http2-express-bridge';
import express from 'express';
import serveIndex from 'serve-index';
import handlers from './handlers.js';

let app = http2Express(express);
app.use('/', express.static('./', {
  etag: false
}), serveIndex('./', {
  icons: true
}));

app.get('/api/', handlers.index);
app.get('/api/sleep', handlers.sleep);
app.get('/api/sleep-semaphore', handlers.sleepSemaphore);
app.get('/api/sleep-reentrant-lock', handlers.sleepReentrantLock);
app.get('/api/sleep-rate-limiter', handlers.sleepRateLimiter);

// let server = https.createServer({
let server = http2.createSecureServer({
  key: fs.readFileSync('./server/ssl/private/localhost.key'),
  cert: fs.readFileSync('./server/ssl/certs/localhost.crt'),
}, app);
server.listen(8443, '127.0.0.1', () => {
  console.log('server started. https://127.0.0.1:8443');
});
server.on('error', (e) => {
  console.error(e);
});
