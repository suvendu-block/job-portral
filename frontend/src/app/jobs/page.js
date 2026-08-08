"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlass, MapPin, X, Funnel } from "@phosphor-icons/react";
import { apiGet } from "@/lib/api";
import { JobCard, JobCardSkeleton } from "@/components/JobCard";
import { EmptyState } from "@/components/EmptyState";
import { Pagination } from "@/components/Pagination";

const JOB_TYPES = ["full-time", "part-time", "contract", "internship", "remote"];
const PAGE_SIZE = 10;

function JobsBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read filters + page from the URL (shareable, refresh-safe)
  const q = searchParams.get("q") || "";
  const location = searchParams.get("location") || "";
  const type = searchParams.get("type") || "";
  const page = Number.parseInt(searchParams.get("page"), 10) || 1;

  const [inputQ, setInputQ] = useState(q);
  const [inputLocation, setInputLocation] = useState(location);

  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(null);
  const [pages, setPages] = useState(1);
  const [error, setError] = useState("");
  const activeRequest = useRef(0); // ignore stale responses

  // Derived loading: we're loading until the current filter set has resolved.
  const paramsKey = JSON.stringify({ q, location, type, page });
  const [loadedKey, setLoadedKey] = useState(null);
  const searching = loadedKey !== paramsKey;

  // Filter changes always restart from page 1
  const applyFilters = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams);
      params.delete("page");
      Object.entries({ q, location, type, ...updates }).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      router.replace(`/jobs?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, q, location, type]
  );

  // Pagination keeps filters and only touches the page param
  const goToPage = useCallback(
    (p) => {
      const params = new URLSearchParams(searchParams);
      if (p > 1) params.set("page", String(p));
      else params.delete("page");
      router.replace(`/jobs?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Fetch whenever the URL filters or page change
  useEffect(() => {
    const requestId = ++activeRequest.current;

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (location) params.set("location", location);
    if (type) params.set("type", type);
    params.set("limit", String(PAGE_SIZE));
    if (page > 1) params.set("page", String(page));
    const query = params.toString();

    apiGet(`/jobs?${query}`)
      .then((data) => {
        if (activeRequest.current !== requestId) return; // stale
        setJobs(data.jobs);
        setTotal(data.total);
        setPages(data.pages);
        setError("");
        setLoadedKey(paramsKey);
      })
      .catch((err) => {
        if (activeRequest.current !== requestId) return;
        setError(err.message);
        setJobs([]);
        setTotal(null);
        setPages(1);
        setLoadedKey(paramsKey);
      });
  }, [q, location, type, page, paramsKey]);

  function handleSearch(e) {
    e.preventDefault();
    applyFilters({ q: inputQ.trim(), location: inputLocation.trim() });
  }

  function clearFilters() {
    setInputQ("");
    setInputLocation("");
    applyFilters({ q: "", location: "", type: "" });
  }

  const hasFilters = Boolean(q || location || type);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Browse roles
        </h1>
        <p className="mt-3 text-muted">
          {total !== null && !searching
            ? `${total.toLocaleString()} open role${total === 1 ? "" : "s"}`
            : "Search by keyword, location, and type"}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-2 inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              <X size={13} aria-hidden="true" /> Clear filters
            </button>
          )}
        </p>
      </div>

      {/* Search + filters */}
      <form
        onSubmit={handleSearch}
        className="mt-8 grid gap-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-[1.4fr_1fr_auto_auto]"
      >
        <label className="sr-only" htmlFor="search-q">Keyword</label>
        <div className="relative">
          <MagnifyingGlass
            size={18}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id="search-q"
            type="search"
            className="input pl-10"
            placeholder="Title, company, or keyword…"
            value={inputQ}
            onChange={(e) => setInputQ(e.target.value)}
          />
        </div>

        <label className="sr-only" htmlFor="search-location">Location</label>
        <div className="relative">
          <MapPin
            size={18}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id="search-location"
            type="text"
            className="input pl-10"
            placeholder="Anywhere or a city…"
            value={inputLocation}
            onChange={(e) => setInputLocation(e.target.value)}
          />
        </div>

        <label className="sr-only" htmlFor="search-type">Job type</label>
        <select
          id="search-type"
          className="input w-auto cursor-pointer appearance-none pr-8"
          value={type}
          onChange={(e) => applyFilters({ type: e.target.value })}
        >
          <option value="">All types</option>
          {JOB_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>

        <button type="submit" className="btn btn-primary px-6">
          <MagnifyingGlass size={16} weight="bold" aria-hidden="true" />
          Search
        </button>
      </form>

      {/* Results */}
      <div className="mt-8 space-y-3.5" aria-busy={searching}>
        {error && (
          <EmptyState
            title="Couldn't load jobs"
            body={error}
            action={
              <button onClick={() => applyFilters({})} className="btn btn-secondary">
                Try again
              </button>
            }
          />
        )}

        {!error && searching && (
          <>
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </>
        )}

        {!error && !searching && jobs.length === 0 && page > 1 && (
          <EmptyState
            icon={Funnel}
            title="This page is empty"
            body="The results changed while you were browsing. Jump back to the first page."
            action={
              <button onClick={() => goToPage(1)} className="btn btn-secondary">
                Go to page 1
              </button>
            }
          />
        )}

        {!error && !searching && jobs.length === 0 && page <= 1 && (
          <EmptyState
            icon={Funnel}
            title="No jobs match your filters"
            body="Try a broader keyword, remove the location, or clear everything and start fresh."
            action={
              <button onClick={clearFilters} className="btn btn-secondary">
                Clear filters
              </button>
            }
          />
        )}

        {!error && !searching &&
          jobs.map((job) => <JobCard key={job._id} job={job} />)}

        {!error && !searching && jobs.length > 0 && (
          <Pagination page={page} pages={pages} onGoTo={goToPage} />
        )}

        {!error && !searching && jobs.length > 0 && (
          <p className="pt-2 text-center text-xs text-muted">
            Not what you’re looking for?{" "}
            <Link href="/register" className="font-medium text-accent hover:underline">
              Create an account
            </Link>{" "}
            and apply in minutes.
          </p>
        )}
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-12 sm:px-6"><JobCardSkeleton /></div>}>
      <JobsBrowser />
    </Suspense>
  );
}
