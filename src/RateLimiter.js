import Queue from './Queue.js';

/**
 * RateLimiter
 */
class RateLimiter {
  #queue;
  #interval;
  #timer;
  #lastIdleTime;
  #idleTimeout;
  /**
   * @param {number} permitsPerSecond
   */
  constructor(permitsPerSecond) {
    if (typeof permitsPerSecond !== 'number' || !isFinite(permitsPerSecond) || permitsPerSecond <= 0) {
      throw new TypeError('Argument \'permitsPerSecond\' must be a positive number');
    }
    this.setRate(permitsPerSecond);
    this.#queue = new Queue();
    this.#timer = null;
    this.#lastIdleTime = 0;
    this.#idleTimeout = 7000;
  }
  /**
   * Won't work if already after first acquire()
   * @param {number} permitsPerSecond
   * @returns {void}
   */
  setRate(permitsPerSecond) {
    if (isNaN(permitsPerSecond) || permitsPerSecond <= 0 || permitsPerSecond > 1000) {
      throw new TypeError('argument permitsPerSecond should be in range (0, 1000].');
    }
    this.#interval = 1000 / permitsPerSecond;
  }
  /**
   * @returns {number}
   */
  getRate() {
    return 1000 / this.#interval;
  }
  /**
   * @async
   * @param {number} [permits]
   * @returns {void}
   */
  acquire(permits = 1) {
    return new Promise((resolve) => {
      let task = {
        resolve: resolve,
        permits: permits,
        acquired: 0,
        startTime: performance.now(),
      };
      this.#queue.push(task);
      if (!this.#timer) {
        RateLimiter.tick(this);
        this.#timer = setInterval(RateLimiter.tick, this.#interval, this);
      }
    });
  }
  /**
   * @async
   * @param {number} timeout
   * @param {number} [permits]
   * @returns {void}
   */
  tryAcquire(timeout, permits = 1) {
    if (typeof timeout !== 'number' || !isFinite(timeout)) {
      throw new TypeError('Invalid argument timeout: ' + timeout);
    }
    return new Promise((resolve, reject) => {
      let settled = false;
      let task = {
        resolve: (value) => {
          if (!settled) {
            settled = true;
            resolve(value);
          }
        },
        permits: permits,
        acquired: 0,
        startTime: performance.now(),
      };
      setTimeout(() => {
        if (!settled) {
          settled = true;
          let index = this.#queue.indexOf(task);
          if (index > -1)
            this.#queue.splice(index, 1);
          reject(new Error('Timeout'));
        }
      }, timeout);
      this.#queue.push(task);
      if (!this.#timer) {
        RateLimiter.tick(this);
        this.#timer = setInterval(RateLimiter.tick, this.#interval, this);
      }
    });
  }
  /**
   * @returns {number}
   */
  getQueueLength() {
    return this.#queue.length;
  }
  static tick(that) {
    let queue = that.#queue;
    if (queue.length === 0) {
      if (that.#lastIdleTime === 0) {
        that.#lastIdleTime = performance.now();
      } else if (performance.now() - that.#lastIdleTime > that.#idleTimeout) {
        clearInterval(that.#timer);
        that.#timer = null;
      }
    } else {
      that.#lastIdleTime = 0;
      let task = queue.at(0);
      task.acquired += 1;
      if (task.acquired >= task.permits) {
        queue.shift();
        task.resolve(performance.now() - task.startTime);
      }
    }
  }
}

export default RateLimiter;
