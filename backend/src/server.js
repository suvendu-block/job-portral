import { env, validateEnv } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { app } from './app.js';

/**
 * Boot sequence: validate config -> connect DB -> start listening.
 * Top-level await is fine here (ESM) — if anything fails we crash
 * loudly at startup instead of serving broken requests.
 */
async function start() {
  validateEnv();
  await connectDB(env.MONGODB_URI);

  const server = app.listen(env.PORT, () => {
    console.log(`[server] API running at http://localhost:${env.PORT}`);
    console.log(`[server] CORS allowed origin: ${env.CLIENT_URL}`);
  });

  // Graceful shutdown: close the server, then disconnect from MongoDB,
  // then exit. A timeout forces exit if something hangs.
  const shutdown = (signal) => {
    console.log(`[server] ${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
