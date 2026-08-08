import Link from "next/link";

/**
 * Junction logo — a small "junction" glyph (two crossing bars)
 * on an ink tile, plus the wordmark. Used in the navbar and footer.
 */
export function Logo({ href = "/", className = "" }) {
  return (
    <Link href={href} className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink transition-transform duration-200 group-hover:-rotate-6">
        <svg viewBox="0 0 20 20" className="h-4.5 w-4.5 text-paper" aria-hidden="true">
          {/* two crossing bars = a junction */}
          <rect x="3" y="3" width="14" height="3.4" rx="1.7" fill="currentColor" />
          <rect x="8.3" y="3" width="3.4" height="14" rx="1.7" fill="currentColor" />
        </svg>
      </span>
      <span className="text-lg font-semibold tracking-tight text-ink">
        Junction
      </span>
    </Link>
  );
}
