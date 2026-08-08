"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, dashboardPathFor } from "@/context/AuthContext";

/**
 * /dashboard — a thin redirect based on the logged-in role.
 * After login the user never has to pick a dashboard manually.
 */
export default function DashboardIndex() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? dashboardPathFor(user) : "/login");
  }, [loading, user, router]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
      <div className="skeleton mx-auto h-8 w-64 rounded-md bg-ink/10" />
    </div>
  );
}
