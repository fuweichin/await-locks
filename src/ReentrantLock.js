import Queue from './Queue.js';

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

export default ReentrantLock;
