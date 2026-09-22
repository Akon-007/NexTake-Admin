import {
  FileText,
  Globe,
  LayoutDashboard,
  LogOut,
  Radio,
  X,
} from "lucide-react";
import type { NavPageId } from "../../types";

interface AdminSidebarProps {
  currentPage: NavPageId;
  onNavigate: (page: NavPageId) => void;
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  articleCount: number;
  draftCount: number;
  scheduledCount: number;
}

const NAV_ITEMS: Array<{
  id: NavPageId;
  label: string;
  description: string;
  icon: typeof LayoutDashboard;
}> = [
  {
    id: "home",
    label: "Dashboard",
    description: "Feed health & activity",
    icon: LayoutDashboard,
  },
  {
    id: "articles",
    label: "Articles",
    description: "Curate, publish, schedule",
    icon: FileText,
  },
  {
    id: "website",
    label: "Feed placement",
    description: "Hero, breaking & digest",
    icon: Globe,
  },
  {
    id: "preview",
    label: "Live preview",
    description: "What readers see",
    icon: Radio,
  },
];

export default function AdminSidebar({
  currentPage,
  onNavigate,
  mobileMenuOpen,
  onCloseMobileMenu,
  articleCount,
  draftCount,
  scheduledCount,
}: AdminSidebarProps) {
  const handle = (page: NavPageId) => {
    onNavigate(page);
    onCloseMobileMenu();
  };

  return (
    <>
      {mobileMenuOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onCloseMobileMenu}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed bottom-0 left-0 top-16 z-50 flex w-64 flex-col justify-between border-r border-line bg-nav transition-transform duration-200 lg:z-30 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
        aria-label="Admin sections"
      >
        <div className="flex-1 space-y-6 overflow-y-auto p-4">
          <div className="flex items-center justify-between lg:hidden">
            <span className="nt-mono text-muted-deep">Navigation</span>
            <button
              type="button"
              onClick={onCloseMobileMenu}
              className="rounded-lg p-1.5 text-muted hover:bg-white/5 hover:text-ink"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handle(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={`group flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-left transition-colors ${
                    active
                      ? "bg-mint/10 text-mint ring-1 ring-mint/25"
                      : "text-muted hover:bg-white/5 hover:text-ink"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        active
                          ? "bg-mint text-navy"
                          : "bg-card text-muted group-hover:text-ink"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold tracking-tight">
                        {item.label}
                      </span>
                      <span className="block text-[10px] leading-none text-muted-deep">
                        {item.description}
                      </span>
                    </span>
                  </span>

                  {item.id === "articles" && articleCount > 0 ? (
                    <span className="rounded-md bg-card px-1.5 py-0.5 font-mono text-[10px] font-bold text-mint ring-1 ring-line">
                      {articleCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div className="space-y-2 rounded-xl border border-line bg-card p-3.5">
            <div className="flex items-center justify-between">
              <span className="nt-mono text-muted-deep">Pipeline</span>
              <span className="font-mono text-[10px] text-mint">
                {draftCount + scheduledCount} pending
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy">
              <div
                className="h-full rounded-full bg-mint transition-all"
                style={{
                  width: `${
                    articleCount === 0
                      ? 0
                      : Math.round(
                          ((articleCount - draftCount - scheduledCount) / articleCount) * 100
                        )
                  }%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-deep">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-sm bg-amber-400/70" />
                <span>{draftCount} draft{draftCount === 1 ? "" : "s"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-sm bg-sky-400/70" />
                <span>{scheduledCount} scheduled{scheduledCount === 1 ? "" : "s"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-line p-4">
          <button
            type="button"
            onClick={() => handle("logout")}
            className="group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-muted transition-colors hover:bg-rose-500/10 hover:text-rose-300"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-muted transition-colors group-hover:bg-rose-500/15 group-hover:text-rose-300">
              <LogOut className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-[13px] font-semibold">Log out</span>
              <span className="block text-[10px] leading-none text-muted-deep">
                End verified session
              </span>
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
