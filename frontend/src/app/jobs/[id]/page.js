"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  CurrencyDollar,
  CheckCircle,
  LockKey,
  BuildingOffice,
} from "@phosphor-icons/react";
import { apiGet } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatSalary, formatDate } from "@/lib/utils";
import { JobTypeBadge } from "@/components/JobCard";
import { ApplyModal } from "@/components/ApplyModal";

/**
 * Job detail — full posting + the apply action.
 * Apply button adapts to state: anonymous (login prompt),
 * own job (disabled), already applied (disabled + label), else modal.
 */
export default function JobDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [similar, setSimilar] = useState([]);

  // Derived loading: true until the requested id has resolved
  const [loadedId, setLoadedId] = useState(null);
  const loading = loadedId !== String(id);

  useEffect(() => {
    let cancelled = false;
    apiGet(`/jobs/${id}`)
      .then((data) => {
        if (!cancelled) {
          setJob(data.job);
          setError("");
          setLoadedId(String(id));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoadedId(String(id));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // If the logged-in seeker already applied, reflect it on the button
  useEffect(() => {
    if (!user || user.role !== "seeker" || !job) return;
    let cancelled = false;
    apiGet("/applications/my")
      .then((data) => {
        if (!cancelled && data.applications.some((a) => String(a.job._id) === String(job._id))) {
          setApplied(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, job]);

  // Similar roles: same type, excluding this one
  useEffect(() => {
    if (!job) return;
    let cancelled = false;
    apiGet(`/jobs?type=${encodeURIComponent(job.type)}&limit=4`)
      .then((data) => {
        if (cancelled) return;
        setSimilar(data.jobs.filter((j) => j._id !== job._id).slice(0, 3));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [job]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="skeleton h-4 w-32 rounded bg-ink/10" />
        <div className="card mt-6 space-y-4 p-8">
          <div className="skeleton h-8 w-2/3 rounded-md bg-ink/10" />
          <div className="skeleton h-4 w-1/2 rounded bg-ink/[0.07]" />
          <div className="skeleton h-32 rounded bg-ink/[0.07]" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-semibold text-ink">Job not found</h1>
        <p className="mt-3 text-muted">{error || "This posting doesn’t exist anymore."}</p>
        <Link href="/jobs" className="btn btn-secondary mt-8">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to all jobs
        </Link>
      </div>
    );
  }

  const isOwner = user && String(job.postedBy?._id) === String(user._id);
  const showApply = user?.role === "seeker";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-ink"
      >
        <ArrowLeft size={15} aria-hidden="true" /> All jobs
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* ---------- Main column ---------- */}
        <article className="min-w-0">
          <div className="flex items-start gap-5">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-ink text-xl font-semibold text-paper">
              {job.company?.charAt(0)}
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-balance text-ink sm:text-3xl">
                {job.title}
              </h1>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
                <span className="inline-flex items-center gap-1.5 font-medium text-ink-soft">
                  <BuildingOffice size={15} aria-hidden="true" />
                  {job.company}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={15} aria-hidden="true" />
                  {job.location}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <JobTypeBadge type={job.type} />
            {job.salary != null && (
              <span className="chip border-line-strong bg-surface text-ink-soft">
                <CurrencyDollar size={12} weight="bold" aria-hidden="true" />
                {formatSalary(job.salary)}
              </span>
            )}
            <span className="chip border-line-strong bg-surface text-muted">
              Posted {formatDate(job.createdAt)}
            </span>
          </div>

          <div className="mt-8 border-t border-line pt-8">
            <h2 className="text-sm font-semibold tracking-wide text-ink uppercase">
              About the role
            </h2>
            <p className="mt-4 max-w-[68ch] text-[15px] leading-relaxed whitespace-pre-line text-ink-soft">
              {job.description}
            </p>
          </div>

          {job.postedBy?.name && (
            <div className="mt-10 flex items-center gap-3 border-t border-line pt-6 text-sm text-muted">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-xs font-semibold text-paper">
                {job.postedBy.name.charAt(0)}
              </span>
              <span>
                Posted by <span className="font-medium text-ink-soft">{job.postedBy.name}</span>
              </span>
            </div>
          )}

          {/* Similar roles */}
          {similar.length > 0 && (
            <section className="mt-12 border-t border-line pt-8" aria-label="Similar roles">
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-lg font-semibold text-ink">Similar roles</h2>
                <Link
                  href={`/jobs?type=${encodeURIComponent(job.type)}`}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  See all {job.type} roles
                </Link>
              </div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {similar.map((s) => (
                  <Link
                    key={s._id}
                    href={`/jobs/${s._id}`}
                    className="card group flex flex-col gap-3 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink text-xs font-semibold text-paper transition-colors group-hover:bg-accent group-hover:text-accent-ink">
                        {s.company?.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink group-hover:text-accent">
                          {s.title}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {s.company} · {s.location}
                        </p>
                      </div>
                    </div>
                    <div className="mt-auto flex flex-wrap gap-1.5">
                      <JobTypeBadge type={s.type} />
                      {s.salary != null && (
                        <span className="chip border-line-strong bg-surface text-ink-soft">
                          {formatSalary(s.salary)}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* ---------- Apply rail ---------- */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card space-y-5 p-6">
            <div>
              <p className="text-sm font-medium text-muted">Ready to apply?</p>
              <p className="mt-1 text-sm text-ink-soft">
                Submit your resume and a short note in about two minutes.
              </p>
            </div>

            {isOwner ? (
              <div className="flex items-center gap-2.5 rounded-lg border border-line bg-ink/[0.03] px-4 py-3 text-sm text-ink-soft">
                <LockKey size={17} className="shrink-0 text-muted" aria-hidden="true" />
                You posted this job
              </div>
            ) : applied ? (
              <div className="flex items-center gap-2.5 rounded-lg border border-ok/30 bg-ok/10 px-4 py-3 text-sm font-medium text-ok">
                <CheckCircle size={17} weight="fill" aria-hidden="true" />
                Application submitted
              </div>
            ) : !user ? (
              <div className="space-y-3">
                <Link href={`/login?next=${encodeURIComponent(`/jobs/${job._id}`)}`} className="btn btn-primary w-full py-3">
                  Log in to apply
                </Link>
                <Link href={`/register?next=${encodeURIComponent(`/jobs/${job._id}`)}`} className="btn btn-secondary w-full">
                  Create a free account
                </Link>
              </div>
            ) : showApply ? (
              <button
                onClick={() => setModalOpen(true)}
                className="btn btn-primary w-full py-3"
              >
                Apply now
              </button>
            ) : (
              <div className="flex items-center gap-2.5 rounded-lg border border-line bg-ink/[0.03] px-4 py-3 text-sm text-ink-soft">
                <LockKey size={17} className="shrink-0 text-muted" aria-hidden="true" />
                Recruiters can’t apply to jobs
              </div>
            )}

            <p className="text-xs leading-relaxed text-muted">
              Your application goes straight to the recruiter. No agencies, no
              recruiters in between.
            </p>
          </div>
        </aside>
      </div>

      {modalOpen && showApply && !isOwner && (
        <ApplyModal
          job={job}
          onClose={() => setModalOpen(false)}
          onApplied={() => setApplied(true)}
        />
      )}

      {/* authLoading guard: flash prevention for the apply rail */}
      {authLoading && <span className="sr-only">Checking session…</span>}
    </div>
  );
}
