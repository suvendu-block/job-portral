import { statusTone, cn } from "@/lib/utils";

const toneStyles = {
  neutral: "border-line-strong bg-ink/[0.04] text-ink-soft",
  accent: "border-accent/30 bg-accent/10 text-accent",
  ok: "border-ok/30 bg-ok/10 text-ok",
  warn: "border-warn/30 bg-warn/10 text-warn",
  bad: "border-bad/30 bg-bad/10 text-bad",
};

/**
 * StatusBadge — renders an application status as a pill.
 * Tones are functional (pending=neutral, reviewed=accent,
 * shortlisted=warn, accepted=ok, rejected=bad).
 */
export function StatusBadge({ status, className = "" }) {
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";
  return (
    <span
      className={cn(
        "chip",
        toneStyles[statusTone(status)],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  );
}
