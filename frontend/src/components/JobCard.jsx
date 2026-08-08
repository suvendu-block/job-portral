"use client";

// Client component: @phosphor-icons/react's main entry uses React context,
// which is not allowed in Server Components. JobCard is only ever rendered
// from client pages (and imported into server components like LatestJobs,
// which is fine — server components can render client components).
import Link from "next/link";
import { MapPin, CurrencyDollar } from "@phosphor-icons/react";
import { formatSalary, timeAgo, monogram, cn } from "@/lib/utils";

const typeLabel = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
  remote: "Remote",
};

export function JobTypeBadge({ type, className = "" }) {
  return (
    <span className={cn("chip border-line-strong bg-surface text-ink-soft", className)}>
      {typeLabel[type] || type}
    </span>
  );
}

/**
 * JobCard — a row in the browse list / search results.
 * Company monogram, title, meta line, salary + type + age.
 */
export function JobCard({ job, className = "" }) {
  return (
    <Link
      href={`/jobs/${job._id}`}
      className={cn(
        "card group flex flex-col gap-4 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-4">
        {/* Company monogram */}
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink text-base font-semibold text-paper transition-colors duration-200 group-hover:bg-accent group-hover:text-accent-ink">
          {monogram(job.company)}
        </span>

        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-ink transition-colors group-hover:text-accent">
            {job.title}
          </h3>
          <p className="mt-0.5 text-sm text-muted">
            {job.company}
            {job.location && (
              <span className="inline-flex items-center gap-1">
                <span className="mx-2 text-line-strong" aria-hidden="true">·</span>
                <MapPin size={13} className="inline -mt-0.5" aria-hidden="true" />
                {job.location}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          {job.salary != null && (
            <span className="chip border-line-strong bg-surface text-ink-soft">
              <CurrencyDollar size={12} weight="bold" aria-hidden="true" />
              {formatSalary(job.salary)}
            </span>
          )}
          <JobTypeBadge type={job.type} />
        </div>
        <span className="text-xs text-muted">{timeAgo(job.createdAt)}</span>
      </div>
    </Link>
  );
}

/** Skeleton placeholder matching JobCard's shape (used while loading). */
export function JobCardSkeleton() {
  return (
    <div className="card skeleton flex items-center justify-between p-5">
      <div className="flex items-center gap-4">
        <div className="h-11 w-11 rounded-xl bg-ink/10" />
        <div className="space-y-2">
          <div className="h-4 w-52 rounded-md bg-ink/10" />
          <div className="h-3 w-40 rounded-md bg-ink/[0.07]" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-24 rounded-full bg-ink/10" />
        <div className="h-3 w-16 rounded-md bg-ink/[0.07] ml-auto" />
      </div>
    </div>
  );
}
