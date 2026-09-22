/** Shared form-control styling so every input in the console matches. */
export const controlClass =
  "w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-deep transition-colors focus:outline-none focus:ring-2 focus:ring-mint/30 disabled:opacity-60";

export const controlBorder = (hasError?: boolean) =>
  hasError ? "border-rose-500/60" : "border-line hover:border-line-strong";
