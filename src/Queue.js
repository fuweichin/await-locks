/**
 * Once Safari supports Array.prototype.at(), Queue can be Array instead of a subclass
 */
class Queue extends Array {
  at(i) { // see https://v8.dev/features/at-method
    // Convert the argument to an integer
    let n = Math.trunc(i) || 0;
    // Allow negative indexing from the end
    if (n < 0) n += this.length;
    // Out-of-bounds access returns undefined
    if (n < 0 || n >= this.length) return undefined;
    // Otherwise, this is just normal property access
    return this[n];
  }
}
export default Queue;
