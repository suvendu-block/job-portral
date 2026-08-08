"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleNotch, CheckCircle, X } from "@phosphor-icons/react";
import { apiPost } from "@/lib/api";
import { Field } from "./Field";

/**
 * ApplyModal — resume text + optional cover letter.
 * Renders a real <dialog> (focus-trapped, ESC to close, backdrop
 * click to close) rather than a hand-rolled overlay.
 */
export function ApplyModal({ job, onClose, onApplied }) {
  const router = useRouter();
  const dialogRef = useRef(null);
  const [resume, setResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function close() {
    dialogRef.current?.close();
    onClose?.();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await apiPost(`/jobs/${job._id}/apply`, {
        resume,
        coverLetter: coverLetter || undefined,
      });
      setDone(true);
      onApplied?.();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        // Click on the backdrop (not the panel) closes the dialog
        if (e.target === e.currentTarget) close();
      }}
      className="m-auto w-[calc(100vw-2rem)] max-w-lg rounded-2xl border border-line bg-paper p-0 text-ink shadow-2xl backdrop:bg-ink/60 backdrop:backdrop-blur-sm open:animate-[rise-in_0.25s_ease-out]"
      aria-labelledby="apply-title"
    >
      {done ? (
        <div className="flex flex-col items-center gap-4 px-8 py-14 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-ok/10 text-ok">
            <CheckCircle size={28} weight="fill" aria-hidden="true" />
          </span>
          <div>
            <h2 id="apply-title" className="text-xl font-semibold text-ink">
              Application sent
            </h2>
            <p className="mt-2 text-sm text-muted">
              Your application for <strong className="text-ink">{job.title}</strong> is
              in. The recruiter will review it soon.
            </p>
          </div>
          <div className="mt-2 flex gap-3">
            <button
              onClick={() => router.push("/dashboard/seeker")}
              className="btn btn-primary"
            >
              View my applications
            </button>
            <button onClick={close} className="btn btn-secondary">
              Done
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between border-b border-line px-6 py-5">
            <div>
              <h2 id="apply-title" className="text-lg font-semibold text-ink">
                Apply to {job.title}
              </h2>
              <p className="mt-0.5 text-sm text-muted">{job.company}</p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="cursor-pointer rounded-lg p-1.5 text-muted transition hover:bg-ink/[0.06] hover:text-ink"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6" noValidate>
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad"
              >
                {error}
              </div>
            )}

            <Field
              label="Resume"
              htmlFor="resume"
              hint="Paste the text of your resume — at least 20 characters"
            >
              <textarea
                id="resume"
                required
                minLength={20}
                rows={6}
                className="input resize-y"
                placeholder="Summary, experience, skills…"
                value={resume}
                onChange={(e) => setResume(e.target.value)}
              />
            </Field>

            <Field
              label="Cover letter"
              htmlFor="cover-letter"
              hint="Optional — a short note to the recruiter (max 2000 characters)"
            >
              <textarea
                id="cover-letter"
                rows={4}
                maxLength={2000}
                className="input resize-y"
                placeholder="Why are you a good fit? (optional)"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </Field>

            <button
              type="submit"
              disabled={submitting || resume.trim().length < 20}
              className="btn btn-primary w-full py-3"
            >
              {submitting ? (
                <>
                  <CircleNotch size={18} className="animate-spin" aria-hidden="true" />
                  Sending…
                </>
              ) : (
                "Submit application"
              )}
            </button>
          </form>
        </>
      )}
    </dialog>
  );
}
