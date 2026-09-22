import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  GripVertical,
  Plus,
  RefreshCw,
  Save,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useCms } from "../../lib/store/context";
import {
  isoToLocalDateTime,
  localDateTimeToIso,
  slugify,
  validateArticleForm,
  type ArticleFieldErrors,
  type ArticleFormValues,
} from "../../lib/validation";
import { CATEGORIES, HERO_PRIORITIES } from "../../types";
import type {
  Article,
  ArticleInput,
  LinkBehavior,
  PublishStatus,
  SyndicationLicense,
} from "../../types";
import Button from "../ui/Button";
import { Alert, LoadingBlock } from "../ui/Feedback";
import {
  Field,
  Select,
  TagInput,
  TextArea,
  TextInput,
  Toggle,
} from "../ui/Field";
import ImageField from "../ui/ImageField";
import Modal from "../ui/Modal";
import RichTextEditor from "../ui/RichTextEditor";
import { StatusBadge } from "../ui/StatusBadge";

const EMPTY_FORM: ArticleFormValues = {
  slug: "",
  title: "",
  summary: "",
  keyTakeaways: [],
  category: CATEGORIES[0],
  tags: [],
  coverImageUrl: "",
  imageCredit: "",
  readTime: "",
  sourceUrl: "",
  sourceName: "",
  sourceLogoUrl: "",
  originalAuthor: "",
  originalPublishedAt: "",
  linkBehavior: "reader",
  canonicalUrl: "",
  syndicationLicense: "fair_use_summary",
  syndicatedBody: "",
  status: "draft",
  publishedAt: isoToLocalDateTime(new Date().toISOString()),
  heroPriority: "",
  inDailyEdit: false,
  isBreaking: false,
  relatedCompanyIds: [],
};

/** Maps validated form values onto the shared article payload. */
function formToInput(values: ArticleFormValues): ArticleInput {
  return {
    slug: values.slug.trim() || slugify(values.title) || `story-${Date.now()}`,
    title: values.title.trim(),
    summary: values.summary.trim(),
    keyTakeaways: values.keyTakeaways.map((item) => item.trim()).filter(Boolean),
    category: values.category,
    tags: values.tags,
    coverImageUrl: values.coverImageUrl.trim(),
    imageCredit: values.imageCredit.trim() || null,
    readTime: values.readTime.trim() || null,
    sourceUrl: values.sourceUrl.trim(),
    sourceName: values.sourceName.trim(),
    sourceLogoUrl: values.sourceLogoUrl.trim() || null,
    originalAuthor: values.originalAuthor.trim() || null,
    originalPublishedAt: localDateTimeToIso(values.originalPublishedAt),
    linkBehavior: values.linkBehavior,
    canonicalUrl: values.canonicalUrl.trim() || values.sourceUrl.trim(),
    syndicationLicense: (values.syndicationLicense ||
      null) as SyndicationLicense | null,
    syndicatedBody: values.syndicatedBody.trim() || null,
    status: values.status,
    publishedAt: localDateTimeToIso(values.publishedAt),
    heroPriority: values.heroPriority ? Number(values.heroPriority) : null,
    inDailyEdit: values.inDailyEdit,
    isBreaking: values.isBreaking,
    relatedCompanyIds: values.relatedCompanyIds,
  };
}

function formFromArticle(article: Article): ArticleFormValues {
  return {
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    keyTakeaways: article.keyTakeaways,
    category: article.category,
    tags: article.tags,
    coverImageUrl: article.coverImageUrl,
    imageCredit: article.imageCredit ?? "",
    readTime: article.readTime ?? "",
    sourceUrl: article.sourceUrl,
    sourceName: article.sourceName,
    sourceLogoUrl: article.sourceLogoUrl ?? "",
    originalAuthor: article.originalAuthor ?? "",
    originalPublishedAt: isoToLocalDateTime(article.originalPublishedAt),
    linkBehavior: article.linkBehavior,
    canonicalUrl: article.canonicalUrl,
    syndicationLicense: article.syndicationLicense ?? "",
    syndicatedBody: article.syndicatedBody ?? "",
    status: article.status,
    publishedAt: isoToLocalDateTime(article.publishedAt),
    heroPriority: article.heroPriority ? String(article.heroPriority) : "",
    inDailyEdit: article.inDailyEdit,
    isBreaking: article.isBreaking,
    relatedCompanyIds: article.relatedCompanyIds,
  };
}

