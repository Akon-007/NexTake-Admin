import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  FileText,
  Globe,
  Plus,
  Radio,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useCms } from "../../lib/store/context";
import { isLive } from "../../lib/visibility";
import { useAuth } from "../../lib/auth/context";
import type { SystemMetric } from "../../types";
import Button from "../ui/Button";
import { EmptyState, LoadingBlock } from "../ui/Feedback";
import { Pill, StatusBadge } from "../ui/StatusBadge";

export default function DashboardHome() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { articles, activity, loading, error } = useCms();

  const stats = useMemo(() => {
    const live = articles.filter((article) => isLive(article));
    const drafts = articles.filter((article) => article.status === "draft");
    const scheduled = articles.filter(
      (article) => article.status === "scheduled"
    );
    const hero = articles.filter((article) => article.heroPriority !== null);
    const breaking = articles.filter((article) => article.isBreaking);
    const digest = articles.filter((article) => article.inDailyEdit);
    const views = articles.reduce((sum, article) => sum + article.views, 0);

    return { live, drafts, scheduled, hero, breaking, digest, views };
  }, [articles]);

  const metrics: SystemMetric[] = [
    {
      label: "Live stories",
      value: String(stats.live.length),
      change: `${stats.scheduled.length} scheduled`,
      positive: true,
      technicalDetail: `${articles.length} stories in the library`,
      progressPercent:
        articles.length === 0
          ? 0
          : Math.round((stats.live.length / articles.length) * 100),
    },
    {
      label: "Drafts on desk",
      value: String(stats.drafts.length),
      change: "Needs edit",
      positive: stats.drafts.length === 0,
      technicalDetail: "Saved privately to the CMS",
      progressPercent:
        articles.length === 0
          ? 0
          : Math.round((stats.drafts.length / articles.length) * 100),
    },
    {
      label: "Hero slots filled",
      value: `${stats.hero.length}/5`,
      change: stats.breaking.length > 0 ? "Breaking active" : "No alert",
      positive: stats.hero.length > 0,
      technicalDetail: "Priority 1 leads the carousel",
      progressPercent: Math.round((stats.hero.length / 5) * 100),
    },
    {
      label: "Total reads",
      value: stats.views >= 1000
        ? `${(stats.views / 1000).toFixed(1)}K`
        : String(stats.views),
      change: "All time",
      positive: true,
      technicalDetail: `${stats.digest.length} in The Daily Edit`,
      progressPercent: Math.min(100, Math.round((stats.views / 50000) * 100)),
    },
  ];

  if (loading && articles.length === 0) {
    return <LoadingBlock label="Loading the desk…" />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-2xl border border-line bg-card p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-mint/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-mint">
              <Sparkles className="h-3 w-3" />
              NexTake console
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-mint" />
            </span>

            <h1 className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
              Welcome back,{" "}
              <span className="text-mint">
                {profile?.fullName?.split(" ")[0] ?? "Editor"}
              </span>
            </h1>

            <p className="text-[13px] leading-relaxed text-muted">
              You have{" "}
              <strong className="font-semibold text-ink">
                {stats.drafts.length} draft
                {stats.drafts.length === 1 ? "" : "s"}
              </strong>{" "}
              on the desk and{" "}
              <strong className="font-semibold text-ink">
                {stats.live.length} live stories
              </strong>{" "}
              reaching {stats.views.toLocaleString()} reads. Changes made here go
              straight to the public wire.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button
              icon={<Plus className="h-4 w-4" />}
              onClick={() => navigate("/articles/new")}
            >
              New story
            </Button>
            <Button
              variant="secondary"
              icon={<Globe className="h-4 w-4 text-mint" />}
              onClick={() => navigate("/website")}
            >
              Feed placement
            </Button>
          </div>
        </div>

        {error ? (
          <p className="relative mt-4 text-[12px] text-rose-400">{error}</p>
        ) : null}
      </section>

      {/* Metrics */}
      <section
        aria-label="Newsroom metrics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="space-y-3 rounded-2xl border border-line bg-card p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="nt-mono text-muted">{metric.label}</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-mint/30 bg-mint/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-mint">
                <TrendingUp className="h-3 w-3" />
                {metric.change}
              </span>
            </div>

            <p className="font-display text-3xl font-extrabold tracking-tight text-ink">
              {metric.value}
            </p>

            <div className="space-y-1.5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy">
                <div
                  className="h-full rounded-full bg-mint transition-all"
                  style={{ width: `${metric.progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-muted-deep">
                <span>{metric.technicalDetail}</span>
                <span>{metric.progressPercent}%</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Recent stories */}
        <section className="space-y-4 rounded-2xl border border-line bg-card p-5 xl:col-span-2">
          <header className="flex items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <h2 className="font-display text-base font-extrabold text-ink">
                Latest on the wire
              </h2>
              <p className="text-[11px] text-muted-deep">
                Newest stories in your library
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/articles")}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-mint"
            >
              View all ({articles.length})
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </header>

          {articles.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-5 w-5" />}
              title="No stories yet"
              description="Create the first story and it will flow to the public feed automatically."
              action={
                <Button
                  size="sm"
                  onClick={() => navigate("/articles/new")}
                  icon={<Plus className="h-3.5 w-3.5" />}
                >
                  New story
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3">
              {articles.slice(0, 6).map((article) => (
                <li
                  key={article.id}
                  className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-3.5 transition-colors hover:border-line-strong sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <img
                      src={article.coverImageUrl}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-line"
                    />
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-mint/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-mint">
                          {article.category}
                        </span>
                        <StatusBadge status={article.status} />
                        {article.isBreaking ? (
                          <Pill tone="rose">
                            <Radio className="h-3 w-3" />
                            Breaking
                          </Pill>
                        ) : null}
                      </div>
                      <h3 className="truncate text-[13px] font-bold text-ink">
                        {article.title}
                      </h3>
                      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-deep">
                        {article.sourceName} ·{" "}
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString(
                              undefined,
                              { day: "2-digit", month: "short" }
                            )
                          : "unscheduled"}{" "}
                        · {article.views.toLocaleString()} views
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`/articles/${article.id}`)}
                  >
                    Edit
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Activity */}
        <section className="space-y-4 rounded-2xl border border-line bg-card p-5">
          <header className="flex items-center justify-between gap-3 border-b border-line pb-4">
            <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-ink">
              <Activity className="h-4 w-4 text-mint" />
              Audit log
            </h2>
            <span className="rounded-md bg-mint/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-mint ring-1 ring-mint/30">
              Live
            </span>
          </header>

          {activity.length === 0 ? (
            <EmptyState
              icon={<Activity className="h-5 w-5" />}
              title="No activity yet"
              description="Publishes, edits and deletions are recorded here."
            />
          ) : (
            <ul className="space-y-3.5">
              {activity.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 border-b border-line pb-3 last:border-b-0 last:pb-0"
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-mint ring-4 ring-mint/15" />
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-[12px] font-semibold text-ink">
                      {item.action}
                    </p>
                    <p className="truncate text-[11px] text-muted-deep">
                      {item.target}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-deep">
                      {item.timestamp} · {item.user}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
