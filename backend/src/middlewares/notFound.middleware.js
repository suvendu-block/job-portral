import AppError from '../utils/AppError.js';

/**
 * 404 handler — runs when no route matched.
 * Express calls it with (req, res, next); we turn it into a proper JSON error.
 */
export function notFound(req, _res, next) {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found`, 'NOT_FOUND'));
}
