import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-mint text-navy font-extrabold hover:bg-mint-hl active:translate-y-px shadow-[0_6px_20px_-8px_rgba(0,242,170,0.6)]",
  secondary:
    "bg-card text-ink border border-line hover:border-line-strong hover:bg-card-alt",
  ghost: "bg-transparent text-muted hover:text-ink hover:bg-white/5",
  danger:
    "bg-rose-500/10 text-rose-300 border border-rose-500/40 hover:bg-rose-500/20",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[11px] rounded-lg gap-1.5",
  md: "h-10 px-4 text-xs rounded-xl gap-2",
  lg: "h-11 px-5 text-sm rounded-xl gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className = "",
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-semibold tracking-tight transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        icon ?? null
      )}
      {children}
    </button>
  );
}
