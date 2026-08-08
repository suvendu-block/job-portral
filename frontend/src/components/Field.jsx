"use client";

/**
 * Field — labeled form control (input / textarea / select).
 * Error text renders below the control, helper text as a hint.
 * Label is always above the input — never placeholder-as-label.
 */
export function Field({
  label,
  hint,
  error,
  className = "",
  children,
  ...labelProps
}) {
  return (
    <div className={className}>
      <label className="label" {...labelProps}>
        {label}
      </label>
      {children}
      {hint && !error && <span className="hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
