/**
 * Thin fetch wrapper around the Express API.
 *
 * - Always sends credentials (the auth token lives in an httpOnly cookie,
 *   so the browser attaches it automatically — no manual headers needed).
 * - Throws an ApiError with a human-readable message when the backend
 *   returns a non-2xx response, so callers can just `catch (err)` and show
 *   `err.message` without parsing the error body themselves.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function api(path, { method = "GET", body, signal } = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: "include",
      signal,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // Network failure (backend down, CORS, offline)
    throw new ApiError(
      "Can't reach the server. Is the backend running?",
      0,
      "NETWORK_ERROR"
    );
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // No JSON body — treat as a generic failure
  }

  if (!res.ok) {
    const error = data?.error;
    // Prefer the field-level detail list; fall back to the message.
    const message = error?.details?.length
      ? error.details.join(" · ")
      : error?.message || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, error?.code, error?.details);
  }

  return data;
}

/** Convenience helpers so callers read as `apiGet("/jobs")`. */
export const apiGet = (path, opts) => api(path, { ...opts, method: "GET" });
export const apiPost = (path, body, opts) =>
  api(path, { ...opts, method: "POST", body });
export const apiPut = (path, body, opts) =>
  api(path, { ...opts, method: "PUT", body });
export const apiPatch = (path, body, opts) =>
  api(path, { ...opts, method: "PATCH", body });
export const apiDelete = (path, opts) =>
  api(path, { ...opts, method: "DELETE" });
