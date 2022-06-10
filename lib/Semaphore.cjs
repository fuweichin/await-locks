'use strict';

var Queue = require('./Queue.cjs');

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

module.exports = Semaphore;
