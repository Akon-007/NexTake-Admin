import { useState } from "react";
import type { FormEvent } from "react";
import { 
  Sparkles,
  ArrowUp, 
  CheckCircle2, 
  Send,
  Rss,
  Mail,
  ShieldCheck,
  Globe,
  Share2,
  MessageSquare
} from "lucide-react";
import NexTakeLogo from "../components/NexTakeLogo";

interface FooterLink {
  label: string;
  href: string;
  badge?: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: "Product",
    links: [
      { label: "Pulse Engine", href: "#" },
      { label: "Developer APIs", href: "#", badge: "v2.4" },
      { label: "Integrations", href: "#" },
      { label: "Changelog & Releases", href: "#" },
      { label: "Roadmap", href: "#" },
      { label: "Enterprise Security", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Engineering Blog", href: "#" },
      { label: "Architecture Guides", href: "#" },
      { label: "Interactive Demos", href: "#" },
      { label: "Community Forum", href: "#" },
      { label: "Webinars & Events", href: "#" },
      { label: "Status Page", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About NexTake", href: "#" },
      { label: "Careers", href: "#", badge: "Hiring" },
      { label: "Press & News", href: "#" },
      { label: "Leadership Team", href: "#" },
      { label: "Brand Assets", href: "#" },
      { label: "Contact Us", href: "#" },
    ],
  },
  {
    title: "Legal & Trust",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Security & SOC 2", href: "#" },
      { label: "Cookie Settings", href: "#" },
      { label: "Subprocessors", href: "#" },
      { label: "Open Source Credits", href: "#" },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubscribed(true);
      setEmail("");
    }, 600);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="footer" className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter Callout */}
        <section 
          id="newsletter"
          aria-labelledby="newsletter-heading"
          className="relative rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/70 border border-slate-700/80 p-8 sm:p-10 mb-16 overflow-hidden shadow-2xl"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-semibold mb-3 border border-violet-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>NexTake Weekly Digest</span>
              </div>
              <h2 id="newsletter-heading" className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Stay ahead of technology shifts
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
                Join 45,000+ engineers, product creators, and architects receiving weekly curated breakdowns on APIs, UX patterns, and system designs.
              </p>
            </div>

            <div className="lg:col-span-5">
              {subscribed ? (
                <div 
                  id="subscription-success"
                  className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold block">You are on the list!</span>
                    <span className="text-xs text-emerald-300/80">Check your inbox for the welcome issue and starter resources.</span>
                  </div>
                </div>
              ) : (
                <form id="newsletter-form" onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="newsletter-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your work email"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                    />
                  </div>
                  <button
                    id="newsletter-submit-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-sm font-semibold shadow-md shadow-violet-900/30 transition-all disabled:opacity-70 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Subscribing...</span>
                    ) : (
                      <>
                        <span>Subscribe</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
              <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Zero spam. One click unsubscribe at any time.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Links Grid & Brand Column */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 pb-14 border-b border-slate-800">
          
          {/* Brand Info & Mission */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <a 
                id="footer-brand-logo"
                href="#" 
                className="inline-flex items-center gap-2.5 group focus:outline-none rounded-lg"
              >
                <NexTakeLogo size="md" />
              </a>

              <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-sm">
                The modern engineering & design publication delivering clear perspectives, in-depth breakdowns, and architectural best practices.
              </p>
            </div>

            {/* Status indicator */}
            <div id="footer-status" className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium">All Systems Operational</span>
            </div>
          </div>

          {/* Navigation Columns */}
          {FOOTER_SECTIONS.map((section, idx) => (
            <div key={section.title} id={`footer-column-${idx}`} className="lg:col-span-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      <span className="group-hover:translate-x-0.5 transition-transform duration-150">
                        {link.label}
                      </span>
                      {link.badge && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          {link.badge}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>© {new Date().getFullYear()} NexTake, Inc. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy</a>
              <span className="text-slate-700">•</span>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
              <span className="text-slate-700">•</span>
              <a href="#" className="hover:text-slate-300 transition-colors">Cookies</a>
            </div>
          </div>

          {/* Social Icons & Back to Top */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <a
                id="social-link-github"
                href="https://github.com/Akon-007/TechPulse"
                target="_blank"
                rel="noreferrer"
                aria-label="TechPulse on GitHub"
                className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                id="social-link-twitter"
                href="#"
                aria-label="TechPulse on Social"
                className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                id="social-link-discord"
                href="#"
                aria-label="TechPulse Community Discord"
                className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
              <a
                id="social-link-rss"
                href="#"
                aria-label="TechPulse RSS Feed"
                className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <Rss className="w-4 h-4" />
              </a>
            </div>

            <div className="h-4 w-px bg-slate-800 hidden sm:block" />

            <button
              id="back-to-top-btn"
              onClick={scrollToTop}
              aria-label="Scroll back to top"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <span>Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
