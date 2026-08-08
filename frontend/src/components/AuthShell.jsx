import Link from "next/link";
import { CheckCircle, MapPin, CurrencyDollar } from "@phosphor-icons/react/dist/ssr";

/**
 * AuthShell — split-screen wrapper for login/register:
 * left = ink panel with a real mini-UI job card + pitch,
 * right = the form.
 */
export function AuthShell({ children }) {
  return (
    <div className="grid min-h-[calc(100dvh-4rem)] lg:grid-cols-[0.95fr_1.05fr]">
      {/* Pitch panel (hidden on small screens) */}
      <div className="hidden bg-band p-12 text-band-ink lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="font-mono text-xs tracking-widest text-band-muted uppercase">
            Welcome to Junction
          </p>
          <h2 className="mt-4 max-w-sm text-3xl leading-tight font-semibold tracking-tight text-balance">
            Your next role is one form away.
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-band-muted">
            One account for both sides of the table: apply to roles as a
            seeker, or manage applicants as a recruiter.
          </p>
        </div>

        {/* Mini job card preview */}
        <div className="relative">
          <div className="card max-w-sm -rotate-1 bg-surface p-5 text-ink">
            <div className="flex items-center gap-4">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-base font-semibold text-paper">
                N
              </span>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold">Frontend Engineer</p>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
                  Northwind Studio
                  <span className="mx-1 text-line-strong" aria-hidden="true">·</span>
                  <MapPin size={13} aria-hidden="true" />
                  Remote
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="chip border-line-strong bg-surface text-ink-soft">
                <CurrencyDollar size={12} weight="bold" aria-hidden="true" />
                $135k/yr
              </span>
              <span className="chip border-line-strong bg-surface text-ink-soft">
                Full-time
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-sm">
              <CheckCircle size={16} weight="fill" className="text-ok" aria-hidden="true" />
              <span className="text-ink-soft">Application under review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-14 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-ink"
          >
            <span aria-hidden="true">←</span> Back to home
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
