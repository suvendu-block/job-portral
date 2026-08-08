import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  MagnifyingGlass,
  PaperPlaneTilt,
  ListChecks,
  MapPin,
  CurrencyDollar,
  Users,
  UserPlus,
  PencilSimpleLine,
} from "@phosphor-icons/react/dist/ssr";
import { LatestJobs } from "@/components/LatestJobs";

/* ============================================================
   Landing page
   Layout families used (no repetition):
   1. Ink hero band, split copy + real mini-UI job cards
   2. Editorial numbered steps (hairline rows, no cards)
   3. Two-tone role panels (surface + ink band)
   4. Full-width ink CTA band
   ============================================================ */

// Illustrative demo cards for the hero visual — not fetched data.
const demoJobs = [
  {
    title: "Product Designer",
    company: "Northwind Studio",
    location: "Remote",
    type: "Full-time",
    salary: "$140k/yr",
  },
  {
    title: "Backend Engineer",
    company: "Meridian Labs",
    location: "Berlin, DE",
    type: "Contract",
    salary: "$110k/yr",
  },
];

const steps = [
  {
    n: "01",
    icon: UserPlus,
    title: "Create your account",
    body: "Choose a side: seeker or recruiter. Registration takes under a minute.",
  },
  {
    n: "02",
    icon: MagnifyingGlass,
    title: "Find work or post work",
    body: "Search roles by keyword, location, and type, or publish an opening in minutes.",
  },
  {
    n: "03",
    icon: ListChecks,
    title: "Apply, review, hire",
    body: "Track every application from pending to accepted, all from one dashboard.",
  },
];

const seekerFeatures = [
  {
    icon: MagnifyingGlass,
    text: "Search roles by keyword, location, and type",
  },
  {
    icon: PaperPlaneTilt,
    text: "Apply with a resume and a short note",
  },
  {
    icon: ListChecks,
    text: "Watch your status move from pending to accepted",
  },
];

const recruiterFeatures = [
  {
    icon: PencilSimpleLine,
    text: "Publish a role in minutes, no templates required",
  },
  {
    icon: Users,
    text: "Review every applicant in one place",
  },
  {
    icon: CheckCircle,
    text: "Move candidates forward with one click",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ---------- 1. Hero ---------- */}
      <section className="bg-band text-band-ink">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pt-20 lg:pb-28">
          <div className="rise-in">
            <h1 className="max-w-xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Find your <em className="font-medium italic">next</em> role.
              <br />
              Build your <em className="font-medium italic">next</em> team.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-band-muted">
              Junction is a simple job platform. Post openings, apply in
              minutes, and track every application from first look to offer.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/jobs" className="btn btn-primary px-6 py-3 text-base">
                Browse jobs
                <ArrowRight size={18} weight="bold" aria-hidden="true" />
              </Link>
              <Link href="/register" className="btn btn-band px-6 py-3 text-base">
                Post a job
              </Link>
            </div>
            <p className="mt-6 font-mono text-xs tracking-wide text-band-muted/80">
              Jobs · Applications · Hiring — no ceremony
            </p>
          </div>

          {/* Real mini-UI preview: two job cards + a status chip */}
          <div className="rise-in relative mx-auto w-full max-w-md lg:max-w-none" style={{ animationDelay: "0.15s" }}>
            <div className="relative space-y-4">
              {demoJobs.map((job, i) => (
                <div
                  key={job.title}
                  className={`card relative bg-surface p-5 text-ink ${
                    i === 1 ? "rotate-1" : "-rotate-1"
                  }`}
                  style={{ animationDelay: `${0.25 + i * 0.12}s` }}
                >
                  <div className="flex items-center gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-base font-semibold text-paper">
                      {job.company.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold">{job.title}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
                        {job.company}
                        <span className="mx-1 text-line-strong" aria-hidden="true">·</span>
                        <MapPin size={13} aria-hidden="true" />
                        {job.location}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="chip border-line-strong bg-surface text-ink-soft">
                      <CurrencyDollar size={12} weight="bold" aria-hidden="true" />
                      {job.salary}
                    </span>
                    <span className="chip border-line-strong bg-surface text-ink-soft">
                      {job.type}
                    </span>
                  </div>
                </div>
              ))}

              {/* Floating status chip */}
              <div className="absolute -top-4 -right-2 flex items-center gap-2 rounded-full bg-ok/90 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg sm:-right-4">
                <CheckCircle size={14} weight="fill" aria-hidden="true" />
                Shortlisted
              </div>
            </div>

            {/* subtle accent backdrop */}
            <div
              className="absolute inset-x-8 -bottom-10 -z-10 h-40 rounded-full bg-accent/25 blur-3xl"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      {/* ---------- 1.5 Latest openings (real data from the API) ---------- */}
      <LatestJobs />

      {/* ---------- 2. How it works (editorial rows) ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Three steps. Zero friction.
          </h2>
          <p className="mt-4 text-lg text-muted">
            Everything you need to hire or get hired, without the ceremony.
          </p>
        </div>

        <ol className="mt-12">
          {steps.map((step) => (
            <li
              key={step.n}
              className="group grid items-baseline gap-3 border-t border-line py-8 transition-colors last:border-b sm:grid-cols-[auto_56px_1fr] sm:gap-8"
            >
              <span className="font-mono text-sm text-muted transition-colors group-hover:text-accent">
                {step.n}
              </span>
              <step.icon
                size={26}
                className="text-muted transition-colors group-hover:text-accent"
                aria-hidden="true"
              />
              <div>
                <h3 className="text-xl font-semibold text-ink">{step.title}</h3>
                <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-muted">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- 3. Two roles, two tones ---------- */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:pb-28">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Two sides, one workflow.
          </h2>
          <p className="mt-4 text-lg text-muted">
            One platform, built for both people in the room.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Seekers — light surface */}
          <div className="card flex flex-col justify-between gap-10 p-8">
            <div>
              <p className="font-mono text-xs tracking-widest text-accent uppercase">
                For job seekers
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
                Apply without the paperwork
              </h3>
              <ul className="mt-7 space-y-4">
                {seekerFeatures.map((f) => (
                  <li key={f.text} className="flex items-start gap-3.5">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line bg-ink/[0.03] text-accent">
                      <f.icon size={16} aria-hidden="true" />
                    </span>
                    <span className="text-[15px] leading-relaxed text-ink-soft">
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <Link href="/register" className="btn btn-secondary w-fit">
              Get started
            </Link>
          </div>

          {/* Recruiters — ink band */}
          <div className="flex flex-col justify-between gap-10 rounded-2xl bg-band p-8 text-band-ink">
            <div>
              <p className="font-mono text-xs tracking-widest text-band-muted uppercase">
                For recruiters
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                Hire without the inbox chaos
              </h3>
              <ul className="mt-7 space-y-4">
                {recruiterFeatures.map((f) => (
                  <li key={f.text} className="flex items-start gap-3.5">
                    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/15 bg-white/5">
                      <f.icon size={16} aria-hidden="true" />
                    </span>
                    <span className="text-[15px] leading-relaxed text-band-muted">
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <Link href="/register" className="btn btn-primary w-fit">
              Post a job
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- 4. CTA band ---------- */}
      <section className="bg-band text-band-ink">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:py-24">
          <h2 className="mx-auto max-w-xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Ready when you are.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-lg text-band-muted">
            Sign up in under a minute, then browse roles or post your first
            opening today.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="btn btn-primary px-6 py-3 text-base">
              Get started
            </Link>
            <Link href="/jobs" className="btn btn-band px-6 py-3 text-base">
              Browse jobs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
