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
  MessageSquare,
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

interface FooterProps {
  newsletterEnabled?: boolean;
  dailyEditLabel?: string;
  newsletterHeadline?: string;
  newsletterDescription?: string;
  newsletterInputPlaceholder?: string;
  newsletterButtonText?: string;
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

export default function Footer({
  newsletterEnabled = true,
  dailyEditLabel = "The Daily Edit",
  newsletterHeadline = "Get The Daily Edit in your inbox",
  newsletterDescription =
    "Join 45,000+ engineers, product creators, and architects receiving curated breakdowns on APIs, UX patterns, and system designs.",
  newsletterInputPlaceholder = "Enter your work email",
  newsletterButtonText = "Subscribe",
}: FooterProps) {
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
    <footer id="footer" className="border-t border-slate-800 bg-slate-900 pb-12 pt-16 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {newsletterEnabled && (
          <section
            id="newsletter"
            aria-labelledby="newsletter-heading"
            className="relative mb-16 overflow-hidden rounded-2xl border border-slate-700/80 bg-gradient-to-br from-slate-800 to-slate-800/70 p-8 shadow-2xl sm:p-10"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />

            <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{dailyEditLabel}</span>
                </div>
                <h2
                  id="newsletter-heading"
                  className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
                >
                  {newsletterHeadline}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
                  {newsletterDescription}
                </p>
              </div>

              <div className="lg:col-span-5">
                {subscribed ? (
                  <div
                    id="subscription-success"
                    className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-4 text-sm text-emerald-200"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                    <div>
                      <span className="block font-semibold">You are on the list!</span>
                      <span className="text-xs text-emerald-300/80">
                        Check your inbox for the next {dailyEditLabel.toLowerCase()} issue.
                      </span>
                    </div>
                  </div>
                ) : (
                  <form
                    id="newsletter-form"
                    onSubmit={handleSubscribe}
                    className="flex flex-col gap-3 sm:flex-row"
                  >
                    <div className="relative flex-1">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="newsletter-email-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={newsletterInputPlaceholder}
                        required
                        className="w-full rounded-xl border border-slate-700 bg-slate-900/80 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 transition-all focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                      />
                    </div>
                    <button
                      id="newsletter-submit-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-violet-900/30 transition-all hover:bg-violet-500 active:bg-violet-700 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <span>Subscribing...</span>
                      ) : (
                        <>
                          <span>{newsletterButtonText}</span>
                          <Send className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                  <span>Zero spam. One click unsubscribe at any time.</span>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 gap-10 border-b border-slate-800 pb-14 md:grid-cols-2 lg:grid-cols-6 lg:gap-8">
          <div className="flex flex-col justify-between lg:col-span-2">
            <div>
              <a
                id="footer-brand-logo"
                href="#"
                className="group inline-flex items-center gap-2.5 rounded-lg focus:outline-none"
              >
                <NexTakeLogo size="md" />
              </a>

              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
                The modern engineering & design publication delivering clear perspectives, in-depth breakdowns, and architectural best practices.
              </p>
            </div>

            <div
              id="footer-status"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="font-medium">All Systems Operational</span>
            </div>
          </div>

          {FOOTER_SECTIONS.map((section, idx) => (
            <div key={section.title} id={`footer-column-${idx}`} className="lg:col-span-1">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-white">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      <span className="transition-transform duration-150 group-hover:translate-x-0.5">
                        {link.label}
                      </span>
                      {link.badge && (
                        <span className="inline-flex items-center rounded border border-violet-500/30 bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">
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

        <div className="flex flex-col items-center justify-between gap-6 pt-8 sm:flex-row">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} NexTake, Inc. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <a href="#" className="transition-colors hover:text-slate-300">
                Privacy
              </a>
              <span className="text-slate-700">•</span>
              <a href="#" className="transition-colors hover:text-slate-300">
                Terms
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <a
              href="#"
              className="rounded-full border border-slate-700 p-2 text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
              aria-label="RSS"
            >
              <Rss className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="rounded-full border border-slate-700 p-2 text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
              aria-label="Community"
            >
              <MessageSquare className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="rounded-full border border-slate-700 p-2 text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
              aria-label="Linked content"
            >
              <Share2 className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="rounded-full border border-slate-700 p-2 text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
              aria-label="Website"
            >
              <Globe className="h-4 w-4" />
            </a>
            <button
              onClick={scrollToTop}
              className="ml-2 inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
