import { useState } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { AlertCircle, X } from "lucide-react";
import { controlBorder, controlClass } from "./control-styles";

/* ------------------------------------------------------------------ */
/* Field wrapper                                                       */
/* ------------------------------------------------------------------ */

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
  className = "",
}: FieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted"
      >
        {label}
        {required ? <span className="text-mint">*</span> : null}
      </label>

      {children}

      {error ? (
        <p className="flex items-start gap-1.5 text-[11px] font-medium text-rose-400">
          <AlertCircle className="mt-px h-3 w-3 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] leading-relaxed text-muted-deep">{hint}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Inputs                                                              */
/* ------------------------------------------------------------------ */

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  mono?: boolean;
}

export function TextInput({
  invalid,
  mono,
  className = "",
  ...rest
}: TextInputProps) {
  return (
    <input
      className={`${controlClass} ${controlBorder(invalid)} ${
        mono ? "font-mono text-[13px]" : ""
      } ${className}`}
      {...rest}
    />
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function TextArea({ invalid, className = "", ...rest }: TextAreaProps) {
  return (
    <textarea
      className={`${controlClass} ${controlBorder(
        invalid
      )} resize-y leading-relaxed ${className}`}
      {...rest}
    />
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function Select({ invalid, className = "", ...rest }: SelectProps) {
  return (
    <select
      className={`${controlClass} ${controlBorder(
        invalid
      )} cursor-pointer pr-8 ${className}`}
      {...rest}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Toggle                                                              */
/* ------------------------------------------------------------------ */

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  accent?: "mint" | "amber";
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
  accent = "mint",
}: ToggleProps) {
  const onColor =
    accent === "amber" ? "bg-amber-400" : "bg-mint";

  return (
    <label
      className={`flex items-start justify-between gap-4 rounded-xl border border-line bg-surface px-3.5 py-3 ${
        disabled ? "opacity-60" : "hover:border-line-strong"
      } transition-colors`}
    >
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-ink">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-deep">
            {description}
          </span>
        ) : null}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed ${
          checked ? onColor : "bg-line-strong"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-navy transition-all ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Tag / list inputs                                                   */
/* ------------------------------------------------------------------ */

interface TagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  id?: string;
}

export function TagInput({ value, onChange, placeholder, id }: TagInputProps) {
  const [draft, setDraft] = useState("");

  const commit = (raw: string) => {
    const entries = raw
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (entries.length === 0) return;

    const merged = Array.from(new Set([...value, ...entries]));
    onChange(merged);
    setDraft("");
  };

  return (
    <div
      className={`${controlClass} flex flex-wrap items-center gap-1.5 border-line`}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-mint/10 px-2 py-0.5 font-mono text-[11px] font-medium text-mint ring-1 ring-mint/25"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((entry) => entry !== tag))}
            className="text-mint/70 transition-colors hover:text-mint"
            aria-label={`Remove ${tag}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      <input
        id={id}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            commit(draft);
          }
          if (event.key === "Backspace" && !draft && value.length > 0) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => commit(draft)}
        placeholder={value.length === 0 ? placeholder : ""}
        className="min-w-[120px] flex-1 bg-transparent text-sm text-ink placeholder:text-muted-deep focus:outline-none"
      />
    </div>
  );
}


