import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Inbox, Loader2 } from "lucide-react";

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return <Loader2 className={`animate-spin text-mint ${className}`} />;
}

export function LoadingBlock({
  label = "Loading…",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center gap-2.5 rounded-xl border border-line bg-surface px-6 py-12 ${className}`}
      role="status"
      aria-live="polite"
    >
      <Spinner />
      <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
        {label}
      </span>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line-strong bg-surface/60 px-6 py-14 text-center ${className}`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-card text-muted ring-1 ring-line">
        {icon ?? <Inbox className="h-5 w-5" />}
      </span>
      <h3 className="font-display text-base font-bold text-ink">{title}</h3>
      {description ? (
        <p className="max-w-sm text-[13px] leading-relaxed text-muted-deep">
          {description}
        </p>
      ) : null}
      {action}
    </div>
  );
}

export function Alert({
  tone = "error",
  title,
  children,
  onDismiss,
  className = "",
}: {
  tone?: "error" | "success" | "warning" | "info";
  title?: string;
  children?: ReactNode;
  onDismiss?: () => void;
  className?: string;
}) {
  const tones = {
    error: "border-rose-500/40 bg-rose-500/10 text-rose-200",
    success: "border-mint/40 bg-mint/10 text-mint",
    warning: "border-amber-400/40 bg-amber-400/10 text-amber-200",
    info: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  } as const;

  const icons = {
    error: <AlertTriangle className="h-4 w-4 shrink-0" />,
    success: <CheckCircle2 className="h-4 w-4 shrink-0" />,
    warning: <AlertTriangle className="h-4 w-4 shrink-0" />,
    info: <AlertTriangle className="h-4 w-4 shrink-0" />,
  } as const;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-relaxed ${tones[tone]} ${className}`}
    >
      {icons[tone]}
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className="text-[12px] opacity-90">{children}</div> : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-xs font-bold uppercase opacity-70 transition-opacity hover:opacity-100"
        >
          Dismiss
        </button>
      ) : null}
    </div>
  );
}
