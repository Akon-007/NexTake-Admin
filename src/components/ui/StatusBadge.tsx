import type { ReactNode } from "react";
import type { PublishStatus } from "../../types";

const STATUS_STYLES: Record<PublishStatus, string> = {
  published: "bg-mint/15 text-mint ring-mint/30",
  draft: "bg-amber-400/10 text-amber-300 ring-amber-400/30",
  scheduled: "bg-sky-400/10 text-sky-300 ring-sky-400/30",
  archived: "bg-slate-500/10 text-slate-400 ring-slate-500/30",
};

export function StatusBadge({
  status,
  className = "",
}: {
  status: PublishStatus;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] ring-1 ${STATUS_STYLES[status]} ${className}`}
    >
      {status}
    </span>
  );
}

export function Pill({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: "neutral" | "mint" | "amber" | "rose" | "sky";
  className?: string;
}) {
  const tones = {
    neutral: "bg-card text-muted ring-line",
    mint: "bg-mint/15 text-mint ring-mint/30",
    amber: "bg-amber-400/10 text-amber-300 ring-amber-400/30",
    rose: "bg-rose-500/10 text-rose-300 ring-rose-500/30",
    sky: "bg-sky-400/10 text-sky-300 ring-sky-400/30",
  } as const;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] ring-1 ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
