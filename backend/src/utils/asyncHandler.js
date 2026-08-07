/**
 * asyncHandler — wraps an async route handler so that if it rejects
 * (throws / awaits a failed promise), the error is passed to Express's
 * error-handling middleware instead of crashing the process.
 *
 * Without this, every handler would need its own try/catch:
 *   router.get('/x', async (req, res, next) => {
 *     try { ... } catch (err) { next(err); }
 *   });
 *
 * @param {Function} fn - async (req, res, next) => Promise
 * @returns {Function} express middleware
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
