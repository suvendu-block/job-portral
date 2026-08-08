import Link from "next/link";
import { ArrowRight, MapPin } from "@phosphor-icons/react/dist/ssr";
import { JobTypeBadge } from "./JobCard";
import { formatSalary, timeAgo, monogram } from "@/lib/utils";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * LatestJobs — the 3 freshest openings, fetched from the API at request
 * time (server component). If the backend is unreachable the section
 * simply doesn't render — the landing page must never break on it.
 */
export async function LatestJobs() {
  let jobs = [];
  try {
    const res = await fetch(`${API_BASE}/jobs?limit=3`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      jobs = data.jobs ?? [];
    }
  } catch {
    /* backend down — hide the section */
  }

  if (jobs.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Latest openings
          </h2>
          <p className="mt-2 text-muted">Fresh roles, straight from the board.</p>
        </div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
        >
          Browse all jobs <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {jobs.map((job) => (
          <Link
            key={job._id}
            href={`/jobs/${job._id}`}
            className="card group flex flex-col gap-4 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)]"
          >
            <div className="flex items-center gap-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-sm font-semibold text-paper transition-colors duration-200 group-hover:bg-accent group-hover:text-accent-ink">
                {monogram(job.company)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-ink transition-colors group-hover:text-accent">
                  {job.title}
                </p>
                <p className="truncate text-sm text-muted">{job.company}</p>
              </div>
            </div>

            <p className="flex items-center gap-1 text-xs text-muted">
              <MapPin size={13} aria-hidden="true" />
              {job.location} · {timeAgo(job.createdAt)}
            </p>

            <div className="mt-auto flex flex-wrap gap-2 border-t border-line pt-3.5">
              <JobTypeBadge type={job.type} />
              {job.salary != null && (
                <span className="chip border-line-strong bg-surface text-ink-soft">
                  {formatSalary(job.salary)}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
