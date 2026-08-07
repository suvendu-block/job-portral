import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Creates a signed JWT containing the user's id.
 * The token is the "proof of login" — the server verifies its signature
 * on every protected request (see auth.middleware.js).
 */
export function createToken(userId) {
  return jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

/**
 * Cookie settings for the auth token.
 * - httpOnly : JS in the browser cannot read it (blocks XSS token theft)
 * - sameSite : 'lax' blocks CSRF while still working for normal browsing.
 *              localhost:3000 -> localhost:5000 is same-site, so this works in dev.
 * - secure   : only sent over HTTPS. Off in development (localhost).
 */
export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.IS_PRODUCTION,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, must match JWT_EXPIRES_IN
  };
}

export const COOKIE_NAME = 'token';
