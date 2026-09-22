import { createContext, useContext } from "react";
import type { AdminProfile } from "../../types";

export type AuthStatus =
  | "loading"
  | "unauthenticated"
  | "awaiting_verification"
  | "verifying"
  | "authenticating"
  | "authenticated";

export interface VerificationMeta {
  email: string;
  sentAt: number;
  expiresAt: number;
  /** Demo backend only: the code that would otherwise have been emailed. */
  devCode?: string;
}

export interface AuthContextValue {
  status: AuthStatus;
  profile: AdminProfile | null;
  error: string | null;
  notice: string | null;
  verification: VerificationMeta | null;
  /** Seconds until a new code may be requested. */
  resendCooldown: number;
  signIn(email: string, password: string): Promise<boolean>;
  verifyCode(code: string): Promise<boolean>;
  resendCode(): Promise<void>;
  cancelVerification(): void;
  signOut(): Promise<void>;
  clearMessages(): void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return context;
}
