/** Joins class names, dropping falsy values. */
export function cn(...parts) {
  return parts.filter(Boolean).join(" ");
}

/** Formats an annual salary like 120000 -> "$120,000/yr" */
export function formatSalary(salary) {
  if (salary === undefined || salary === null || Number.isNaN(salary)) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(salary) + "/yr";
}

/** Formats an ISO date for display, e.g. "Aug 2, 2026" */
export function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Relative time, e.g. "2h ago", "3d ago" — refreshes only on mount. */
export function timeAgo(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

/** First letter of a company name, for monogram avatars. */
export function monogram(name = "") {
  return name.trim().charAt(0).toUpperCase() || "?";
}

/** Maps an application status to the badge tone used across the app. */
export function statusTone(status) {
  switch (status) {
    case "accepted":
      return "ok";
    case "rejected":
      return "bad";
    case "shortlisted":
      return "warn";
    case "reviewed":
      return "accent";
    default:
      return "neutral"; // pending
  }
}
