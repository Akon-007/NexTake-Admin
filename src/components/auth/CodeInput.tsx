import { useEffect, useRef } from "react";

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  length?: number;
}

/** Six-digit one-time code entry with paste support and auto-advance. */
export default function CodeInput({
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
  length = 6,
}: CodeInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const setDigit = (index: number, digit: string) => {
    const digits = value.padEnd(length, " ").split("");
    digits[index] = digit.slice(-1);
    const next = digits.join("").replace(/\s+$/, "");
    onChange(next.replace(/\s/g, ""));

    if (digit && index < length - 1) {
      refs.current[index + 1]?.focus();
    }

    if (next.replace(/\s/g, "").length === length) {
      onComplete?.(next.replace(/\s/g, ""));
    }
  };

  return (
    <div
      className="flex items-center justify-center gap-2 sm:gap-2.5"
      role="group"
      aria-label="Verification code"
    >
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          value={value[index] ?? ""}
          aria-label={`Digit ${index + 1}`}
          onChange={(event) => setDigit(index, event.target.value.replace(/\D/g, ""))}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !value[index] && index > 0) {
              event.preventDefault();
              refs.current[index - 1]?.focus();
              const digits = value.split("");
              digits.pop();
              onChange(digits.join(""));
            }
            if (event.key === "ArrowLeft" && index > 0) {
              refs.current[index - 1]?.focus();
            }
            if (event.key === "ArrowRight" && index < length - 1) {
              refs.current[index + 1]?.focus();
            }
          }}
          onPaste={(event) => {
            event.preventDefault();
            const pasted = event.clipboardData
              .getData("text")
              .replace(/\D/g, "")
              .slice(0, length);
            if (!pasted) return;
            onChange(pasted);
            if (pasted.length === length) onComplete?.(pasted);
            refs.current[Math.min(pasted.length, length - 1)]?.focus();
          }}
          className={`h-13 w-11 rounded-xl border bg-surface text-center font-mono text-xl font-bold text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-mint/30 disabled:opacity-60 sm:w-12 ${
            invalid ? "border-rose-500/60" : "border-line hover:border-line-strong"
          }`}
        />
      ))}
    </div>
  );
}
