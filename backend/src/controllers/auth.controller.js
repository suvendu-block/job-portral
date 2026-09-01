import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createToken, cookieOptions, COOKIE_NAME } from '../utils/token.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ['seeker', 'recruiter'];

/**
 * Signs a JWT, puts it in an httpOnly cookie, and sends the user object.
 * Shared by register + login so both flows behave identically.
 * Register creates a resource -> 201; login -> 200.
 */
function sendTokenAndUser(res, user, statusCode = 200) {
  const token = createToken(user._id);
  res.cookie(COOKIE_NAME, token, cookieOptions());
  res.status(statusCode).json({ success: true, user });
}

// --- POST /api/auth/register -----------
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body ?? {};

  // Manual validation: simple and readable for learning.
  // (In a TS codebase this would be a Zod schema.)
  const errors = [];
  if (!name || name.trim().length < 3) errors.push('Name must be at least 3 characters');
  if (!EMAIL_REGEX.test(email ?? '')) errors.push('A valid email is required');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters');
  if (role && !ROLES.includes(role)) errors.push('Role must be "seeker" or "recruiter"');
  if (errors.length > 0) {
    throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', errors);
  }

  // Friendly duplicate check (the DB unique index is the real guarantee)
  const existing = await User.findOne({ email: email.trim().toLowerCase() });
  if (existing) {
    throw new AppError(409, 'An account with this email already exists', 'EMAIL_TAKEN');
  }

  // The pre('save') hook in User.js hashes the password for us
  const user = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password, // plain text — hashed by the hook
    role: role || 'seeker',
  });

  sendTokenAndUser(res, user, 201);
});

// --- POST /api/auth/login ---------
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    throw new AppError(400, 'Email and password are required', 'VALIDATION_ERROR');
  }

  // select('+password') because the field is hidden by default (select: false)
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

  // Same message for "no user" and "wrong password" — don't reveal which one
  const passwordMatches = user ? await user.comparePassword(password) : false;
  if (!user || !passwordMatches) {
    throw new AppError(401, 'Incorrect email or password', 'INVALID_CREDENTIALS');
  }

  sendTokenAndUser(res, user);
});

// --- POST /api/auth/logout ----------
export const logout = (req, res) => {
  // clearCookie must use matching options to delete the cookie
  res.clearCookie(COOKIE_NAME, cookieOptions());
  res.json({ success: true, message: 'Logged out' });
};

// --- GET /api/auth/me ----------
// Protected by `protect` middleware — req.user is already loaded.
export const me = (req, res) => {
  res.json({ success: true, user: req.user });
};