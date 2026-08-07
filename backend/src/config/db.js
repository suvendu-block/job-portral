import mongoose from 'mongoose';

/**
 * Connects to MongoDB.
 * Called once at boot (see server.js) — never per-request.
 *
 * @param {string} uri - connection string, e.g. mongodb://127.0.0.1:27017/job_portal
 */
export async function connectDB(uri) {
  mongoose.set('strictQuery', true); // don't allow unknown fields in queries

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000, // fail fast instead of hanging if the DB is unreachable
  });

  console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}

/** Disconnects cleanly on shutdown. */
export async function disconnectDB() {
  await mongoose.disconnect();
  console.log('[db] MongoDB disconnected');
}
