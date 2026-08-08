"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  PaperPlaneTilt,
  ListChecks,
  CheckCircle,
  Hourglass,
  ArrowRight,
  WarningCircle,
} from "@phosphor-icons/react";
import { apiGet } from "@/lib/api";
import { useRoleGuard } from "@/lib/useRoleGuard";
import { formatDate } from "@/lib/utils";
import { DashboardShell, StatCard } from "@/components/DashboardShell";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";

/**
 * Seeker dashboard — "My applications" with live status tracking.
 * All numbers are computed from the user's own data.
 */
export default function SeekerDashboard() {
  const { user, loading } = useRoleGuard("seeker");
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const STATUS_FILTERS = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "reviewed", label: "Reviewed" },
    { value: "shortlisted", label: "Shortlisted" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
  ];

  // Derived loading: true until the latest reload request resolves
  const [reloadKey, setReloadKey] = useState(0);
  const [loadedKey, setLoadedKey] = useState(null);
  const dataLoading = loadedKey !== reloadKey;

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    apiGet("/applications/my")
      .then((data) => {
        if (cancelled) return;
        setApplications(data.applications);
        setError("");
        setLoadedKey(reloadKey);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoadedKey(reloadKey);
      });
    return () => {
      cancelled = true;
    };
  }, [loading, user, reloadKey]);

  if (loading || !user) return null; // redirecting via guard

  const visible =
    statusFilter === "all"
      ? applications
      : applications.filter((a) => a.status === statusFilter);

  const stats = [
    { label: "Total applications", value: applications.length },
    {
      label: "Pending",
      value: applications.filter((a) => a.status === "pending").length,
    },
    {
      label: "Shortlisted",
      value: applications.filter((a) => a.status === "shortlisted").length,
    },
    {
      label: "Accepted",
      value: applications.filter((a) => a.status === "accepted").length,
    },
  ];

  return (
    <DashboardShell
      title={`Hi, ${user.name.split(" ")[0]}`}
      subtitle="Track every application from pending to accepted."
    >
      {/* Stats (real numbers) */}
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Applications */}
      <section className="mt-10" aria-label="My applications">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-ink">My applications</h2>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            Browse more jobs <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        {/* Status filter tabs (only when there's something to filter) */}
        {!dataLoading && applications.length > 0 && (
          <div
            role="tablist"
            aria-label="Filter by status"
            className="mt-5 flex flex-wrap gap-2"
          >
            {STATUS_FILTERS.map((f) => {
              const count =
                f.value === "all"
                  ? applications.length
                  : applications.filter((a) => a.status === f.value).length;
              const active = statusFilter === f.value;
              return (
                <button
                  key={f.value}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatusFilter(f.value)}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                    active
                      ? "border-accent bg-accent text-accent-ink"
                      : "border-line-strong bg-surface text-ink-soft hover:border-ink/30"
                  }`}
                >
                  {f.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                      active ? "bg-accent-ink/20 text-accent-ink" : "bg-ink/[0.06] text-muted"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-5 space-y-3">
          {dataLoading && (
            <>
              <div className="card skeleton h-24" />
              <div className="card skeleton h-24" />
            </>
          )}

          {error && (
            <EmptyState
              icon={WarningCircle}
              title="Couldn't load your applications"
              body={error}
              action={
                <button onClick={() => setReloadKey((k) => k + 1)} className="btn btn-secondary">
                  Try again
                </button>
              }
            />
          )}

          {!dataLoading && !error && applications.length === 0 && (
            <EmptyState
              icon={PaperPlaneTilt}
              title="No applications yet"
              body="When you apply to a job, it will show up here with its status."
              action={
                <Link href="/jobs" className="btn btn-primary">
                  Browse jobs
                </Link>
              }
            />
          )}

          {!dataLoading && !error && applications.length > 0 && visible.length === 0 && (
            <EmptyState
              icon={ListChecks}
              title={`No ${statusFilter} applications`}
              body="Nothing has moved to this status yet. Pick another filter or check back later."
              action={
                <button onClick={() => setStatusFilter("all")} className="btn btn-secondary">
                  Show all applications
                </button>
              }
            />
          )}

          {!dataLoading &&
            !error &&
            visible.map((app) => (
              <div key={app._id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink text-base font-semibold text-paper">
                    {app.job?.company?.charAt(0) ?? "?"}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/jobs/${app.job?._id}`}
                      className="truncate text-base font-semibold text-ink transition hover:text-accent"
                    >
                      {app.job?.title ?? "Deleted job"}
                    </Link>
                    <p className="mt-0.5 text-sm text-muted">
                      {app.job?.company ?? "This posting was removed"}
                      {app.job?.location && ` · ${app.job.location}`}
                    </p>
                    <p className="mt-2 text-xs text-muted">
                      Applied {formatDate(app.createdAt)}
                      {app.job?.salary != null &&
                        ` · ${new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        }).format(app.job.salary)}/yr`}
                    </p>
                  </div>
                </div>
                <StatusBadge status={app.status} className="self-start sm:self-center" />
              </div>
            ))}
        </div>

        {/* Legend */}
        {applications.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-5 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Hourglass size={13} aria-hidden="true" /> Pending — waiting on the recruiter
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ListChecks size={13} aria-hidden="true" /> Shortlisted — you made the cut
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle size={13} aria-hidden="true" /> Accepted — congrats!
            </span>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
