/**
 * AppError — an error we created ON PURPOSE to signal a specific HTTP
 * response (e.g. "job not found" -> 404). Controllers throw these; the
 * centralized error handler converts them into the response body.
 *
 * `isOperational` marks expected errors so the handler knows not to log
 * a scary stack trace for them.
 */
export default class AppError extends Error {
  constructor(statusCode, message, code = 'ERROR', details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    // Keeps this error's stack starting at the throw site, not in this class
    Error.captureStackTrace?.(this, this.constructor);
  }
}
