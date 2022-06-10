export default ReentrantLock;
/**
 * Java ReentrantLock similar
 */
declare class ReentrantLock {
    /**
     * acquire the lock
     * @async
     * @returns {void}
     */
    acquire(): void;
    /**
     * try to acquire the lock in <var>timeout</var> milliseconds
     * @async
     * @param {number} timeout
     * @returns {void}
     * @throws {Error}
     */
    tryAcquire(timeout: number): void;
    /**
     * release the lock
     * @returns {void}
     */
    release(): void;
    /**
     * get task queue length
     * @returns {number}
     */
    getQueueLength(): number;
    #private;
}
