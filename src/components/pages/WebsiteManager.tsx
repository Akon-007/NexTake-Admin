import { useMemo, useState } from "react";
import {
  Globe,
  Mail,
  Radio,
  Save,
  Star,
  StarOff,
} from "lucide-react";
import { useCms } from "../../lib/store/context";
import type {
  Article,
  ArticleInput,
  SiteSettings,
} from "../../types";
import Button from "../ui/Button";
import { Alert, EmptyState, LoadingBlock } from "../ui/Feedback";
import { Field, Select, TextInput, Toggle } from "../ui/Field";
import { Pill, StatusBadge } from "../ui/StatusBadge";

/** Strips server-owned fields so an existing record can be re-saved. */
function toInput(article: Article): ArticleInput {
  return {
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    keyTakeaways: article.keyTakeaways,
    category: article.category,
    tags: article.tags,
    coverImageUrl: article.coverImageUrl,
    imageCredit: article.imageCredit,
    readTime: article.readTime,
    sourceUrl: article.sourceUrl,
    sourceName: article.sourceName,
    sourceLogoUrl: article.sourceLogoUrl,
    originalAuthor: article.originalAuthor,
    originalPublishedAt: article.originalPublishedAt,
    linkBehavior: article.linkBehavior,
    canonicalUrl: article.canonicalUrl,
    syndicationLicense: article.syndicationLicense,
    syndicatedBody: article.syndicatedBody,
    status: article.status,
    publishedAt: article.publishedAt,
    heroPriority: article.heroPriority,
    inDailyEdit: article.inDailyEdit,
    isBreaking: article.isBreaking,
    relatedCompanyIds: article.relatedCompanyIds,
  };
}

