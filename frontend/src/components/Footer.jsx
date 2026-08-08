import Link from "next/link";
import { Logo } from "./Logo";

const columns = [
  {
    title: "Platform",
    links: [
      { label: "Browse jobs", href: "/jobs" },
      { label: "Post a job", href: "/dashboard/recruiter" },
      { label: "My applications", href: "/dashboard/seeker" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Create account", href: "/register" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              A simple job platform: browse roles, apply in minutes, and track
              every application from first look to offer.
            </p>
            <p className="mt-4 font-mono text-[11px] tracking-wide text-muted/80 uppercase">
              Express + MongoDB · Next.js
            </p>
          </div>
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="text-sm font-semibold text-ink">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 border-t border-line pt-6">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Junction. A learning project — not a real
            job board.
          </p>
        </div>
      </div>
    </footer>
  );
}
