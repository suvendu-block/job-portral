"use client";

import { Moon, Sun } from "@phosphor-icons/react";

/**
 * ThemeToggle — flips between light and dark.
 *
 * The icon is chosen purely by CSS: the `theme-dark` variant matches when
 * <html data-theme="dark">, which the inline script in layout.js sets
 * before first paint. No state, no effect, no hydration mismatch — the
 * DOM attribute is the single source of truth.
 */
export function ThemeToggle({ className = "" }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* private mode — ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light or dark theme"
      className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted transition hover:bg-ink/[0.06] hover:text-ink focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none ${className}`}
    >
      {/* Sun shows in light mode (click → dark); Moon in dark mode */}
      <Sun size={18} className="theme-dark:hidden" aria-hidden="true" />
      <Moon size={18} className="hidden theme-dark:block" aria-hidden="true" />
    </button>
  );
}
