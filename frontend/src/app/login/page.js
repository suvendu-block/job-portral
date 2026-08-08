"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeSlash, CircleNotch } from "@phosphor-icons/react";
import { AuthShell } from "@/components/AuthShell";
import { Field } from "@/components/Field";
import { useAuth, dashboardPathFor } from "@/context/AuthContext";

function LoginForm() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Already logged in? Go straight to your dashboard.
  if (!authLoading && user) {
    router.replace(next || dashboardPathFor(user));
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const loggedIn = await login(email.trim(), password);
      router.replace(next || dashboardPathFor(loggedIn));
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">
        Log in to browse roles and track your applications.
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

        <Field label="Password" htmlFor="password">
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className="input pr-11"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted transition hover:text-ink"
            >
              {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>

        <button
          type="submit"
          disabled={submitting || !email || !password}
          className="btn btn-primary w-full py-3"
        >
          {submitting ? (
            <>
              <CircleNotch size={18} className="animate-spin" aria-hidden="true" />
              Logging in…
            </>
          ) : (
            "Log in"
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        New to Junction?{" "}
        <Link
          href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
          className="font-medium text-accent hover:underline"
        >
          Create an account
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <AuthShell>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
