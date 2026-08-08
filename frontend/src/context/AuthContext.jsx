"use client";

/**
 * AuthContext — the single source of truth for "who is logged in".
 *
 * On first mount it calls GET /auth/me; the backend reads the httpOnly
 * cookie, so no token handling ever touches JavaScript. Everything below
 * (navbar, dashboards, apply buttons) reads `user` + `loading` from here.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiGet, apiPost } from "@/lib/api";

const AuthContext = createContext(null);

/** Where each role lands after login / registration. */
export function dashboardPathFor(user) {
  if (!user) return "/";
  return user.role === "recruiter" ? "/dashboard/recruiter" : "/dashboard/seeker";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until /me resolves

  // Restore the session once on mount
  useEffect(() => {
    let cancelled = false;
    apiGet("/auth/me")
      .then((data) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => {
        /* not logged in — that's fine */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiPost("/auth/login", { email, password });
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await apiPost("/auth/register", payload);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost("/auth/logout");
    } finally {
      setUser(null); // even if the request fails, drop local state
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
