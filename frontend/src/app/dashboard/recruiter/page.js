"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  PencilSimple,
  Trash,
  Users,
  FileText,
  PaperPlaneTilt,
  WarningCircle,
  CheckCircle,
  ArrowLeft,
} from "@phosphor-icons/react";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import { useRoleGuard } from "@/lib/useRoleGuard";
import { formatDate, cn } from "@/lib/utils";
import { DashboardShell, StatCard } from "@/components/DashboardShell";
import { JobForm } from "@/components/JobForm";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";

const STATUSES = ["pending", "reviewed", "shortlisted", "rejected", "accepted"];

/**
 * Recruiter dashboard — post/manage jobs on the left, review and
 * update applicants for the selected job on the right.
 */
export default function RecruiterDashboard() {
  const { user, loading } = useRoleGuard("recruiter");

  const [jobs, setJobs] = useState([]);
  const [jobsError, setJobsError] = useState("");
  const [jobsReloadKey, setJobsReloadKey] = useState(0);
  const [jobsLoadedKey, setJobsLoadedKey] = useState(null);
  const jobsLoading = jobsLoadedKey !== jobsReloadKey;

  const [formOpen, setFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Selected job is derived: the user's pick, falling back to the first
  // job (or null) whenever the pick no longer exists in the list.
  const [selectedOverride, setSelectedOverride] = useState(null);
  const selectedId = jobs.some((j) => j._id === selectedOverride)
    ? selectedOverride
    : jobs[0]?._id ?? null;

  const [applicants, setApplicants] = useState([]);
  const [applicantsError, setApplicantsError] = useState("");
  const [applicantsReloadKey, setApplicantsReloadKey] = useState(0);
  const [applicantsLoadedKey, setApplicantsLoadedKey] = useState(null);
  const applicantsLoading = applicantsLoadedKey !== `${selectedId}:${applicantsReloadKey}`;

  const [counts, setCounts] = useState({}); // jobId -> applicant count

  const [deleteArmId, setDeleteArmId] = useState(null); // two-step delete
  const [busyId, setBusyId] = useState(null); // status select in-flight

  // Fetch my jobs (filter client-side: the list endpoint is public)
  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    apiGet("/jobs")
      .then((data) => {
        if (cancelled) return;
        const mine = data.jobs.filter((j) => String(j.postedBy?._id) === String(user?._id));
        setJobs(mine);
        setJobsError("");
        setJobsLoadedKey(jobsReloadKey);
      })
      .catch((err) => {
        if (cancelled) return;
        setJobsError(err.message);
        setJobsLoadedKey(jobsReloadKey);
      });
    return () => {
      cancelled = true;
    };
  }, [loading, user, jobsReloadKey]);

  // Fetch applicants for the selected job
  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    apiGet(`/jobs/${selectedId}/applications`)
      .then((data) => {
        if (cancelled) return;
        setApplicants(data.applications);
        setApplicantsError("");
        setApplicantsLoadedKey(`${selectedId}:${applicantsReloadKey}`);
      })
      .catch((err) => {
        if (cancelled) return;
        setApplicantsError(err.message);
        setApplicantsLoadedKey(`${selectedId}:${applicantsReloadKey}`);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId, applicantsReloadKey]);

  // Applicant counts per job (the jobs list endpoint doesn't include them,
  // so fetch each owner-guarded applicant list once per job)
  useEffect(() => {
    if (jobs.length === 0) return;
    let cancelled = false;
    Promise.all(
      jobs.map((j) =>
        apiGet(`/jobs/${j._id}/applications`)
          .then((d) => ({ id: j._id, n: d.count }))
          .catch(() => ({ id: j._id, n: 0 }))
      )
    ).then((rows) => {
      if (!cancelled) setCounts(Object.fromEntries(rows.map((r) => [r.id, r.n])));
    });
    return () => {
      cancelled = true;
    };
  }, [jobs]);

  async function handleSaveJob(payload) {
    if (editingJob) {
      await apiPut(`/jobs/${editingJob._id}`, payload);
    } else {
      await apiPost("/jobs", payload);
    }
    setFormOpen(false);
    setEditingJob(null);
    setJobsReloadKey((k) => k + 1);
  }

  function startEdit(job) {
    setEditingJob(job);
    setFormOpen(true);
    setDeleteArmId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(jobId) {
    if (deleteArmId !== jobId) {
      setDeleteArmId(jobId);
      return; // click again to confirm
    }
    try {
      await apiDelete(`/jobs/${jobId}`);
      setJobsReloadKey((k) => k + 1); // selection derives to the first job
    } catch (err) {
      setJobsError(err.message);
    }
    setDeleteArmId(null);
  }

  async function handleStatusChange(applicationId, status) {
    setBusyId(applicationId);
    try {
      const data = await apiPatch(`/applications/${applicationId}/status`, { status });
      setApplicants((prev) =>
        prev.map((a) => (a._id === applicationId ? { ...a, status: data.application.status } : a))
      );
    } catch (err) {
      setApplicantsError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (loading || !user) return null; // redirecting via guard

  const totalApplicants = applicants.length;
  const pendingApplicants = applicants.filter((a) => a.status === "pending").length;
  const selectedJob = jobs.find((j) => j._id === selectedId);

  return (
    <DashboardShell
      title={`Hi, ${user.name.split(" ")[0]}`}
      subtitle="Post roles, review applicants, move candidates forward."
      action={
        <button
          onClick={() => {
            setEditingJob(null);
            setFormOpen(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={16} weight="bold" aria-hidden="true" />
          Post a job
        </button>
      }
    >
      {/* Post / edit form */}
      {(formOpen || editingJob) && (
        <div className="mt-8">
          <JobForm
            key={editingJob?._id ?? "new"}
            initial={editingJob}
            onSubmit={handleSaveJob}
            onCancel={() => {
              setFormOpen(false);
              setEditingJob(null);
            }}
          />
        </div>
      )}

      {jobsError && (
        <div className="mt-8 flex items-center justify-between rounded-lg border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad">
          <span className="inline-flex items-center gap-2">
            <WarningCircle size={16} aria-hidden="true" /> {jobsError}
          </span>
          <button
            onClick={() => setJobsReloadKey((k) => k + 1)}
            className="font-medium hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        <StatCard label="Jobs posted" value={jobs.length} />
        <StatCard label="Applicants (selected job)" value={totalApplicants} />
        <StatCard label="Pending review" value={pendingApplicants} />
      </div>

      {/* Master-detail */}
      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        {/* ---- Left: my jobs ---- */}
        <section aria-label="My jobs">
          <h2 className="text-lg font-semibold text-ink">My jobs</h2>

          <div className="mt-5 space-y-2.5">
            {jobsLoading && (
              <>
                <div className="card skeleton h-20" />
                <div className="card skeleton h-20" />
              </>
            )}

            {!jobsLoading && jobs.length === 0 && (
              <EmptyState
                icon={PaperPlaneTilt}
                title="No jobs yet"
                body="Publish your first role and applicants will land here."
                action={
                  <button
                    onClick={() => {
                      setEditingJob(null);
                      setFormOpen(true);
                    }}
                    className="btn btn-primary"
                  >
                    <Plus size={15} weight="bold" aria-hidden="true" />
                    Post a job
                  </button>
                }
              />
            )}

            {!jobsLoading &&
              jobs.map((job) => (
                <div
                  key={job._id}
                  className={cn(
                    "group rounded-2xl border p-4 transition",
                    selectedId === job._id
                      ? "border-accent bg-accent/[0.04]"
                      : "border-line bg-surface hover:border-ink/25"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedOverride(job._id)}
                    className="block w-full cursor-pointer text-left"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-semibold text-ink">{job.title}</p>
                      <span className="shrink-0 text-xs text-muted">{formatDate(job.createdAt)}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted">{job.location}</p>
                  </button>

                  <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                      <Users size={13} aria-hidden="true" />
                      {counts[job._id] ?? 0} applicants
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(job)}
                        aria-label={`Edit ${job.title}`}
                        className="cursor-pointer rounded-lg p-1.5 text-muted transition hover:bg-ink/[0.06] hover:text-ink"
                      >
                        <PencilSimple size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(job._id)}
                        aria-label={deleteArmId === job._id ? `Confirm delete ${job.title}` : `Delete ${job.title}`}
                        className={cn(
                          "cursor-pointer rounded-lg p-1.5 transition",
                          deleteArmId === job._id
                            ? "bg-bad/10 text-bad hover:bg-bad/20"
                            : "text-muted hover:bg-bad/10 hover:text-bad"
                        )}
                      >
                        {deleteArmId === job._id ? <CheckCircle size={15} weight="fill" /> : <Trash size={15} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* ---- Right: applicants for the selected job ---- */}
        <section aria-label="Applicants">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-ink">
                {selectedJob ? `Applicants · ${selectedJob.title}` : "Applicants"}
              </h2>
              <p className="mt-0.5 text-sm text-muted">
                {selectedJob ? `${selectedJob.company} · ${selectedJob.location}` : "Select a job to review applicants"}
              </p>
            </div>
            {selectedJob && (
              <span className="chip shrink-0 border-line-strong bg-surface text-ink-soft">
                {totalApplicants} total
              </span>
            )}
          </div>

          <div className="mt-5 space-y-4">
            {!selectedJob && (
              <EmptyState
                icon={ArrowLeft}
                title="Pick a job"
                body="Select one of your jobs on the left to review its applicants."
              />
            )}

            {selectedJob && applicantsLoading && (
              <>
                <div className="card skeleton h-36" />
                <div className="card skeleton h-36" />
              </>
            )}

            {selectedJob && applicantsError && (
              <EmptyState
                icon={WarningCircle}
                title="Couldn't load applicants"
                body={applicantsError}
                action={
                  <button
                    onClick={() => setApplicantsReloadKey((k) => k + 1)}
                    className="btn btn-secondary"
                  >
                    Try again
                  </button>
                }
              />
            )}

            {selectedJob && !applicantsLoading && !applicantsError && applicants.length === 0 && (
              <EmptyState
                icon={Users}
                title="No applicants yet"
                body="When someone applies to this job, their resume and cover letter will show up here."
              />
            )}

            {selectedJob &&
              !applicantsLoading &&
              !applicantsError &&
              applicants.map((app) => (
                <article key={app._id} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3.5">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-sm font-semibold text-paper">
                        {app.applicant?.name?.charAt(0) ?? "?"}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">
                          {app.applicant?.name ?? "Unknown"}
                        </p>
                        <p className="truncate text-sm text-muted">{app.applicant?.email}</p>
                        <p className="mt-1 text-xs text-muted">Applied {formatDate(app.createdAt)}</p>
                      </div>
                    </div>

                    {/* Status control */}
                    <label className="flex items-center gap-2">
                      <span className="sr-only">Status for {app.applicant?.name}</span>
                      <select
                        value={app.status}
                        disabled={busyId === app._id}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className="input w-auto cursor-pointer py-2 pr-8 text-sm"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {/* Resume + cover letter */}
                  <div className="mt-4 space-y-3 border-t border-line pt-4">
                    <div className="rounded-xl border border-line bg-paper p-4">
                      <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
                        <FileText size={13} aria-hidden="true" /> Resume
                      </p>
                      <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-ink-soft">
                        {app.resume}
                      </p>
                    </div>
                    {app.coverLetter && (
                      <div className="rounded-xl border border-line bg-paper p-4">
                        <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
                          <PaperPlaneTilt size={13} aria-hidden="true" /> Cover letter
                        </p>
                        <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-ink-soft">
                          {app.coverLetter}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
