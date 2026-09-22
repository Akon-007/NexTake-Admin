import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Clock,
  Eye,
  FileText,
  Filter,
  Pencil,
  Plus,
  Radio,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useCms } from "../../lib/store/context";
import { isLive } from "../../lib/visibility";
import { CATEGORIES, PUBLISH_STATUSES } from "../../types";
import type { Article, PublishStatus } from "../../types";
import Button from "../ui/Button";
import { Alert, EmptyState, LoadingBlock } from "../ui/Feedback";
import { Select, TextInput } from "../ui/Field";
import { Pill, StatusBadge } from "../ui/StatusBadge";

type PlacementFilter = "all" | "hero" | "breaking" | "daily";

export default function ArticleList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { articles, loading, error, removeArticle } = useCms();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<"all" | PublishStatus>("all");
  const [placement, setPlacement] = useState<PlacementFilter>("all");
  const [pendingDelete, setPendingDelete] = useState<Article | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  const state = location.state as
    | { saved?: string; status?: string; deleted?: boolean }
    | null;

  const categories = useMemo(() => {
    const present = new Set(articles.map((article) => article.category));
    return ["all", ...CATEGORIES.filter((option) => present.has(option)), ...Array.from(present).filter((option) => !CATEGORIES.includes(option as never))];
  }, [articles]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesTerm =
        !term ||
        article.title.toLowerCase().includes(term) ||
        article.summary.toLowerCase().includes(term) ||
        article.sourceName.toLowerCase().includes(term) ||
        article.tags.some((tag) => tag.toLowerCase().includes(term));

      const matchesCategory = category === "all" || article.category === category;
      const matchesStatus = status === "all" || article.status === status;

      const matchesPlacement =
        placement === "all" ||
        (placement === "hero" && article.heroPriority !== null) ||
        (placement === "breaking" && article.isBreaking) ||
        (placement === "daily" && article.inDailyEdit);

      return (
        matchesTerm && matchesCategory && matchesStatus && matchesPlacement
      );
    });
  }, [articles, search, category, status, placement]);

  const counts = useMemo(
    () => ({
      total: articles.length,
      published: articles.filter((article) => isLive(article)).length,
      draft: articles.filter((article) => article.status === "draft").length,
      scheduled: articles.filter((article) => article.status === "scheduled")
        .length,
      archived: articles.filter((article) => article.status === "archived")
        .length,
    }),
    [articles]
  );

  const filtersActive =
    Boolean(search.trim()) ||
    category !== "all" ||
    status !== "all" ||
    placement !== "all";

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setStatus("all");
    setPlacement("all");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-extrabold text-ink">
              Articles
            </h1>
            <span className="rounded-md bg-mint/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-mint ring-1 ring-mint/30">
              {counts.total} stories
            </span>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-deep">
            <span>{counts.published} live</span>
            <span>{counts.draft} drafts</span>
            <span>{counts.scheduled} scheduled</span>
            <span>{counts.archived} archived</span>
          </p>
        </div>

        <Button
          icon={<Plus className="h-4 w-4" />}
          onClick={() => navigate("/articles/new")}
        >
          New story
        </Button>
      </div>

      {state?.saved ? (
        <Alert tone="success" title="Saved">
          “{state.saved}” is now {state.status === "published" ? "live on the wire" : `marked ${state.status}`}.
        </Alert>
      ) : null}

      {state?.deleted ? (
        <Alert tone="warning" title="Story deleted">
          It has been removed from the shared articles table.
        </Alert>
      ) : null}

      {error ? <Alert tone="error">{error}</Alert> : null}
      {rowError ? (
        <Alert tone="error" onDismiss={() => setRowError(null)}>
          {rowError}
        </Alert>
      ) : null}

      {/* Filters */}
      <div className="grid gap-3 rounded-2xl border border-line bg-card p-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-deep" />
          <TextInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search headline, summary, source or tag…"
            className="pl-9"
            aria-label="Search articles"
          />
        </div>

        <Select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filter by category"
        >
          {categories.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? "All categories" : option}
            </option>
          ))}
        </Select>

        <Select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as "all" | PublishStatus)
          }
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {PUBLISH_STATUSES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>

        <Select
          value={placement}
          onChange={(event) => setPlacement(event.target.value as PlacementFilter)}
          aria-label="Filter by placement"
        >
          <option value="all">Any placement</option>
          <option value="hero">Hero carousel</option>
          <option value="breaking">Breaking alert</option>
          <option value="daily">The Daily Edit</option>
        </Select>

        {filtersActive ? (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted transition-colors hover:text-mint"
          >
            <Filter className="h-3 w-3" />
            Reset filters
          </button>
        ) : null}
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingBlock label="Fetching the wire…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-5 w-5" />}
          title={
            articles.length === 0
              ? "No stories yet"
              : "Nothing matches those filters"
          }
          description={
            articles.length === 0
              ? "Create the first curated story and it will appear on the NexTake feed, hero carousel and digest."
              : "Clear the search or widen the category and status filters to see more."
          }
          action={
            articles.length === 0 ? (
              <Button
                size="sm"
                icon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => navigate("/articles/new")}
              >
                New story
              </Button>
            ) : (
              <Button size="sm" variant="secondary" onClick={resetFilters}>
                Reset filters
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((article) => (
            <article
              key={article.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card transition-colors hover:border-line-strong"
            >
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-navy">
                {article.coverImageUrl ? (
                  <img
                    src={article.coverImageUrl}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : null}

                <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-mint px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-navy">
                    {article.category}
                  </span>
                  {article.isBreaking ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-500 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                      <Radio className="h-3 w-3" />
                      Breaking
                    </span>
                  ) : null}
                </div>

                <div className="absolute right-3 top-3">
                  <StatusBadge status={article.status} />
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-4">
                <h3 className="line-clamp-2 font-display text-[15px] font-bold leading-snug text-ink">
                  {article.title}
                </h3>
                <p className="line-clamp-3 text-[12px] leading-relaxed text-muted-deep">
                  {article.summary}
                </p>

                <div className="flex flex-wrap items-center gap-1.5">
                  {article.heroPriority !== null ? (
                    <Pill tone="mint">
                      <Star className="h-3 w-3" />
                      Hero P{article.heroPriority}
                    </Pill>
                  ) : null}
                  {article.inDailyEdit ? <Pill tone="sky">Daily Edit</Pill> : null}
                  <Pill tone="neutral">{article.linkBehavior}</Pill>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-deep">
                  <span className="truncate text-mint">{article.sourceName}</span>
                  <span className="flex shrink-0 items-center gap-2.5">
                    {article.readTime ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.views.toLocaleString()}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-line bg-card-alt px-4 py-3">
                <span className="truncate font-mono text-[10px] uppercase tracking-[0.08em] text-muted-deep">
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleString(undefined, {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "No publish date"}
                </span>

                <span className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    title="Edit story"
                    onClick={() => navigate(`/articles/${article.id}`)}
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-white/5 hover:text-mint"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Delete story"
                    onClick={() => setPendingDelete(article)}
                    className="rounded-lg p-2 text-muted transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {pendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-line bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-base font-extrabold text-ink">
                Delete “{pendingDelete.title}”?
              </h2>
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-muted hover:bg-white/5 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              The story is removed from the shared articles table and disappears
              from the public feed immediately.
            </p>

            <div className="mt-5 flex justify-end gap-2.5">
              <Button variant="secondary" onClick={() => setPendingDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  const result = await removeArticle(pendingDelete.id);
                  setPendingDelete(null);
                  if (result.error) setRowError(result.error);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
