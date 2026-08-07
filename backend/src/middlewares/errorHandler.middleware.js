/**
 * Centralized error handler — the LAST middleware in app.js.
 * Every error thrown anywhere ends up here and becomes a consistent JSON body:
 *
 *   { error: { code, message, details } }
 *
 * It also translates common Mongoose/JWT errors into friendly responses,
 * so controllers don't have to worry about them.
 *
 * Note the 4 params — Express identifies error handlers by their arity.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  let { statusCode = 500, code = 'INTERNAL_ERROR', message = 'Something went wrong' } = err;
  let details = err.details;

  // --- Translate known library errors --------------------------------------

  // Mongoose validation error (bad data that passed express but failed the schema)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => e.message);
  }

  // Mongoose CastError (e.g. "abc123" is not a valid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid ${err.path}: ${err.value} is not a valid id`;
  }

  // MongoDB duplicate key (e.g. registering with an existing email)
  if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    message = `A record with that ${Object.keys(err.keyValue ?? {})[0]} already exists`;
  }

  // JWT errors from jsonwebtoken
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid or expired token';
  }

  // --- Logging ------
  // Expected errors: log one line. Unexpected bugs: log the full stack.
  if (err.isOperational) {
    console.log(`[error] ${statusCode} ${code}: ${message}`);
  } else {
    console.error('[error] UNEXPECTED:', err);
  }

  // --- Response --------------------------------------------------------------
  // Never leak internals: unknown errors always become a generic 500.
  if (statusCode === 500) message = 'Something went wrong';

  res.status(statusCode).json({ error: { code, message, ...(details ? { details } : {}) } });
}
