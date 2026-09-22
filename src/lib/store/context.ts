import { createContext, useContext } from "react";
import type { BackendResult } from "../backend";
import type {
  ActivityItem,
  Article,
  ArticleInput,
  Company,
  SiteSettings,
} from "../../types";

export interface CmsContextValue {
  articles: Article[];
  companies: Company[];
  settings: SiteSettings;
  activity: ActivityItem[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  refresh(): Promise<void>;
  saveArticle(input: ArticleInput, id?: string): Promise<BackendResult<Article>>;
  removeArticle(id: string): Promise<BackendResult<null>>;
  saveSettings(next: SiteSettings): Promise<BackendResult<SiteSettings>>;
}

export const CmsContext = createContext<CmsContextValue | null>(null);

export function useCms(): CmsContextValue {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error("useCms must be used inside <CmsProvider>.");
  }
  return context;
}
