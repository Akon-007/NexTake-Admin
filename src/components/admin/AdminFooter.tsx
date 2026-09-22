import { ArrowUp, Mail, ShieldCheck, Terminal } from "lucide-react";
import { NexTakeLogo } from "../brand/NexTakeLogo";
import BrandImage from "../brand/BrandImage";
import { BRAND, isSupabaseConfigured } from "../../lib/config";
import type { NavPageId } from "../../types";

interface AdminFooterProps {
  onNavigate: (page: NavPageId) => void;
  publishedCount: number;
}

export default function AdminFooter({
  onNavigate,
  publishedCount,
}: AdminFooterProps) {
  const latency = isSupabaseConfigured ? "42 ms" : "local";

  return (
    <footer className="border-t border-line bg-nav">
      {/* Brand showcase — /public/footer.png */}
      <BrandImage
        src="/footer.png"
        alt={`${BRAND.name} brand showcase`}
        className="h-20 w-full object-cover sm:h-28"
        placeholderClassName="h-20 bg-gradient-to-r from-navy via-card-alt to-navy sm:h-28"
      />

      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6">
        <div className="grid gap-8 pb-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <NexTakeLogo subtitle="EDITORIAL CONSOLE" />
            <p className="max-w-xs text-[12px] leading-relaxed text-muted-deep">
              {BRAND.slogan} The console curates, verifies and places every story
              that reaches the NexTake wire.
            </p>
            <a
              href={`mailto:${BRAND.contactEmail}`}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] text-mint transition-opacity hover:opacity-80"
            >
              <Mail className="h-3.5 w-3.5" />
              {BRAND.contactEmail}
            </a>
          </div>

          <FooterColumn
            title="Editorial"
            links={[
              { label: "All articles", onClick: () => onNavigate("articles") },
              { label: "Dashboard", onClick: () => onNavigate("home") },
            ]}
          />

          <FooterColumn
            title="Placement"
            links={[
              { label: "Hero carousel", onClick: () => onNavigate("website") },
              { label: "Breaking alerts", onClick: () => onNavigate("website") },
              { label: "The Daily Edit", onClick: () => onNavigate("website") },
            ]}
          />

          <FooterColumn
            title="System"
            links={[
              { label: "Live preview", onClick: () => onNavigate("preview") },
            ]}
          />
        </div>

        {/* Telemetry bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-line pt-5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-deep sm:flex-row">
          <span>
            © {new Date().getFullYear()} {BRAND.name} · Editorial console
          </span>

          <span className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
              </span>
              Live
            </span>
            <span>Latency {latency}</span>
            <span>{publishedCount} live stories</span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-mint" />
              {isSupabaseConfigured ? "RLS enforced" : "Local workspace"}
            </span>
          </span>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-mint"
          >
            <span className="inline-flex items-center gap-1">
              <Terminal className="h-3 w-3" />
              Back to top
            </span>
            <ArrowUp className="h-3 w-3" />
          </button>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; onClick: () => void }>;
}) {
  return (
    <div>
      <h3 className="nt-mono mb-3 text-muted">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <button
              type="button"
              onClick={link.onClick}
              className="text-[12px] text-muted transition-colors hover:text-mint"
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
