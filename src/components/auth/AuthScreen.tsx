import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  MailCheck,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../lib/auth/context";
import { BRAND } from "../../lib/config";
import { validateEmail, validatePassword, validateVerificationCode } from "../../lib/validation";
import { NexTakeLogo } from "../brand/NexTakeLogo";
import BrandImage from "../brand/BrandImage";
import Button from "../ui/Button";
import { Alert } from "../ui/Feedback";
import { Field, TextInput } from "../ui/Field";
import CodeInput from "./CodeInput";

type Step = "credentials" | "code";

export default function AuthScreen() {
  const {
    status,
    error,
    notice,
    verification,
    resendCooldown,
    signIn,
    verifyCode,
    resendCode,
    cancelVerification,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    code?: string;
  }>({});

  const step: Step = verification ? "code" : "credentials";
  const busy = status === "authenticating" || status === "verifying";

  /* Ticks once a second so the countdown stays a pure render of `now`. */
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = setInterval(tick, 1000);
    tick();
    return () => clearInterval(timer);
  }, [verification]);

  const secondsLeft =
    verification && now !== null
      ? Math.max(0, Math.round((verification.expiresAt - now) / 1000))
      : null;

  const handleCredentials = async (event: React.FormEvent) => {
    event.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setFieldErrors({ email: emailError ?? undefined, password: passwordError ?? undefined });
    if (emailError || passwordError) return;

    await signIn(email.trim(), password);
    setPassword("");
    setCode("");
  };

  const submitCode = async (candidate?: string) => {
    const value = (candidate ?? code).trim();
    const codeError = validateVerificationCode(value);
    setFieldErrors({ code: codeError ?? undefined });
    if (codeError) return;

    await verifyCode(value);
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      {/* Brand bar */}
      <header className="border-b border-line bg-nav">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <NexTakeLogo subtitle="EDITORIAL CONSOLE" />
          <span className="nt-mono hidden text-muted-deep sm:inline">
            {BRAND.slogan}
          </span>
        </div>
      </header>

      {/* Brand banner — /public/header.png, cropped to a slim band here */}
      <div className="mx-auto w-full max-w-md px-4 pt-6 sm:max-w-xl sm:px-6">
        <BrandImage
          src="/header.png"
          alt={`${BRAND.name} — ${BRAND.slogan}`}
          loading="eager"
          className="h-24 w-full rounded-2xl object-cover ring-1 ring-line sm:h-32"
          placeholderClassName="h-24 rounded-2xl bg-gradient-to-r from-navy via-card-alt to-navy ring-1 ring-line sm:h-32"
        />
      </div>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-[0_40px_120px_-60px_rgba(0,242,170,0.35)]">
            {/* Step indicator */}
            <div className="flex items-center gap-2 border-b border-line bg-card-alt px-6 py-3">
              <StepDot active={step === "credentials"} done={step === "code"} label="Credentials" />
              <span className="h-px flex-1 bg-line" />
              <StepDot active={step === "code"} done={false} label="Email verification" />
            </div>

            <div className="space-y-6 px-6 py-7">
              <div className="space-y-1.5 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-navy ring-1 ring-line">
                  {step === "credentials" ? (
                    <Lock className="h-5 w-5 text-mint" />
                  ) : (
                    <MailCheck className="h-5 w-5 text-mint" />
                  )}
                </span>
                <h1 className="font-display text-xl font-extrabold text-ink">
                  {step === "credentials"
                    ? "Administrator sign in"
                    : "Verify your identity"}
                </h1>
                <p className="text-[12px] leading-relaxed text-muted">
                  {step === "credentials"
                    ? "Sign in to manage your newsroom."
                    : `Enter the 6-digit code sent to ${verification?.email ?? "your inbox"}.`}
                </p>
              </div>

              {error ? (
                <Alert tone="error" onDismiss={undefined}>
                  {error}
                </Alert>
              ) : null}

              {notice && !error ? <Alert tone="success">{notice}</Alert> : null}

              {step === "credentials" ? (
                <form onSubmit={handleCredentials} className="space-y-4" noValidate>
                  <Field
                    label="Administrator email"
                    htmlFor="auth-email"
                    required
                    error={fieldErrors.email}
                  >
                    <TextInput
                      id="auth-email"
                      type="email"
                      autoComplete="username"
                      placeholder="editor@nextake.africa"
                      value={email}
                      invalid={Boolean(fieldErrors.email)}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </Field>

                  <Field
                    label="Password"
                    htmlFor="auth-password"
                    required
                    error={fieldErrors.password}
                    hint="Minimum 8 characters."
                  >
                    <TextInput
                      id="auth-password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      invalid={Boolean(fieldErrors.password)}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </Field>

                  <Button
                    type="submit"
                    size="lg"
                    loading={status === "authenticating"}
                    className="w-full"
                    icon={status === "authenticating" ? undefined : <ArrowRight className="h-4 w-4" />}
                  >
                    {status === "authenticating"
                      ? "Checking credentials…"
                      : "Continue"}
                  </Button>

                </form>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-3">
                    <CodeInput
                      value={code}
                      onChange={(next) => setCode(next)}
                      onComplete={(next) => void submitCode(next)}
                      disabled={busy}
                      invalid={Boolean(fieldErrors.code)}
                    />
                    {fieldErrors.code ? (
                      <p className="text-center text-[11px] font-medium text-rose-400">
                        {fieldErrors.code}
                      </p>
                    ) : (
                      <p className="text-center font-mono text-[10px] uppercase tracking-[0.08em] text-muted-deep">
                        {secondsLeft === null
                          ? "Time-limited code"
                          : secondsLeft > 0
                            ? `Expires in ${Math.floor(secondsLeft / 60)}:${String(
                                secondsLeft % 60
                              ).padStart(2, "0")}`
                            : "Code may have expired — resend if it fails"}
                      </p>
                    )}
                  </div>

                  <Button
                    size="lg"
                    loading={status === "verifying"}
                    onClick={() => void submitCode()}
                    className="w-full"
                    icon={status === "verifying" ? undefined : <ShieldCheck className="h-4 w-4" />}
                  >
                    {status === "verifying" ? "Verifying…" : "Verify and continue"}
                  </Button>

                  <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
                    <button
                      type="button"
                      onClick={cancelVerification}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted transition-colors hover:text-ink"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Use another account
                    </button>

                    <button
                      type="button"
                      onClick={() => void resendCode()}
                      disabled={resendCooldown > 0}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-mint transition-opacity disabled:opacity-40"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : "Resend code"}
                    </button>
                  </div>

                  {verification?.devCode ? (
                    <div className="rounded-xl border border-dashed border-amber-400/40 bg-amber-400/10 p-3.5">
                      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-amber-300/80">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
                        Demo workspace — no email sent
                      </div>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[11px] leading-tight text-amber-200/90">
                          Your verification code:
                        </span>
                        <span className="font-mono text-[15px] font-bold text-amber-100">
                          {verification.devCode}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t border-line bg-nav">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-4 text-[11px] text-muted-deep sm:px-6">
          <span>
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}

function StepDot({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  const tone = active
    ? "bg-mint text-navy"
    : done
      ? "bg-mint/20 text-mint ring-1 ring-mint/40"
      : "bg-card text-muted-deep ring-1 ring-line";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] ${tone}`}
    >
      {label}
    </span>
  );
}
