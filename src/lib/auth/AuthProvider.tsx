import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { backend } from "../backend";
import {
  RESEND_COOLDOWN_SECONDS,
  VERIFICATION_CODE_TTL_SECONDS,
} from "../config";
import { AuthContext, type AuthContextValue, type VerificationMeta } from "./context";
import type { AdminProfile } from "../../types";

/**
 * Two-step identity verification.
 *
 *   credentials (Supabase Auth) → emailed time-limited code → session
 *
 * The session is created only by the final step, so an unconfirmed code never
 * grants access to the console or to its data.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [verification, setVerification] = useState<VerificationMeta | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Restore a persisted session (page refresh) and follow auth changes. */
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const boot = async () => {
      try {
        const existing = await backend.auth.getProfile();
        setProfile(existing);
        setStatus(existing ? "authenticated" : "unauthenticated");
      } catch {
        setStatus("unauthenticated");
      }

      unsubscribe = backend.auth.onChange((next) => {
        setProfile(next);
        setStatus(next ? "authenticated" : "unauthenticated");
      });
    };

    void boot();
    return () => unsubscribe?.();
  }, []);

  /* Complete verification from a secure emailed link (?token_hash=…). */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get("token_hash");
    if (!tokenHash || params.get("type") !== "email") return;

    void (async () => {
      setStatus("verifying");
      const result = await backend.auth.verifyEmailLink(tokenHash);

      if (result.error || !result.data) {
        setError(result.error ?? "That verification link is no longer valid.");
        setStatus("unauthenticated");
      } else {
        setProfile(result.data);
        setStatus("authenticated");
      }

      window.history.replaceState({}, "", window.location.pathname);
    })();
  }, []);

  const startCooldown = useCallback((seconds: number) => {
    setResendCooldown(seconds);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);

    cooldownTimer.current = setInterval(() => {
      setResendCooldown((value) => {
        if (value <= 1 && cooldownTimer.current) {
          clearInterval(cooldownTimer.current);
          cooldownTimer.current = null;
          return 0;
        }
        return value - 1;
      });
    }, 1000);
  }, []);

  useEffect(
    () => () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    },
    []
  );

  const dispatchCode = useCallback(
    async (email: string, isResend = false) => {
      const result = await backend.auth.sendVerificationCode(email);

      if (result.error) {
        setError(result.error);
        setNotice(null);
        return false;
      }

      setVerification({
        email,
        sentAt: Date.now(),
        expiresAt:
          Date.now() +
          (result.data?.expiresInSeconds ?? VERIFICATION_CODE_TTL_SECONDS) * 1000,
        devCode: result.data?.devCode,
      });
      setError(null);
      setNotice(
        isResend ? `A new verification code is on its way to ${email}.` : null
      );
      startCooldown(RESEND_COOLDOWN_SECONDS);
      return true;
    },
    [startCooldown]
  );

  /** Step 1 — verify credentials with the auth provider. */
  const signIn = useCallback(
    async (email: string, password: string) => {
      setError(null);
      setNotice(null);
      setStatus("authenticating");

      const credentials = await backend.auth.signInWithPassword(email, password);
      if (credentials.error) {
        setError(credentials.error);
        setStatus("unauthenticated");
        return false;
      }

      const sent = await dispatchCode(email);
      setStatus(sent ? "awaiting_verification" : "unauthenticated");
      return sent;
    },
    [dispatchCode]
  );

  /** Step 2 — exchange the emailed code for a session. */
  const verifyCode = useCallback(
    async (code: string) => {
      if (!verification) {
        setError("Start by signing in with your email and password.");
        setStatus("unauthenticated");
        return false;
      }

      setStatus("verifying");
      setError(null);

      const result = await backend.auth.verifyCode(verification.email, code);
      if (result.error || !result.data) {
        setError(result.error ?? "Verification failed. Request a new code.");
        setStatus("awaiting_verification");
        return false;
      }

      setProfile(result.data);
      setNotice(null);
      setVerification(null);
      setStatus("authenticated");
      return true;
    },
    [verification]
  );

  const resendCode = useCallback(async () => {
    if (!verification) return;
    setError(null);
    setNotice(null);
    await dispatchCode(verification.email, true);
  }, [dispatchCode, verification]);

  const cancelVerification = useCallback(() => {
    setVerification(null);
    setError(null);
    setNotice(null);
    setStatus("unauthenticated");
  }, []);

  const signOut = useCallback(async () => {
    await backend.auth.signOut();
    setProfile(null);
    setVerification(null);
    setNotice(null);
    setError(null);
    setStatus("unauthenticated");
  }, []);

  const clearMessages = useCallback(() => {
    setError(null);
    setNotice(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      profile,
      error,
      notice,
      verification,
      resendCooldown,
      signIn,
      verifyCode,
      resendCode,
      cancelVerification,
      signOut,
      clearMessages,
    }),
    [
      status,
      profile,
      error,
      notice,
      verification,
      resendCooldown,
      signIn,
      verifyCode,
      resendCode,
      cancelVerification,
      signOut,
      clearMessages,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
