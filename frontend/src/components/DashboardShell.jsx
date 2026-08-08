/**
 * DashboardShell — consistent page wrapper for both dashboards:
 * greeting, action slot, and the content area.
 */
export function DashboardShell({ title, subtitle, action, children }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="mt-1.5 text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

/** StatCard — a single number with a label (real data only). */
export function StatCard({ label, value }) {
  return (
    <div className="card px-5 py-4">
      <p className="font-mono text-2xl font-semibold tracking-tight text-ink">{value}</p>
      <p className="mt-1 text-xs font-medium tracking-wide text-muted uppercase">
        {label}
      </p>
    </div>
  );
}
