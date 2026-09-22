import type { Article } from "../types";

/**
 * Visibility rule shared with the public NexTake blog: a story is live when it
 * is published and its release time has passed. Scheduled, draft and archived
 * stories never reach the public feed.
 */
export function isLive(article: Article, now = Date.now()): boolean {
  if (article.status !== "published") return false;
  if (!article.publishedAt) return true;
  return new Date(article.publishedAt).getTime() <= now;
}
