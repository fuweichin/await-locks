export default RateLimiter;
/**
 * RateLimiter
 */
declare class RateLimiter {
    static tick(that: any): void;
    /**
     * @param {number} permitsPerSecond
     */
    constructor(permitsPerSecond: number);
    /**
     * Won't work if already after first acquire()
     * @param {number} permitsPerSecond
     * @returns {void}
     */
    setRate(permitsPerSecond: number): void;
    /**
     * @returns {number}
     */
    getRate(): number;
    /**
     * @async
     * @param {number} [permits]
     * @returns {void}
     */
    acquire(permits?: number): void;
    /**
     * @async
     * @param {number} timeout
     * @param {number} [permits]
     * @returns {void}
     */
    tryAcquire(timeout: number, permits?: number): void;
    /**
     * @returns {number}
     */
    getQueueLength(): number;
    #private;
}
