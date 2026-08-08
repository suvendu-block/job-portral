/**
 * Pagination — page-number buttons with ellipsis for large ranges.
 * Current page is a filled accent pill; ellipsis items are non-interactive.
 */
export function Pagination({ page, pages, onGoTo }) {
  if (pages <= 1) return null;

  // Window of page numbers around the current page
  function pageItems() {
    if (pages <= 7) {
      return Array.from({ length: pages }, (_, i) => i + 1);
    }
    const set = new Set([1, pages, page - 1, page, page + 1]);
    const sorted = [...set].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);
    const items = [];
    let prev = 0;
    for (const p of sorted) {
      if (p - prev > 1) items.push("…");
      items.push(p);
      prev = p;
    }
    return items;
  }

  const buttonBase =
    "inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-lg px-2.5 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1.5 pt-6">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onGoTo(page - 1)}
        className={`${buttonBase} border border-line-strong bg-surface text-ink hover:border-ink/30`}
      >
        Previous
      </button>

      {pageItems().map((item, i) =>
        item === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-muted" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-current={item === page ? "page" : undefined}
            onClick={() => onGoTo(item)}
            className={`${buttonBase} ${
              item === page
                ? "bg-accent text-accent-ink"
                : "border border-line-strong bg-surface text-ink hover:border-ink/30"
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        disabled={page >= pages}
        onClick={() => onGoTo(page + 1)}
        className={`${buttonBase} border border-line-strong bg-surface text-ink hover:border-ink/30`}
      >
        Next
      </button>
    </nav>
  );
}
