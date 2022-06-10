export default Semaphore;
/**
 * Semaphore
 */
declare class Semaphore {
    /**
     * @param {number} permits initial num of permits
     */
    constructor(maxPermits: any);
    /**
     * acquire some permits
     * @async
     * @param {number} permits
     * @returns {void}
     */
    acquire(permits?: number): void;
    /**
     * try acquire some permits in certain time
     * @async
     * @param {number} timeout
     * @param {number} permits
     * @returns {void}
     * @throws {Error}
     */
    tryAcquire(timeout: number, permits?: number): void;
    /**
     * release certain permits
     * @param {number} permits
     * @returns {void}
     */
    release(permits?: number): void;
    /**
     * get task queue length
     * @returns {number}
     */
    getQueueLength(): number;
    /**
     * num of available permits
     * @returns {number}
     */
    availablePermits(): number;
    /**
     * drain available permits and return the permits drained
     * @returns {number}
     */
    drainPermits(): number;
    #private;
}
