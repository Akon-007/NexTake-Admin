import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, ExternalLink, Mail, Radio, Send } from "lucide-react";
import { useCms } from "../../lib/store/context";
import { isLive } from "../../lib/visibility";
import { backend } from "../../lib/backend";
import type { NewsletterFrequency } from "../../lib/backend";
import { isEmail } from "../../lib/validation";
import { NexTakeLogo, NexTakeMobileBar } from "../brand/NexTakeLogo";
import BrandImage from "../brand/BrandImage";
import Button from "../ui/Button";
import { EmptyState } from "../ui/Feedback";
import type { Article } from "../../types";

/**
 * Renders the public NexTake blog from the exact same records the admin
 * edits — the shared `articles` table — so placement rules can be checked
 * before publishing.
 */
export default function LivePreview() {
  const navigate = useNavigate();
  const { articles, settings, loading } = useCms();

  const published = useMemo(
    () =>
      articles
        .filter((article) => isLive(article))
        .sort(
          (a, b) =>
            new Date(b.publishedAt ?? b.createdAt).getTime() -
            new Date(a.publishedAt ?? a.createdAt).getTime()
        ),
    [articles]
  );

  const hero = useMemo(
    () =>
      published
        .filter((article) => article.heroPriority !== null)
        .sort((a, b) => (a.heroPriority ?? 9) - (b.heroPriority ?? 9)),
    [published]
  );

  const breaking = useMemo(
    () => (settings.breakingEnabled ? published.find((a) => a.isBreaking) : undefined),
    [published, settings.breakingEnabled]
  );

  const lead = hero[0];
  const supporting = hero.slice(1);

  return (
    <div className="min-h-screen bg-canvas">
      {/* Admin return bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-line bg-nav px-4 py-2.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            size="sm"
            icon={<ArrowLeft className="h-3.5 w-3.5" />}
            onClick={() => navigate("/")}
          >
            Return to console
          </Button>
          <span className="hidden truncate text-[11px] text-muted sm:inline">
            Previewing the public {settings.siteName} wire
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-mint/30 bg-mint/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-mint">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-mint" />
          Live preview
        </span>
      </div>

      {/* Public header — desktop banner + mobile compact lockup */}
      <header className="border-b border-line bg-nav">
        <BrandImage
          src="/header.png"
          alt={`${settings.siteName} — ${settings.slogan}`}
          loading="eager"
          className="hidden w-full sm:block"
          placeholderClassName="hidden h-28 bg-gradient-to-r from-navy via-card-alt to-navy sm:block lg:h-36"
        />

        <NexTakeMobileBar slogan={settings.slogan} />

        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-2.5 sm:px-6">
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
            {settings.navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted transition-colors hover:text-mint sm:text-[11px]"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-muted-deep">
            {settings.slogan}
          </p>
        </div>
      </header>

      {/* Breaking banner */}
      {breaking ? (
        <div className="border-b border-rose-500/30 bg-rose-500/10">
          <div className="mx-auto flex max-w-7xl items-center gap-2.5 px-4 py-2.5 sm:px-6">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
            </span>
            <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-rose-300">
              {settings.breakingLabel || "Breaking"}
            </span>
            <span className="truncate text-[13px] text-rose-100">
              {breaking.title}
            </span>
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Hero carousel */}
        {loading ? (
          <p className="py-10 text-center font-mono text-[11px] uppercase tracking-[0.08em] text-muted-deep">
            Loading the wire…
          </p>
        ) : hero.length === 0 ? (
          <EmptyState
            icon={<Radio className="h-5 w-5" />}
            title="No hero stories pinned"
            description="Assign a hero priority of 1–5 from the article editor or the feed placement page."
          />
        ) : (
          <section className="grid gap-5 lg:grid-cols-3">
            {lead ? <HeroLead article={lead} /> : null}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {supporting.map((article) => (
                <HeroMini key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* Feed */}
        <section className="mt-10">
          <header className="mb-5 flex items-end justify-between gap-3 border-b border-line pb-4">
            <div>
              <h2 className="font-display text-xl font-extrabold text-ink">
                Feed wire
              </h2>
              <p className="text-[11px] text-muted-deep">
                Published stories, newest first
              </p>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-deep">
              {published.length} live
            </span>
          </header>

          {published.length === 0 ? (
            <EmptyState
              title="No published stories"
              description="Publish a story in the console and it will appear here instantly."
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {published.map((article) => (
                <FeedCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Public footer */}
      <footer className="border-t border-line bg-nav">
        {/* Brand showcase — /public/footer.png (1800×500) */}
        <BrandImage
          src="/footer.png"
          alt={`${settings.siteName} brand showcase`}
          className="w-full"
          placeholderClassName="bg-gradient-to-r from-navy via-card-alt to-navy h-24 sm:h-32"
        />

        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2">
          <div className="space-y-3">
            <NexTakeLogo subtitle={settings.slogan} />
            {settings.newsletterEnabled ? <NewsletterSignup /> : null}
            <p className="text-[11px] text-muted-deep">
              {settings.newsletterHeadline}
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 lg:items-end">
            <a
              href={`mailto:${settings.contactEmail}`}
              className="font-mono text-[12px] text-mint"
            >
              {settings.contactEmail}
            </a>
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-deep">
              © {new Date().getFullYear()} {settings.siteName}
            </p>
          </div>
        </div>

        <div className="border-t border-line">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-deep sm:px-6">
            <span>All systems operational</span>
            <span>Latency 42 ms</span>
            <span>{published.length} live stories</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FREQUENCIES: Array<{
  value: NewsletterFrequency;
  label: string;
}> = [
  { value: "daily", label: "Daily" },
  { value: "weekend", label: "Weekend" },
  { value: "all", label: "All Signals" },
];

/** Newsletter signup wired to the shared `newsletter_subscribers` table. */
function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [frequency, setFrequency] = useState<NewsletterFrequency>("daily");
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!isEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setStatus("saving");
    const result = await backend.newsletter.subscribe(email, frequency);
    setStatus("idle");

    if (result.error) {
      setError(result.error);
      return;
    }

    setStatus("done");
    setEmail("");
  };

  if (status === "done") {
    return (
      <div className="max-w-md rounded-xl border border-mint/40 bg-mint/10 px-4 py-3 text-[13px] text-mint">
        You are on the list — the next {frequency === "weekend" ? "weekend" : ""}{" "}
        digest lands in your inbox.
      </div>
    );
  }

  return (
    <form className="max-w-md space-y-2.5" onSubmit={submit} noValidate>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-deep" />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            aria-label="Email address"
            className="w-full rounded-xl border border-line bg-surface py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-muted-deep focus:outline-none focus:ring-2 focus:ring-mint/30"
          />
        </div>
        <Button
          type="submit"
          size="md"
          loading={status === "saving"}
          icon={<Send className="h-3.5 w-3.5" />}
        >
          Subscribe
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {FREQUENCIES.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFrequency(option.value)}
            className={`rounded-lg px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors ${
              frequency === option.value
                ? "bg-mint text-navy"
                : "bg-card text-muted ring-1 ring-line hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {error ? <p className="text-[12px] text-rose-400">{error}</p> : null}
    </form>
  );
}

function HeroLead({ article }: { article: Article }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-line bg-card lg:col-span-2">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-navy">
        <img
          src={article.coverImageUrl}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-4 top-4 rounded-md bg-mint px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-navy">
          {article.category}
        </span>
        {article.isBreaking ? (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-md bg-rose-500 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-white">
            <Radio className="h-3 w-3" />
            Breaking
          </span>
        ) : null}
      </div>

      <div className="space-y-3 p-5">
        <h2 className="font-display text-2xl font-extrabold leading-tight text-ink">
          {article.title}
        </h2>
        <p className="text-[13px] leading-relaxed text-muted">{article.summary}</p>
        <SourceLine article={article} />
      </div>
    </article>
  );
}

function HeroMini({ article }: { article: Article }) {
  return (
    <article className="flex gap-3 overflow-hidden rounded-xl border border-line bg-card p-3">
      <img
        src={article.coverImageUrl}
        alt=""
        className="h-20 w-24 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 space-y-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-mint">
          {article.category}
        </span>
        <h3 className="line-clamp-2 font-display text-[14px] font-bold leading-snug text-ink">
          {article.title}
        </h3>
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-deep">
          {article.sourceName}
          {article.readTime ? ` · ${article.readTime}` : ""}
        </p>
      </div>
    </article>
  );
}

function FeedCard({ article }: { article: Article }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-navy">
        <img
          src={article.coverImageUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 rounded-md bg-mint px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-navy">
          {article.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="line-clamp-2 font-display text-[15px] font-bold leading-snug text-ink">
          {article.title}
        </h3>
        <p className="line-clamp-3 text-[12px] leading-relaxed text-muted-deep">
          {article.summary}
        </p>

        {article.keyTakeaways.length > 0 ? (
          <ul className="space-y-1 border-l border-line pl-3">
            {article.keyTakeaways.slice(0, 2).map((takeaway) => (
              <li
                key={takeaway}
                className="line-clamp-1 text-[11px] text-muted"
              >
                • {takeaway}
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto pt-2">
          <SourceLine article={article} />
        </div>
      </div>
    </article>
  );
}

function SourceLine({ article }: { article: Article }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
      {article.sourceLogoUrl ? (
        <img
          src={article.sourceLogoUrl}
          alt=""
          className="h-5 w-5 rounded object-contain"
        />
      ) : null}
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-mint">
        {article.sourceName}
      </span>
      {article.readTime ? (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-deep">
          <Clock className="h-3 w-3" />
          {article.readTime}
        </span>
      ) : null}
      <a
        href={article.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted transition-colors hover:text-mint"
      >
        Source
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
