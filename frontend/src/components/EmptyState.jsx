/**
 * EmptyState — a composed "nothing here yet" block with an icon,
 * a message, and an optional action. Used across jobs + dashboards.
 */
export function EmptyState({ icon: Icon, title, body, action, className = "" }) {
  return (
    <div
      className={`card flex flex-col items-center gap-3 px-6 py-16 text-center ${className}`}
    >
      {Icon && (
        <span className="grid h-12 w-12 place-items-center rounded-2xl border border-line bg-ink/[0.03] text-muted">
          <Icon size={22} aria-hidden="true" />
        </span>
      )}
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        {body && <p className="mx-auto max-w-sm text-sm text-muted">{body}</p>}
      </div>
      {action}
    </div>
  );
}
