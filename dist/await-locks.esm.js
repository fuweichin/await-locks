var Queue = Array;

/**
 * Java ReentrantLock similar
 */
class ReentrantLock {
  #permits;
  #queue;
  /**
   * construct a ReentrantLock
   */
  constructor() {
    this.#permits = 1;
    this.#queue = new Queue();
  }
  /**
   * acquire the lock
   * @async
   * @returns {void}
   */
  acquire() {
    return new Promise((resolve) => {
      if (this.#permits === 1) {
        this.#permits = 0;
        resolve(0);
        return;
      }
      let task = {
        resolve,
        startTime: performance.now(),
      };
      this.#queue.push(task);
    });
  }
  /**
   * try to acquire the lock in <var>timeout</var> milliseconds
   * @async
   * @param {number} timeout
   * @returns {void}
   * @throws {Error}
   */
  tryAcquire(timeout) {
    if (typeof timeout !== 'number' || !isFinite(timeout)) {
      throw new TypeError('Invalid argument timeout: ' + timeout);
    }
    return new Promise((resolve, reject) => {
      if (this.#permits === 1) {
        this.#permits = 0;
        resolve(0);
        return;
      }
      let settled = false;
      let task = {
        resolve: (value) => {
          if (!settled) {
            settled = true;
            resolve(value);
          }
        },
        startTime: performance.now()
      };
      let queue = this.#queue;
      queue.push(task);
      setTimeout(() => {
        if (!settled) {
          settled = true;
          let index = queue.indexOf(task);
          if (index > -1)
            queue.splice(index, 1);
          reject(new Error('Timeout'));
        }
      }, timeout);
    });
  }
  /**
   * release the lock
   * @returns {void}
   */
  release() {
    if (this.#permits === 1) {
      return;
    }
    let queue = this.#queue;
    if (queue.length > 0) {
      let task = queue.shift();
      task.resolve(performance.now() - task.startTime);
    }
    if (queue.length === 0) {
      this.#permits = 1;
    }
  }
  /**
   * get task queue length
   * @returns {number}
   */
  getQueueLength() {
    return this.#queue.length;
  }
}

/**
 * Semaphore
 */
class Semaphore {
  #maxPermits;
  #permits;
  #queue;
  /**
   * @param {number} permits initial num of permits
   */
  constructor(maxPermits) {
    if (typeof maxPermits !== 'number' || !isFinite(maxPermits) || maxPermits <= 0) {
      throw new TypeError('Argument \'maxPermits\' must be a positive number');
    }
    this.#maxPermits = maxPermits;
    this.#permits = maxPermits;
    this.#queue = new Queue();
  }
  /**
   * acquire some permits
   * @async
   * @param {number} permits
   * @returns {void}
   */
  acquire(permits = 1) {
    if (permits > this.maxPermits) {
      throw new RangeError('permits to be acquired cannot be greater than maxPermits');
    }
    return new Promise((resolve) => {
      if (this.#permits >= permits) {
        this.#permits -= permits;
        resolve(0);
        return;
      }
      let task = {
        resolve,
        permits,
        startTime: performance.now(),
      };
      this.#queue.push(task);
    });
  }
  /**
   * try acquire some permits in certain time
   * @async
   * @param {number} timeout
   * @param {number} permits
   * @returns {void}
   * @throws {Error}
   */
  tryAcquire(timeout, permits = 1) {
    if (typeof timeout !== 'number' || !isFinite(timeout)) {
      throw new TypeError('Invalid argument timeout: ' + timeout);
    }
    if (permits > this.maxPermits) {
      throw new RangeError('permits to be acquired cannot be greater than maxPermits');
    }
    return new Promise((resolve, reject) => {
      if (this.#permits >= permits) {
        this.#permits -= permits;
        resolve(0);
        return;
      }
      let settled = false;
      let task = {
        resolve: (value) => {
          if (!settled) {
            settled = true;
            resolve(value);
          }
        },
        permits,
        startTime: performance.now(),
      };
      let queue = this.#queue;
      queue.push(task);
      setTimeout(() => {
        if (!settled) {
          settled = true;
          let index = queue.indexOf(task);
          if (index > -1)
            queue.splice(index, 1);
          reject(new Error('Timeout'));
        }
      }, Math.max(timeout - 1, 0));
    });
  }
  /**
   * release certain permits
   * @param {number} permits
   * @returns {void}
   */
  release(permits = 1) {
    let availablePermits = this.#permits + permits;
    if (availablePermits > this.#maxPermits) {
      console.warn(`Something went wrong: total released permits(${availablePermits}) is greater than maxPermits(${this.#maxPermits})`);
      availablePermits = this.#maxPermits;
    }
    let queue = this.#queue;
    while (queue.length > 0) {
      let task = queue.at(0);
      if (availablePermits >= task.permits) {
        availablePermits -= task.permits;
        queue.shift();
        task.endTime = performance.now();
        task.resolve(task.endTime - task.startTime);
      } else {
        break;
      }
    }
    this.#permits = availablePermits;
  }
  /**
   * get task queue length
   * @returns {number}
   */
  getQueueLength() {
    return this.#queue.length;
  }
  /**
   * num of available permits
   * @returns {number}
   */
  availablePermits() {
    return this.#permits;
  }
  /**
   * drain available permits and return the permits drained
   * @returns {number}
   */
  drainPermits() {
    let permits = this.#permits;
    this.#permits = 0;
    return permits;
  }
}

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

export { RateLimiter, ReentrantLock, Semaphore };
