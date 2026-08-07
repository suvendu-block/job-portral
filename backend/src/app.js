import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import jobRoutes from './routes/job.routes.js';
import applicationRoutes from './routes/application.routes.js';
import { notFound } from './middlewares/notFound.middleware.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

/**
 * The Express app (no listen() here!).
 * Kept separate from server.js so tests can import `app` and run
 * supertest against it without opening a real port.
 */
export const app = express();

// --- Global middleware ------

// CORS: allow the Next.js frontend to call us and to send/receive cookies.
// credentials:true is required for the httpOnly cookie to be sent along.
// Note: localhost:3000 -> localhost:5000 is SAME-SITE (same registrable domain),
// so sameSite:'lax' cookies work during local development. In production the
// frontend and API should share a domain (e.g. app.example.com + api.example.com),
// or you must use sameSite:'none' + secure.
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

// Parse JSON request bodies (limit 1MB by default — enough for resume text)
app.use(express.json());

// Parse cookies into req.cookies (needed to read the auth token)
app.use(cookieParser());

// Tiny request logger — swap for pino/pino-http when you go to production
app.use((req, res, next) => {
  console.log(`[http] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// --- Routes -------

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api', applicationRoutes);

// --- Error handling (must be last) ---------

// 404 for any route that didn't match
app.use(notFound);

// Centralized error handler — every error ends up here
app.use(errorHandler);
