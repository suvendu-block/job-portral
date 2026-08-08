"use client";

import { useState } from "react";
import { CircleNotch, X } from "@phosphor-icons/react";
import { Field } from "./Field";

const JOB_TYPES = ["full-time", "part-time", "contract", "internship", "remote"];

/**
 * JobForm — create or edit a job posting (recruiter dashboard).
 * `initial` present = edit mode (PUT), absent = create (POST).
 * Validation mirrors the backend so errors surface immediately.
 */
export function JobForm({ initial, onSubmit, onCancel }) {
  const isEdit = Boolean(initial);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [type, setType] = useState(initial?.type ?? "full-time");
  const [salary, setSalary] = useState(initial?.salary ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const salaryValue = salary === "" ? undefined : Number(salary);
      await onSubmit({
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        type,
        salary: salaryValue,
        description: description.trim(),
      });
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-6" noValidate>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-ink">
          {isEdit ? "Edit job" : "Post a new job"}
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel"
            className="cursor-pointer rounded-lg p-1.5 text-muted transition hover:bg-ink/[0.06] hover:text-ink"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-bad/30 bg-bad/10 px-4 py-3 text-sm text-bad"
        >
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Job title" htmlFor="job-title" className="sm:col-span-2">
          <input
            id="job-title"
            required
            minLength={2}
            className="input"
            placeholder="e.g. Senior React Developer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>

        <Field label="Company" htmlFor="job-company">
          <input
            id="job-company"
            required
            className="input"
            placeholder="e.g. Northwind Studio"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </Field>

        <Field label="Location" htmlFor="job-location">
          <input
            id="job-location"
            required
            className="input"
            placeholder="e.g. New York, NY or Remote"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </Field>

        <Field label="Job type" htmlFor="job-type">
          <select
            id="job-type"
            className="input cursor-pointer"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Annual salary (USD)"
          htmlFor="job-salary"
          hint="Optional — leave blank to hide"
        >
          <input
            id="job-salary"
            type="number"
            min={0}
            step={1000}
            className="input"
            placeholder="e.g. 120000"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
          />
        </Field>

        <Field
          label="Description"
          htmlFor="job-description"
          hint="At least 10 characters — responsibilities, stack, what you offer"
          className="sm:col-span-2"
        >
          <textarea
            id="job-description"
            required
            minLength={10}
            rows={7}
            className="input resize-y"
            placeholder="What will the role do? What are you looking for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-line pt-5">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-ghost">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || !title || !company || !location || description.length < 10}
          className="btn btn-primary"
        >
          {submitting ? (
            <>
              <CircleNotch size={16} className="animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : isEdit ? (
            "Save changes"
          ) : (
            "Publish job"
          )}
        </button>
      </div>
    </form>
  );
}
