import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { backend } from "../backend";
import { DEFAULT_SETTINGS } from "../backend/mappers";
import { useAuth } from "../auth/context";
import { CmsContext, type CmsContextValue } from "./context";
import type {
  ActivityItem,
  Article,
  ArticleInput,
  Company,
  SiteSettings,
} from "../../types";

/**
 * Single data-access point for the console. Pages never talk to Supabase
 * directly, so swapping the hosted backend for the local demo workspace (or
 * adding caching later) touches one file.
 */
export function CmsProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const actor = profile?.email ?? "unknown";

  const [articles, setArticles] = useState<Article[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [articleResult, companyResult, settingsResult, activityResult] =
      await Promise.all([
        backend.articles.list(),
        backend.companies.list(),
        backend.settings.get(),
        backend.activity.list(),
      ]);

    if (articleResult.error) {
      setError(articleResult.error);
    } else {
      setArticles(articleResult.data ?? []);
    }

    if (!companyResult.error) setCompanies(companyResult.data ?? []);
    if (!settingsResult.error && settingsResult.data) {
      setSettings(settingsResult.data);
    }
    if (!activityResult.error) setActivity(activityResult.data ?? []);

    setLoading(false);
  }, []);

  /* Load after mount (not during render) so the first paint is never blocked. */
  useEffect(() => {
    const timer = setTimeout(() => {
      void refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  const saveArticle = useCallback(
    async (input: ArticleInput, id?: string) => {
      setSaving(true);
      const result = id
        ? await backend.articles.update(id, input, actor)
        : await backend.articles.create(input, actor);
      setSaving(false);

      if (!result.error) await refresh();
      return result;
    },
    [actor, refresh]
  );

  const removeArticle = useCallback(
    async (id: string) => {
      setSaving(true);
      const result = await backend.articles.remove(id);
      setSaving(false);

      if (!result.error) await refresh();
      return result;
    },
    [refresh]
  );

  const saveSettings = useCallback(async (next: SiteSettings) => {
    setSaving(true);
    const result = await backend.settings.update(next);
    setSaving(false);

    if (!result.error && result.data) setSettings(result.data);
    return result;
  }, []);

  const value = useMemo<CmsContextValue>(
    () => ({
      articles,
      companies,
      settings,
      activity,
      loading,
      error,
      saving,
      refresh,
      saveArticle,
      removeArticle,
      saveSettings,
    }),
    [
      articles,
      companies,
      settings,
      activity,
      loading,
      error,
      saving,
      refresh,
      saveArticle,
      removeArticle,
      saveSettings,
    ]
  );

  return <CmsContext.Provider value={value}>{children}</CmsContext.Provider>;
}

export default CmsProvider;
