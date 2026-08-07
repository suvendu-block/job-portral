import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { COOKIE_NAME } from '../utils/token.js';
import { env } from '../config/env.js';

/**
 * protect — authentication middleware.
 * Checks for a valid JWT (cookie first, then Authorization header — the
 * header path is handy for testing tools / mobile clients) and loads the
 * fresh user document into req.user.
 *
 * Loading from the DB on every request means a deleted account or a
 * changed role takes effect immediately (no stale token data).
 */
export const protect = asyncHandler(async (req, _res, next) => {
  let token;

  // 1. Token from cookie (our web app uses this)
  if (req.cookies?.[COOKIE_NAME]) {
    token = req.cookies[COOKIE_NAME];
  }
  // 2. Fallback: Authorization: Bearer <token> (curl, Postman, mobile)
  else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AppError(401, 'Not logged in. Please log in first.', 'NOT_AUTHENTICATED');
  }

  // Verify signature + expiry. Throws if tampered with or expired.
  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new AppError(401, 'Session expired or invalid. Please log in again.', 'INVALID_TOKEN');
  }

  const user = await User.findById(payload.id);
  if (!user) {
    throw new AppError(401, 'This account no longer exists. Please log in again.', 'INVALID_TOKEN');
  }

  req.user = user; // available to every handler after this middleware
  next();
});

/**
 * requireRole — authorization middleware (used AFTER protect).
 * Throws 403 when the logged-in user's role isn't allowed.
 *
 * Usage: router.post('/', protect, requireRole('recruiter'), createJob)
 */
export const requireRole = (...allowedRoles) => (req, _res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    throw new AppError(
      403,
      `Only ${allowedRoles.join(' or ')} can perform this action`,
      'FORBIDDEN',
    );
  }
  next();
};
