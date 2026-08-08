"use client";

/**
 * useRoleGuard — redirects unauthenticated users to /login and
 * wrong-role users to their own dashboard. Usage:
 *
 *   const { user, loading } = useRoleGuard("recruiter");
 *   if (loading || !user) return null; // redirecting
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, dashboardPathFor } from "@/context/AuthContext";

export function useRoleGuard(requiredRole) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== requiredRole) {
      router.replace(dashboardPathFor(user));
    }
  }, [loading, user, requiredRole, router]);

  return { user, loading };
}
