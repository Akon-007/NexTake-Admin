import { LayoutDashboard, Globe, FileText, LogOut, ChevronRight, Zap } from "lucide-react";
import type { NavPageId } from "../types";

interface AdminSidebarProps {
  currentPage: NavPageId;
  onNavigate: (page: NavPageId) => void;
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  articleCount: number;
}

export default function AdminSidebar({
  currentPage,
  onNavigate,
  mobileMenuOpen,
  onCloseMobileMenu,
  articleCount,
}: AdminSidebarProps) {
  const navItems = [
    {
      id: 'home' as NavPageId,
      label: 'Home page',
      description: 'Dashboard & live health',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'website' as NavPageId,
      label: 'Website',
      description: 'Structure, hero & layout',
      icon: Globe,
      badge: 'LIVE',
    },
    {
      id: 'blog' as NavPageId,
      label: 'Blog',
      description: 'Articles & editor',
      icon: FileText,
      badge: articleCount > 0 ? `${articleCount}` : null,
      isNewBadge: true,
    },
    {
      id: 'logout' as NavPageId,
      label: 'Log out',
      description: 'End admin session',
      icon: LogOut,
      badge: null,
      isDanger: true,
    },
  ];

  const handleItemClick = (pageId: NavPageId) => {
    onNavigate(pageId);
    onCloseMobileMenu();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          id="mobile-sidebar-backdrop"
          onClick={onCloseMobileMenu}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside
        id="admin-sidebar"
        className={`fixed top-16 sm:top-18 bottom-0 left-0 z-35 w-64 bg-[#071A2B] border-r border-[#0f2c45] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Navigation Sections */}
        <div className="p-4 space-y-6 overflow-y-auto">
          <div>
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Management Portal
            </span>
            <nav id="admin-nav-list" aria-label="Admin Sections" className="space-y-1.5">
              {navItems.slice(0, 3).map((item) => {
                const isActive = currentPage === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full group flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#7FFFD4]/12 text-[#7FFFD4] font-semibold ring-1 ring-[#7FFFD4]/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-[#7FFFD4] text-[#071A2B]'
                            : 'bg-[#0f2c45] text-slate-300 group-hover:text-white group-hover:bg-[#163857]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm tracking-tight">{item.label}</span>
                        <span className="text-[10px] text-slate-400 font-normal leading-none mt-0.5">
                          {item.description}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide ${
                            item.isNewBadge
                              ? 'bg-[#7FFFD4] text-[#071A2B]'
                              : 'bg-[#0f2c45] text-[#7FFFD4] border border-[#7FFFD4]/30'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7FFFD4]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Stats Widget in Sidebar */}
          <div className="p-3.5 rounded-xl bg-[#092238] border border-[#10314d] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#7FFFD4]" />
                NexTake Sync
              </span>
              <span className="text-[10px] text-[#7FFFD4] font-mono font-medium">99.9% Up</span>
            </div>
            {/* Progress indicator */}
            <div className="w-full bg-[#071A2B] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#7FFFD4] h-full rounded-full transition-all duration-500"
                style={{ width: '84%' }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
              <span>Cloud Engine</span>
              <span className="text-white font-medium">Connected</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Log out button */}
        <div className="p-4 border-t border-[#0f2c45]">
          <button
            id="sidebar-nav-logout"
            onClick={() => handleItemClick('logout')}
            className={`w-full group flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all cursor-pointer ${
              currentPage === 'logout'
                ? 'bg-rose-500/20 text-rose-300 font-semibold ring-1 ring-rose-500/40'
                : 'text-slate-300 hover:text-rose-300 hover:bg-rose-500/10'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0f2c45] group-hover:bg-rose-950/60 flex items-center justify-center text-slate-300 group-hover:text-rose-300 transition-colors">
                <LogOut className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm tracking-tight font-medium">Log out</span>
                <span className="text-[10px] text-slate-400 font-normal leading-none mt-0.5">
                  End admin session
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-rose-300 transition-colors" />
          </button>
        </div>
      </aside>
    </>
  );
}
