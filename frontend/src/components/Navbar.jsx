"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { List, X, SignOut, UserCircle } from "@phosphor-icons/react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth, dashboardPathFor } from "@/context/AuthContext";

const navLink = (active) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    active ? "text-ink" : "text-muted hover:text-ink"
  }`;

/**
 * Navbar — auth-aware. Shows Jobs + Dashboard when logged in,
 * Login/Get started when not. Collapses into a sheet on mobile.
 * The mobile sheet closes via onClick on each link (no effect needed).
 */
export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  async function handleLogout() {
    close();
    await logout();
    router.push("/");
  }

  const links = (
    <>
      <Link
        href="/jobs"
        onClick={close}
        className={navLink(pathname.startsWith("/jobs"))}
      >
        Browse jobs
      </Link>
      {user && (
        <Link
          href={dashboardPathFor(user)}
          onClick={close}
          className={navLink(pathname.startsWith("/dashboard"))}
        >
          Dashboard
        </Link>
      )}
    </>
  );

  const account = user ? (
    <div className="flex items-center gap-1.5">
      <span className="hidden items-center gap-2 rounded-lg border border-line bg-surface py-1.5 pr-3 pl-1.5 text-sm md:flex">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-ink text-[11px] font-semibold text-paper">
          {user.name?.charAt(0).toUpperCase()}
        </span>
        <span className="max-w-[120px] truncate font-medium text-ink">{user.name}</span>
      </span>
      <button onClick={handleLogout} className={navLink(false)}>
        Log out
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className={navLink(pathname === "/login")}
      >
        Log in
      </Link>
      <Link href="/register" className="btn btn-primary">
        Get started
      </Link>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        {/* Desktop */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links}
        </nav>
        <div className="hidden items-center gap-1 md:flex">{account}</div>
        <div className="hidden md:block">
          <ThemeToggle />
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-ink transition hover:bg-ink/[0.06]"
          >
            {open ? <X size={20} /> : <List size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {open && (
        <nav
          className="border-t border-line bg-paper px-4 py-4 md:hidden"
          aria-label="Mobile"
        >
          <div className="flex flex-col items-stretch gap-1">
            {links}
            {user ? (
              <>
                <div className="my-2 flex items-center gap-2 border-y border-line py-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-sm font-semibold text-paper">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className={navLink(false)}>
                  <SignOut size={16} className="mr-2 inline -mt-0.5" />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={close}
                  className={navLink(pathname === "/login")}
                >
                  <UserCircle size={16} className="mr-2 inline -mt-0.5" />
                  Log in
                </Link>
                <Link href="/register" onClick={close} className="btn btn-primary mt-2 w-full">
                  Get started
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
