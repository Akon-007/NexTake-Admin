import { ArrowLeft, Sparkles, Search } from "lucide-react";
import type { WebsiteConfig, Article } from "../types";
import Footer from "../Pages/Footer";
import NexTakeLogo from "./NexTakeLogo";

interface LiveWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WebsiteConfig;
  articles: Article[];
}

export default function LiveWebsiteModal({
  isOpen,
  onClose,
  config,
  articles,
}: LiveWebsiteModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      id="live-website-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-white"
    >
      {/* Top Admin Return Bar in Deep Navy */}
      <div className="sticky top-0 z-50 bg-[#071A2B] text-white px-4 sm:px-8 py-3 flex items-center justify-between border-b border-[#0f2c45]">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7FFFD4] text-[#071A2B] text-xs font-bold hover:bg-[#68f0c5] transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Admin Console</span>
          </button>
          <span className="hidden sm:inline-block text-xs text-slate-300">
            Previewing: <strong className="text-white">{config.siteName} Public Website</strong>
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0d263d] border border-[#7FFFD4]/30 text-[#7FFFD4] font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7FFFD4] animate-pulse" />
            Live Preview
          </span>
        </div>
      </div>

      {/* Public Landing Page */}
      <div className="min-h-screen bg-white text-[#071A2B]">
        
        {/* Public Header in Deep Navy */}
        <header className="bg-[#071A2B] text-white border-b border-[#0f2c45]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <NexTakeLogo size="sm" />
            </div>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
              {config.navLinks.map((link) => (
                <a 
                  key={link.label} 
                  href={link.href}
                  className="hover:text-[#7FFFD4] transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div>
              <button 
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg bg-[#7FFFD4] text-[#071A2B] text-xs font-bold hover:bg-[#68f0c5] transition-all cursor-pointer"
              >
                Admin Panel
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-slate-50 border-b border-[#071A2B]/10 py-16 sm:py-24 text-center px-4 relative overflow-hidden">
          <div className="pointer-events-none absolute -left-20 -top-20 w-80 h-80 bg-[#7FFFD4]/10 rounded-full blur-3xl" />
          
          <div className="max-w-3xl mx-auto space-y-6 relative">
            {config.heroBadge && (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7FFFD4]/20 text-[#071A2B] text-xs font-bold border border-[#7FFFD4]/40 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#071A2B]" />
                <span>{config.heroBadge}</span>
              </span>
            )}

            <h1 className="text-3xl sm:text-5xl font-black text-[#071A2B] tracking-tight leading-tight">
              {config.heroTitle}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {config.heroSubtitle}
            </p>

            {config.searchEnabled && (
              <div className="max-w-md mx-auto pt-2">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search technical insights, patterns, and guides..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-[#071A2B] shadow-xs focus:outline-none focus:border-[#071A2B] focus:ring-2 focus:ring-[#7FFFD4]/40"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Articles Grid (Majority of content has white background) */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between pb-8 mb-8 border-b border-[#071A2B]/10">
            <div>
              <h2 className="text-2xl font-black text-[#071A2B] tracking-tight">
                Latest Publications
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Curated articles maintained through the NexTake console
              </p>
            </div>
            <span className="text-xs font-bold text-[#071A2B] bg-[#7FFFD4]/20 border border-[#7FFFD4]/40 px-2.5 py-1 rounded-lg">
              {articles.filter(a => a.status === 'published').length} Active Articles
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.filter(a => a.status === 'published').map((article) => (
              <article
                key={article.id}
                className="group flex flex-col rounded-2xl bg-white border border-[#071A2B]/15 overflow-hidden shadow-xs hover:border-[#071A2B]/30 hover:shadow-md transition-all"
              >
                <div className="aspect-[16/10] w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-md bg-[#7FFFD4] text-[#071A2B] shadow-xs">
                    {article.category}
                  </span>
                  {article.isNew && (
                    <span className="absolute top-3 right-3 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#071A2B] text-[#7FFFD4]">
                      NEW
                    </span>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-[#071A2B] leading-snug group-hover:text-purple-900 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={article.avatar}
                        alt={article.author}
                        className="w-7 h-7 rounded-full object-cover border border-[#071A2B]/10"
                      />
                      <span className="font-semibold text-[#071A2B]">{article.author}</span>
                    </div>
                    <span>{article.date}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>

        {/* Public Footer */}
        <Footer />

      </div>
    </div>
  );
}