export default function ArticleEditor({ articleId }: { articleId?: string }) {
  const navigate = useNavigate();
  const { articles, companies, loading, saving, saveArticle, removeArticle } =
    useCms();

  const existing = useMemo(
    () => articles.find((article) => article.id === articleId),
    [articles, articleId]
  );

  const [form, setForm] = useState<ArticleFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<ArticleFieldErrors>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [touched, setTouched] = useState(false);

  /* Reload the form when a different record is opened. Adjusting state during
     render (rather than in an effect) keeps the editor in sync without a
     cascading second render. */
  const [loadedId, setLoadedId] = useState<string | null>(articleId ?? null);

  if (articleId && existing && loadedId !== existing.id) {
    setLoadedId(existing.id);
    setForm(formFromArticle(existing));
  }

  const update = <K extends keyof ArticleFormValues>(
    key: K,
    value: ArticleFormValues[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (intent: PublishStatus) => {
    setTouched(true);
    setSaveError(null);

    /* The intent drives the saved status, so "Publish" never writes a draft
       even when the form still sits on its default status. */
    const nextForm: ArticleFormValues =
      intent === "published" && !form.publishedAt
        ? {
            ...form,
            status: "published",
            publishedAt: isoToLocalDateTime(new Date().toISOString()),
          }
        : { ...form, status: intent };

    const validationErrors = validateArticleForm(nextForm);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setSaveError(
        "Fix the highlighted fields before saving — the server enforces the same rules."
      );
      return;
    }

    const result = await saveArticle(formToInput(nextForm), articleId);
    if (result.error) {
      setSaveError(result.error);
      return;
    }

    navigate("/articles", {
      state: { saved: nextForm.title, status: nextForm.status },
    });
  };

  if (articleId && loading && !existing) {
    return <LoadingBlock label="Loading story…" />;
  }

  if (articleId && !existing && !loading) {
    return (
      <Alert tone="error" title="Story not found">
        It may have been deleted, or you do not have permission to edit it.
        <div className="mt-3">
          <Button variant="secondary" onClick={() => navigate("/articles")}>
            Back to articles
          </Button>
        </div>
      </Alert>
    );
  }

  const showError = (key: keyof ArticleFormValues) =>
    touched ? errors[key] : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate("/articles")}
            className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted transition-colors hover:text-mint"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All articles
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display text-2xl font-extrabold text-ink">
              {articleId ? "Edit story" : "New story"}
            </h1>
            <StatusBadge status={form.status} />
            {form.isBreaking ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-rose-300 ring-1 ring-rose-500/30">
                Breaking
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[12px] text-muted-deep">
            Every field here maps to a column the public NexTake blog reads — no
            separate content source.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {articleId ? (
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="h-3.5 w-3.5" />}
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </Button>
          ) : null}

          <Button
            variant="secondary"
            icon={<Save className="h-3.5 w-3.5" />}
            loading={saving && form.status === "draft"}
            onClick={() => void submit("draft")}
          >
            Save draft
          </Button>

          <Button
            icon={<Send className="h-3.5 w-3.5" />}
            loading={saving && form.status !== "draft"}
            onClick={() => void submit("published")}
          >
            {form.status === "scheduled" ? "Schedule" : "Publish"}
          </Button>
        </div>
      </div>

      {saveError ? (
        <Alert tone="error" onDismiss={() => setSaveError(null)}>
          {saveError}
        </Alert>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* ---------------- Main column ---------------- */}
        <div className="space-y-6 xl:col-span-2">
          {/* B. Content & editorial */}
          <Section
            index="B"
            title="Content & editorial"
            caption="How the story reads on NexTake"
          >
            <Field
              label="Headline / title"
              htmlFor="title"
              required
              error={showError("title")}
              hint="Shown on the feed, article cards and the reader."
            >
              <TextInput
                id="title"
                value={form.title}
                invalid={Boolean(showError("title"))}
                placeholder="Sovereign AI clusters move to the edge"
                onChange={(event) => update("title", event.target.value)}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <Field
                label="URL slug"
                htmlFor="slug"
                hint="Used by the public article route. Leave blank to generate from the headline."
                error={showError("slug")}
              >
                <TextInput
                  id="slug"
                  mono
                  value={form.slug}
                  placeholder="auto-generated-from-headline"
                  onChange={(event) => update("slug", event.target.value)}
                />
              </Field>
              <div className="flex items-end">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<RefreshCw className="h-3.5 w-3.5" />}
                  onClick={() => update("slug", slugify(form.title))}
                >
                  Generate
                </Button>
              </div>
            </div>

            <Field
              label="Executive summary / key takeaway"
              htmlFor="summary"
              required
              error={showError("summary")}
              hint="2–3 sentences. This is what readers see on the card and in the digest."
            >
              <TextArea
                id="summary"
                rows={4}
                value={form.summary}
                invalid={Boolean(showError("summary"))}
                placeholder="What happened, why it matters, and what changes next."
                onChange={(event) => update("summary", event.target.value)}
              />
            </Field>

            <KeyTakeawaysField
              values={form.keyTakeaways}
              onChange={(next) => update("keyTakeaways", next)}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Category"
                htmlFor="category"
                required
                error={showError("category")}
              >
                <Select
                  id="category"
                  value={form.category}
                  onChange={(event) => update("category", event.target.value)}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Estimated reading time"
                htmlFor="readTime"
                hint="e.g. 3 min read, 2 min briefing"
                error={showError("readTime")}
              >
                <TextInput
                  id="readTime"
                  value={form.readTime}
                  placeholder="3 min read"
                  onChange={(event) => update("readTime", event.target.value)}
                />
              </Field>
            </div>

            <Field label="Tags / topics" htmlFor="tags" error={showError("tags")}>
              <TagInput
                id="tags"
                value={form.tags}
                onChange={(next) => update("tags", next)}
                placeholder="LLMs, Venture Capital, Hardware…"
              />
            </Field>

            <ImageField
              id="coverImageUrl"
              label="Cover image / thumbnail"
              value={form.coverImageUrl}
              onChange={(url) => update("coverImageUrl", url)}
              error={showError("coverImageUrl")}
              hint="Used across the feed, cards, hero carousel and newsletter."
            />

            <Field
              label="Image credit / media attribution"
              htmlFor="imageCredit"
              error={showError("imageCredit")}
            >
              <TextInput
                id="imageCredit"
                value={form.imageCredit}
                placeholder="Photograph: Reuters / NexTake illustration"
                onChange={(event) => update("imageCredit", event.target.value)}
              />
            </Field>
          </Section>

          {/* C. SEO & syndication */}
          <Section
            index="C"
            title="SEO & syndication compliance"
            caption="Attribution and rights"
          >
            <Field
              label="Canonical URL"
              htmlFor="canonicalUrl"
              required
              error={showError("canonicalUrl")}
              hint="Points search engines back to the original source."
            >
              <TextInput
                id="canonicalUrl"
                mono
                value={form.canonicalUrl}
                invalid={Boolean(showError("canonicalUrl"))}
                placeholder="https://www.reuters.com/technology/…"
                onChange={(event) => update("canonicalUrl", event.target.value)}
              />
            </Field>

            <Field
              label="Syndication license type"
              htmlFor="license"
              error={showError("syndicationLicense")}
              hint="Only use full text where the rights exist."
            >
              <Select
                id="license"
                value={form.syndicationLicense}
                onChange={(event) =>
                  update(
                    "syndicationLicense",
                    event.target.value as SyndicationLicense | ""
                  )
                }
              >
                <option value="">None</option>
                <option value="fair_use_summary">Fair Use Summary</option>
                <option value="full_licensed_syndication">
                  Full Licensed Syndication
                </option>
                <option value="press_release">Press Release</option>
              </Select>
            </Field>

            <Field
              label="Syndicated content body"
              error={showError("syndicatedBody")}
              hint="Full text or the licensed quoted excerpt rendered in the NexTake reader."
            >
              <RichTextEditor
                value={form.syndicatedBody}
                onChange={(html) => update("syndicatedBody", html)}
              />
            </Field>
          </Section>
        </div>

        {/* ---------------- Sidebar column ---------------- */}
        <div className="space-y-6">
          <FeedPreview form={form} />

          {/* A. Source */}
          <Section
            index="A"
            title="Source & link"
            caption="Where the story came from"
          >
            <Field
              label="Source link / URL"
              htmlFor="sourceUrl"
              required
              error={showError("sourceUrl")}
            >
              <TextInput
                id="sourceUrl"
                mono
                value={form.sourceUrl}
                invalid={Boolean(showError("sourceUrl"))}
                placeholder="https://techcrunch.com/…"
                onChange={(event) => update("sourceUrl", event.target.value)}
              />
            </Field>

            <Field
              label="Source name"
              htmlFor="sourceName"
              required
              error={showError("sourceName")}
            >
              <TextInput
                id="sourceName"
                value={form.sourceName}
                invalid={Boolean(showError("sourceName"))}
                placeholder="TechCrunch, Bloomberg, Reuters, Wired…"
                onChange={(event) => update("sourceName", event.target.value)}
              />
            </Field>

            <ImageField
              id="sourceLogoUrl"
              label="Source logo / favicon"
              value={form.sourceLogoUrl}
              onChange={(url) => update("sourceLogoUrl", url)}
              error={showError("sourceLogoUrl")}
              roundPreview
              hint="Optional brand icon displayed next to the source."
            />

            <Field
              label="Original author byline"
              htmlFor="originalAuthor"
              error={showError("originalAuthor")}
            >
              <TextInput
                id="originalAuthor"
                value={form.originalAuthor}
                placeholder="Reporting team / writer"
                onChange={(event) => update("originalAuthor", event.target.value)}
              />
            </Field>

            <Field
              label="Original publication date"
              htmlFor="originalPublishedAt"
              error={showError("originalPublishedAt")}
            >
              <TextInput
                id="originalPublishedAt"
                type="datetime-local"
                value={form.originalPublishedAt}
                onChange={(event) =>
                  update("originalPublishedAt", event.target.value)
                }
              />
            </Field>

            <Field
              label="Link behavior"
              htmlFor="linkBehavior"
              required
              error={showError("linkBehavior")}
              hint="Applied by the public article and reader pages."
            >
              <Select
                id="linkBehavior"
                value={form.linkBehavior}
                onChange={(event) =>
                  update("linkBehavior", event.target.value as LinkBehavior)
                }
              >
                <option value="external">
                  Open directly on the external site
                </option>
                <option value="reader">
                  Open in NexTake reader with source link
                </option>
              </Select>
            </Field>
          </Section>

          {/* D. Placement */}
          <Section
            index="D"
            title="Placement & visibility"
            caption="Where the story appears"
          >
            <fieldset className="space-y-2">
              <legend className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
                Publish status *
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {(["draft", "published", "scheduled", "archived"] as PublishStatus[]).map(
                  (option) => (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-[12px] font-semibold capitalize transition-colors ${
                        form.status === option
                          ? "border-mint/50 bg-mint/10 text-mint"
                          : "border-line bg-surface text-muted hover:border-line-strong"
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={option}
                        checked={form.status === option}
                        onChange={() => update("status", option)}
                        className="h-3 w-3 accent-[#00F2AA]"
                      />
                      {option}
                    </label>
                  )
                )}
              </div>
            </fieldset>

            <Field
              label="Publish date & time"
              htmlFor="publishedAt"
              required
              error={showError("publishedAt")}
            >
              <div className="flex gap-2">
                <TextInput
                  id="publishedAt"
                  type="datetime-local"
                  value={form.publishedAt}
                  invalid={Boolean(showError("publishedAt"))}
                  onChange={(event) => update("publishedAt", event.target.value)}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    update(
                      "publishedAt",
                      isoToLocalDateTime(new Date().toISOString())
                    )
                  }
                >
                  Now
                </Button>
              </div>
            </Field>

            <Field
              label="Featured in hero carousel"
              htmlFor="heroPriority"
              error={showError("heroPriority")}
              hint="1 leads the carousel, 5 is last. Leave empty for no pinning."
            >
              <Select
                id="heroPriority"
                value={form.heroPriority}
                onChange={(event) => update("heroPriority", event.target.value)}
              >
                <option value="">Not featured</option>
                {HERO_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    Priority {priority}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="space-y-2.5">
              <Toggle
                label="Include in The Daily Edit"
                description="Adds this story to the newsletter digest queue."
                checked={form.inDailyEdit}
                onChange={(value) => update("inDailyEdit", value)}
              />
              <Toggle
                label="Breaking news alert"
                description="Triggers the pulsing live banner on the main blog."
                accent="amber"
                checked={form.isBreaking}
                onChange={(value) => update("isBreaking", value)}
              />
            </div>

            <Field
              label="Related companies / operators"
              error={showError("relatedCompanyIds")}
              hint="Links the story to tracked company profiles."
            >
              <div className="max-h-48 space-y-1.5 overflow-y-auto rounded-xl border border-line bg-surface p-2.5">
                {companies.length === 0 ? (
                  <p className="px-1 py-2 text-[11px] text-muted-deep">
                    No company profiles yet. Add them to the{" "}
                    <code className="font-mono text-muted">companies</code>{" "}
                    table.
                  </p>
                ) : (
                  companies.map((company) => {
                    const checked = form.relatedCompanyIds.includes(company.id);
                    return (
                      <label
                        key={company.id}
                        className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12px] text-muted transition-colors hover:bg-white/5 hover:text-ink"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            update(
                              "relatedCompanyIds",
                              checked
                                ? form.relatedCompanyIds.filter(
                                    (id) => id !== company.id
                                  )
                                : [...form.relatedCompanyIds, company.id]
                            )
                          }
                          className="h-3.5 w-3.5 accent-[#00F2AA]"
                        />
                        <span className="truncate font-medium">{company.name}</span>
                        {company.sector ? (
                          <span className="ml-auto shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-deep">
                            {company.sector}
                          </span>
                        ) : null}
                      </label>
                    );
                  })
                )}
              </div>
            </Field>
          </Section>
        </div>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this story?"
        subtitle="This removes the record from the shared articles table."
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={saving}
              onClick={async () => {
                if (!articleId) return;
                const result = await removeArticle(articleId);
                setConfirmDelete(false);
                if (result.error) {
                  setSaveError(result.error);
                  return;
                }
                navigate("/articles", { state: { deleted: true } });
              }}
            >
              Delete permanently
            </Button>
          </>
        }
      >
        <p className="text-[13px] leading-relaxed text-muted">
          The story will disappear from the feed, the hero carousel and the
          newsletter queue immediately.
        </p>
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function Section({
  index,
  title,
  caption,
  children,
}: {
  index: string;
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-line bg-card p-5">
      <header className="flex items-baseline gap-2.5 border-b border-line pb-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-mint/15 font-mono text-[11px] font-bold text-mint ring-1 ring-mint/25">
          {index}
        </span>
        <div>
          <h2 className="font-display text-[15px] font-extrabold text-ink">
            {title}
          </h2>
          <p className="text-[11px] text-muted-deep">{caption}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

function KeyTakeawaysField({
  values,
  onChange,
}: {
  values: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    onChange([...values, text]);
    setDraft("");
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= values.length) return;
    const next = [...values];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
        Key takeaways / bullet points
      </span>

      {values.length > 0 ? (
        <ul className="space-y-2">
          {values.map((item, index) => (
            <li
              key={`${index}-${item}`}
              className="flex items-start gap-2 rounded-xl border border-line bg-surface p-2.5"
            >
              <span className="mt-1.5 font-mono text-[10px] font-bold text-mint">
                {String(index + 1).padStart(2, "0")}
              </span>
              <textarea
                rows={2}
                value={item}
                onChange={(event) => {
                  const next = [...values];
                  next[index] = event.target.value;
                  onChange(next);
                }}
                className="min-w-0 flex-1 resize-y bg-transparent text-[13px] text-ink focus:outline-none"
              />
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className="rounded p-1 text-muted transition-colors hover:text-mint disabled:opacity-30"
                >
                  <GripVertical className="h-3.5 w-3.5 -rotate-90" />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={index === values.length - 1}
                  onClick={() => move(index, 1)}
                  className="rounded p-1 text-muted transition-colors hover:text-mint disabled:opacity-30"
                >
                  <GripVertical className="h-3.5 w-3.5 rotate-90" />
                </button>
                <button
                  type="button"
                  aria-label="Remove bullet"
                  onClick={() =>
                    onChange(values.filter((_, position) => position !== index))
                  }
                  className="rounded p-1 text-muted transition-colors hover:text-rose-400"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-line-strong bg-surface/60 px-3.5 py-3 text-[11px] text-muted-deep">
          No bullets yet. Add up to a few crisp takeaways for the reader page.
        </p>
      )}

      <div className="flex gap-2">
        <TextInput
          value={draft}
          placeholder="Add a takeaway and press Enter"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />
        <Button
          variant="secondary"
          size="md"
          icon={<Plus className="h-3.5 w-3.5" />}
          onClick={add}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

function FeedPreview({ form }: { form: ArticleFormValues }) {
  return (
    <section className="space-y-3 rounded-2xl border border-line bg-card p-4">
      <header className="flex items-center gap-1.5">
        <Eye className="h-3.5 w-3.5 text-mint" />
        <h2 className="nt-mono text-muted">Feed card preview</h2>
      </header>

      <article className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="relative aspect-[16/9] w-full bg-navy">
          {form.coverImageUrl ? (
            <img
              src={form.coverImageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-mono text-[10px] uppercase tracking-[0.08em] text-muted-deep">
              Cover image
            </span>
          )}
          <span className="absolute left-2.5 top-2.5 rounded bg-mint px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-navy">
            {form.category}
          </span>
        </div>

        <div className="space-y-2 p-3.5">
          <h3 className="font-display text-[14px] font-bold leading-snug text-ink">
            {form.title || "Untitled story"}
          </h3>
          <p className="line-clamp-3 text-[12px] leading-relaxed text-muted-deep">
            {form.summary || "The executive summary appears here."}
          </p>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-deep">
            <span className="text-mint">{form.sourceName || "Source"}</span>
            {form.readTime ? <span>· {form.readTime}</span> : null}
            {form.isBreaking ? (
              <span className="text-rose-400">· Breaking</span>
            ) : null}
          </div>
        </div>
      </article>
    </section>
  );
}
