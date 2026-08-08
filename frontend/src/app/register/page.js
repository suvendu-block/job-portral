"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleNotch, MagnifyingGlass, PencilSimpleLine } from "@phosphor-icons/react";
import { AuthShell } from "@/components/AuthShell";
import { Field } from "@/components/Field";
import { useAuth, dashboardPathFor } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const roles = [
  {
    value: "seeker",
    icon: MagnifyingGlass,
    title: "Job seeker",
    body: "Browse roles and apply",
  },
  {
    value: "recruiter",
    icon: PencilSimpleLine,
    title: "Recruiter",
    body: "Post jobs and review applicants",
  },
];

function RegisterForm() {
  const { register, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("seeker");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!authLoading && user) {
    router.replace(next || dashboardPathFor(user));
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const created = await register({ name, email, password, role });
      router.replace(next || dashboardPathFor(created));
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Create your account</h1>
      <p className="mt-2 text-sm text-muted">
        One account works for both sides of the table.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad"
          >
            {error}
          </div>
        )}

        {/* Role picker — segmented cards */}
        <fieldset>
          <legend className="label">I want to…</legend>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((r) => (
              <label
                key={r.value}
                className={cn(
                  "cursor-pointer rounded-xl border p-4 transition",
                  role === r.value
                    ? "border-accent bg-accent/5 ring-2 ring-accent/40"
                    : "border-line-strong bg-surface hover:border-ink/30"
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={r.value}
                  checked={role === r.value}
                  onChange={() => setRole(r.value)}
                  className="sr-only"
                />
                <r.icon
                  size={20}
                  className={role === r.value ? "text-accent" : "text-muted"}
                  aria-hidden="true"
                />
                <p className="mt-2.5 text-sm font-semibold text-ink">{r.title}</p>
                <p className="mt-0.5 text-xs text-muted">{r.body}</p>
              </label>
            ))}
          </div>
        </fieldset>

        <Field label="Full name" htmlFor="name">
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            minLength={3}
            className="input"
            placeholder="Ada Lovelace"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          hint="At least 6 characters"
        >
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            className="input"
            placeholder="Choose a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <button
          type="submit"
          disabled={submitting || !name || !email || password.length < 6}
          className="btn btn-primary w-full py-3"
        >
          {submitting ? (
            <>
              <CircleNotch size={18} className="animate-spin" aria-hidden="true" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="font-medium text-accent hover:underline"
        >
          Log in
        </Link>
      </p>
    </>
  );
}

export default function RegisterPage() {
  return (
    <AuthShell>
      <Suspense fallback={null}>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