export default function WebsiteManager() {
  const { articles, settings, loading, saving, saveArticle, saveSettings } =
    useCms();

  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [syncedSettings, setSyncedSettings] = useState<SiteSettings>(settings);
  const [dirty, setDirty] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);

  /* Adopt server settings whenever they change and the admin has no unsaved
     edits — state is reconciled during render instead of in an effect. */
  if (!dirty && syncedSettings !== settings) {
    setSyncedSettings(settings);
    setDraft(settings);
  }

  const editSettings = (patch: Partial<SiteSettings>) => {
    setDirty(true);
    setSettingsSaved(false);
    setDraft((current) => ({ ...current, ...patch }));
  };

  const heroSlots = useMemo(
    () =>
      articles
        .filter((article) => article.heroPriority !== null)
        .sort((a, b) => (a.heroPriority ?? 9) - (b.heroPriority ?? 9)),
    [articles]
  );

  const breakingStory = useMemo(
    () => articles.find((article) => article.isBreaking) ?? null,
    [articles]
  );

  const digestQueue = useMemo(
    () => articles.filter((article) => article.inDailyEdit),
    [articles]
  );

  const duplicatePriorities = useMemo(() => {
    const seen = new Map<number, number>();
    articles.forEach((article) => {
      if (article.heroPriority === null) return;
      seen.set(
        article.heroPriority,
        (seen.get(article.heroPriority) ?? 0) + 1
      );
    });
    return Array.from(seen.entries())
      .filter(([, count]) => count > 1)
      .map(([priority]) => priority);
  }, [articles]);

  const patchArticle = async (article: Article, patch: Partial<ArticleInput>) => {
    setRowError(null);
    const result = await saveArticle({ ...toInput(article), ...patch }, article.id);
    if (result.error) setRowError(result.error);
  };

  const saveSiteSettings = async () => {
    setSettingsError(null);
    setSettingsSaved(false);

    const result = await saveSettings(draft);
    if (result.error) {
      setSettingsError(result.error);
      return;
    }
    setDirty(false);
    setSettingsSaved(true);
  };

  if (loading && articles.length === 0) {
    return <LoadingBlock label="Loading placement…" />;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">
            Feed placement
          </h1>
          <p className="mt-1 text-[12px] text-muted-deep">
            Control the hero carousel, the breaking banner, the newsletter digest
            and the site-wide copy — all read by the public blog.
          </p>
        </div>
      </header>

      {rowError ? (
        <Alert tone="error" onDismiss={() => setRowError(null)}>
          {rowError}
        </Alert>
      ) : null}

      {/* Hero carousel */}
      <section className="space-y-4 rounded-2xl border border-line bg-card p-5">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-ink">
              <Star className="h-4 w-4 text-mint" />
              Hero carousel priority
            </h2>
            <p className="text-[11px] text-muted-deep">
              Priority 1 leads the main banner. Ties fall back to publish time.
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-deep">
            {heroSlots.length}/5 pinned
          </span>
        </header>

        {duplicatePriorities.length > 0 ? (
          <Alert tone="warning">
            Priorities {duplicatePriorities.join(", ")} are used by more than one
            story. The earliest publish date wins.
          </Alert>
        ) : null}

        {heroSlots.length === 0 ? (
          <EmptyState
            icon={<StarOff className="h-5 w-5" />}
            title="Nothing pinned to the hero carousel"
            description="Assign a priority of 1–5 to any story below or from the article editor."
          />
        ) : (
          <ol className="space-y-2">
            {heroSlots.map((article) => (
              <li
                key={article.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-mint font-mono text-[12px] font-bold text-navy">
                  {article.heroPriority}
                </span>
                <img
                  src={article.coverImageUrl}
                  alt=""
                  className="hidden h-10 w-16 shrink-0 rounded-md object-cover sm:block"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-ink">
                    {article.title}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-deep">
                    {article.category} · {article.sourceName}
                  </p>
                </div>
                <StatusBadge status={article.status} />
              </li>
            ))}
          </ol>
        )}

        <div className="space-y-2 pt-2">
          <span className="nt-mono text-muted">Assign priority</span>
          <div className="space-y-2">
            {articles
              .filter((article) => article.status !== "archived")
              .slice(0, 12)
              .map((article) => (
                <div
                  key={article.id}
                  className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="min-w-0 flex-1 truncate text-[13px] text-ink">
                    {article.title}
                  </p>

                  <div className="flex shrink-0 items-center gap-2">
                    <Select
                      aria-label={`Hero priority for ${article.title}`}
                      value={article.heroPriority ?? ""}
                      onChange={(event) =>
                        void patchArticle(article, {
                          heroPriority: event.target.value
                            ? Number(event.target.value)
                            : null,
                        })
                      }
                      className="w-32 py-2 text-[12px]"
                    >
                      <option value="">Not featured</option>
                      {[1, 2, 3, 4, 5].map((priority) => (
                        <option key={priority} value={priority}>
                          Priority {priority}
                        </option>
                      ))}
                    </Select>

                    <Toggle
                      label="Daily Edit"
                      checked={article.inDailyEdit}
                      onChange={(value) =>
                        void patchArticle(article, { inDailyEdit: value })
                      }
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Breaking alert */}
      <section className="space-y-4 rounded-2xl border border-line bg-card p-5">
        <header className="border-b border-line pb-4">
          <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-ink">
            <Radio className="h-4 w-4 text-rose-400" />
            Breaking news alert
          </h2>
          <p className="text-[11px] text-muted-deep">
            Drives the pulsing live banner at the top of the main blog.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2.5">
            <Toggle
              label="Enable breaking banner"
              description="Hides the banner on the public site when switched off."
              accent="amber"
              checked={draft.breakingEnabled}
              onChange={(value) => {
                editSettings({ breakingEnabled: value });
              }}
            />

            <Field label="Banner label" htmlFor="breakingLabel">
              <TextInput
                id="breakingLabel"
                value={draft.breakingLabel}
                placeholder="BREAKING"
                onChange={(event) => {
                  editSettings({ breakingLabel: event.target.value });
                }}
              />
            </Field>

            <div className="rounded-xl border border-line bg-surface p-3">
              <p className="nt-mono mb-2 text-muted-deep">Live banner</p>
              {draft.breakingEnabled && breakingStory ? (
                <div className="flex items-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-rose-300">
                    {draft.breakingLabel || "Breaking"}
                  </span>
                  <span className="truncate text-[12px] text-rose-100">
                    {breakingStory.title}
                  </span>
                </div>
              ) : (
                <p className="text-[12px] text-muted-deep">
                  No live alert. Mark a story as breaking in the editor.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <span className="nt-mono text-muted-deep">Flagged stories</span>
            {articles.filter((article) => article.isBreaking).length === 0 ? (
              <p className="rounded-xl border border-dashed border-line-strong bg-surface/60 px-3.5 py-4 text-[12px] text-muted-deep">
                Nothing flagged. Use the “Breaking news alert” toggle in the
                article editor.
              </p>
            ) : (
              articles
                .filter((article) => article.isBreaking)
                .map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3"
                  >
                    <p className="min-w-0 flex-1 truncate text-[13px] text-ink">
                      {article.title}
                    </p>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        void patchArticle(article, { isBreaking: false })
                      }
                    >
                      Clear
                    </Button>
                  </div>
                ))
            )}
          </div>
        </div>
      </section>

      {/* Newsletter / Daily Edit */}
      <section className="space-y-4 rounded-2xl border border-line bg-card p-5">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-ink">
              <Mail className="h-4 w-4 text-mint" />
              The Daily Edit
            </h2>
            <p className="text-[11px] text-muted-deep">
              Digest queue assembled from stories flagged “Include in The Daily
              Edit”.
            </p>
          </div>
          <Pill tone="sky">{digestQueue.length} queued</Pill>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <Toggle
              label="Enable the daily digest"
              description="Shows the newsletter module on the public site."
              checked={draft.dailyEditEnabled}
              onChange={(value) => {
                editSettings({ dailyEditEnabled: value });
              }}
            />
            <Field label="Digest subject" htmlFor="dailyEditSubject">
              <TextInput
                id="dailyEditSubject"
                value={draft.dailyEditSubject}
                onChange={(event) => {
                  editSettings({ dailyEditSubject: event.target.value });
                }}
              />
            </Field>
          </div>

          <ul className="space-y-2">
            {digestQueue.length === 0 ? (
              <li className="rounded-xl border border-dashed border-line-strong bg-surface/60 px-3.5 py-4 text-[12px] text-muted-deep">
                The queue is empty.
              </li>
            ) : (
              digestQueue.map((article) => (
                <li
                  key={article.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3"
                >
                  <span className="min-w-0 flex-1 truncate text-[13px] text-ink">
                    {article.title}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-deep">
                    {article.category}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      {/* Site copy */}
      <section className="space-y-4 rounded-2xl border border-line bg-card p-5">
        <header className="border-b border-line pb-4">
          <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-ink">
            <Globe className="h-4 w-4 text-mint" />
            Site copy
          </h2>
          <p className="text-[11px] text-muted-deep">
            Shared strings used by the public header, hero and footer.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Site name" htmlFor="siteName">
            <TextInput
              id="siteName"
              value={draft.siteName}
              onChange={(event) => {
                editSettings({ siteName: event.target.value });
              }}
            />
          </Field>

          <Field label="Slogan" htmlFor="slogan">
            <TextInput
              id="slogan"
              mono
              value={draft.slogan}
              onChange={(event) => {
                editSettings({ slogan: event.target.value });
              }}
            />
          </Field>

          <Field label="Hero headline" htmlFor="heroHeadline">
            <TextInput
              id="heroHeadline"
              value={draft.heroHeadline}
              onChange={(event) => {
                editSettings({ heroHeadline: event.target.value });
              }}
            />
          </Field>

          <Field label="Hero subhead" htmlFor="heroSubhead">
            <TextInput
              id="heroSubhead"
              value={draft.heroSubhead}
              onChange={(event) => {
                editSettings({ heroSubhead: event.target.value });
              }}
            />
          </Field>

          <Field label="Newsletter headline" htmlFor="newsletterHeadline">
            <TextInput
              id="newsletterHeadline"
              value={draft.newsletterHeadline}
              onChange={(event) => {
                editSettings({ newsletterHeadline: event.target.value });
              }}
            />
          </Field>

          <Field label="Contact email" htmlFor="contactEmail">
            <TextInput
              id="contactEmail"
              type="email"
              value={draft.contactEmail}
              onChange={(event) => {
                editSettings({ contactEmail: event.target.value });
              }}
            />
          </Field>
        </div>

        <Toggle
          label="Enable newsletter signup"
          description="Controls the newsletter module in the public footer."
          checked={draft.newsletterEnabled}
          onChange={(value) => {
            editSettings({ newsletterEnabled: value });
          }}
        />

        {settingsError ? <Alert tone="error">{settingsError}</Alert> : null}
        {settingsSaved && !settingsError ? (
          <Alert tone="success">Site copy saved.</Alert>
        ) : null}

        <div className="flex justify-end">
          <Button
            icon={<Save className="h-3.5 w-3.5" />}
            loading={saving}
            onClick={() => void saveSiteSettings()}
          >
            Save site copy
          </Button>
        </div>
      </section>
    </div>
  );
}
