import { ExternalLink, LogOut, Menu, X, Zap } from "lucide-react";
import { NexTakeLogo } from "../brand/NexTakeLogo";
import { BRAND, isSupabaseConfigured } from "../../lib/config";
import { useAuth } from "../../lib/auth/context";
import type { AdminProfile } from "../../types";

interface AdminHeaderProps {
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onOpenLiveSite: () => void;
  onRequestLogout: () => void;
}

export default function AdminHeader({
  mobileMenuOpen,
  onToggleMobileMenu,
  onOpenLiveSite,
  onRequestLogout,
}: AdminHeaderProps) {
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-nav/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-white/5 hover:text-ink lg:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-mint" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <NexTakeLogo subtitle="EDITORIAL CONSOLE" wordmarkClassName="text-[15px]" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {!isSupabaseConfigured ? (
            <span className="hidden rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-amber-300 sm:inline-flex">
              Demo workspace
            </span>
          ) : null}

          <div className="hidden items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 md:inline-flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
            </span>
            <span className="text-[11px] font-medium text-muted">
              {isSupabaseConfigured ? "Supabase live" : "Local engine"}
            </span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-mint">
              <Zap className="h-3 w-3" />
              {BRAND.version}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenLiveSite}
            className="inline-flex items-center gap-1.5 rounded-lg bg-mint px-3 py-2 text-[11px] font-bold text-navy transition-colors hover:bg-mint-hl"
          >
            <span className="hidden sm:inline">View website</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>

          <ProfileChip profile={profile} onRequestLogout={onRequestLogout} />
        </div>
      </div>
    </header>
  );
}

function ProfileChip({
  profile,
  onRequestLogout,
}: {
  profile: AdminProfile | null;
  onRequestLogout: () => void;
}) {
  const initials =
    (profile?.fullName ?? profile?.email ?? "NA")
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "NA";

  return (
    <div className="flex items-center gap-2 border-l border-line pl-2 sm:pl-3">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-card font-mono text-[11px] font-bold text-mint ring-1 ring-line">
          {initials}
        </span>
        <span className="hidden flex-col leading-tight xl:flex">
          <span className="max-w-[160px] truncate text-[11px] font-semibold text-ink">
            {profile?.fullName ?? profile?.email ?? "Administrator"}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-deep">
            {profile?.role ?? "admin"}
          </span>
        </span>
      </div>

      <button
        type="button"
        onClick={onRequestLogout}
        aria-label="Log out"
        title="Log out"
        className="rounded-lg p-2 text-muted transition-colors hover:bg-rose-500/10 hover:text-rose-300"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
