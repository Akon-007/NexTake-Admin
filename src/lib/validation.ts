import { CATEGORIES } from "../types";
import type {
  LinkBehavior,
  PublishStatus,
  SyndicationLicense,
} from "../types";

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

const URL_PATTERN = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!URL_PATTERN.test(trimmed)) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** `2026-09-22T14:30` (datetime-local) → ISO string, or null when empty. */
export function localDateTimeToIso(value: string): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/** ISO string → `YYYY-MM-DDTHH:mm` for datetime-local inputs. */
export function isoToLocalDateTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function isInTheFuture(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() > Date.now();
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "Email address is required.";
  if (!isEmail(trimmed)) return "Enter a valid email address.";
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Password must be at least 8 characters.";
  return null;
}

export function validateVerificationCode(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "Enter the 6-digit code from your email.";
  if (digits.length !== 6) return "The code must be 6 digits.";
  return null;
}

/* ------------------------------------------------------------------ */
/* Article form                                                        */
/* ------------------------------------------------------------------ */

/** Editable shape used by the CMS form (all values as entered by the admin). */
export interface ArticleFormValues {
  slug: string;
  title: string;
  summary: string;
  keyTakeaways: string[];
  category: string;
  tags: string[];
  coverImageUrl: string;
  imageCredit: string;
  readTime: string;
  sourceUrl: string;
  sourceName: string;
  sourceLogoUrl: string;
  originalAuthor: string;
  originalPublishedAt: string;
  linkBehavior: LinkBehavior;
  canonicalUrl: string;
  syndicationLicense: SyndicationLicense | "";
  syndicatedBody: string;
  status: PublishStatus;
  publishedAt: string;
  heroPriority: string;
  inDailyEdit: boolean;
  isBreaking: boolean;
  relatedCompanyIds: string[];
}

export type ArticleFieldErrors = Partial<
  Record<keyof ArticleFormValues | "form", string>
>;

export function validateArticleForm(
  values: ArticleFormValues
): ArticleFieldErrors {
  const errors: ArticleFieldErrors = {};

  /* A. Source */
  if (!values.sourceUrl.trim()) {
    errors.sourceUrl = "Source link is required.";
  } else if (!isHttpUrl(values.sourceUrl)) {
    errors.sourceUrl = "Enter a full URL starting with https://";
  }

  if (!values.sourceName.trim()) {
    errors.sourceName = "Source name is required.";
  } else if (values.sourceName.trim().length < 2) {
    errors.sourceName = "Source name is too short.";
  }

  if (values.sourceLogoUrl.trim() && !isHttpUrl(values.sourceLogoUrl)) {
    errors.sourceLogoUrl = "Enter a full URL starting with https://";
  }

  if (
    values.originalPublishedAt &&
    Number.isNaN(new Date(values.originalPublishedAt).getTime())
  ) {
    errors.originalPublishedAt = "Enter a valid date and time.";
  }

  if (values.linkBehavior !== "external" && values.linkBehavior !== "reader") {
    errors.linkBehavior = "Choose how the story should open.";
  }

  /* B. Content */
  if (!values.title.trim()) {
    errors.title = "Headline is required.";
  } else if (values.title.trim().length < 8) {
    errors.title = "Headline should be at least 8 characters.";
  } else if (values.title.trim().length > 180) {
    errors.title = "Headline must be 180 characters or fewer.";
  }

  if (!values.summary.trim()) {
    errors.summary = "Executive summary is required.";
  } else if (values.summary.trim().length < 40) {
    errors.summary = "Write at least 2–3 sentences (40+ characters).";
  } else if (values.summary.trim().length > 600) {
    errors.summary = "Keep the summary under 600 characters.";
  }

  if (!values.category.trim()) {
    errors.category = "Category is required.";
  }

  if (!values.coverImageUrl.trim()) {
    errors.coverImageUrl = "Cover image is required.";
  } else if (!isHttpUrl(values.coverImageUrl)) {
    errors.coverImageUrl = "Enter a full URL starting with https://";
  }

  if (values.tags.some((tag) => tag.length > 40)) {
    errors.tags = "Tags must be 40 characters or fewer.";
  }

  /* C. SEO & syndication */
  if (!values.canonicalUrl.trim()) {
    errors.canonicalUrl = "Canonical URL is required.";
  } else if (!isHttpUrl(values.canonicalUrl)) {
    errors.canonicalUrl = "Enter a full URL starting with https://";
  }

  if (
    values.syndicatedBody.trim().length > 0 &&
    values.syndicationLicense === "fair_use_summary"
  ) {
    errors.syndicationLicense =
      "Fair Use Summary cannot include a syndicated body — switch the licence or clear the body.";
  }

  /* D. Placement */
  if (values.status === "scheduled") {
    if (!values.publishedAt) {
      errors.publishedAt = "Scheduled stories need a release date and time.";
    } else if (!isInTheFuture(localDateTimeToIso(values.publishedAt))) {
      errors.publishedAt = "Pick a future date to schedule this story.";
    }
  }

  if (values.status === "published" && !values.publishedAt) {
    errors.publishedAt = "Set the publish date and time.";
  }

  if (values.heroPriority) {
    const numeric = Number(values.heroPriority);
    if (!Number.isInteger(numeric) || numeric < 1 || numeric > 5) {
      errors.heroPriority = "Hero priority must be between 1 and 5.";
    }
  }

  return errors;
}

export function hasErrors(errors: ArticleFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function categoryOptions(extra: string[] = []): string[] {
  const merged = new Set<string>([...CATEGORIES, ...extra]);
  return Array.from(merged);
}
