import { createClient } from "@supabase/supabase-js";
import { INITIAL_ARTICLES } from "../data/initialData";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  typeof supabaseUrl === "string" &&
  supabaseUrl.startsWith("http")
);

export interface ArticleRow {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  status: 'published' | 'draft' | 'scheduled';
  views: number;
  read_time: string;
  avatar: string;
  image: string;
  is_new?: boolean;
  created_at: string;
}

export interface ArticleInsert {
  id?: string;
  category: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  status: 'published' | 'draft' | 'scheduled';
  views: number;
  read_time: string;
  avatar: string;
  image: string;
  is_new?: boolean;
  created_at?: string;
}

export interface ArticleQueryBuilder {
  select(columns?: string): ArticleQueryBuilder;
  eq(column: string, value: unknown): ArticleQueryBuilder;
  order(column: string, options?: { ascending?: boolean }): ArticleQueryBuilder;
  single(): Promise<{ data: ArticleRow; error: Error | null }>;
  insert(data: ArticleInsert | ArticleInsert[]): ArticleQueryBuilder;
  update(data: Partial<ArticleRow>): ArticleQueryBuilder;
  delete(): ArticleQueryBuilder;
  then<TResult1 = unknown, TResult2 = never>(
    onfulfilled?: ((value: { data: ArticleRow[] | null; error: Error | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2>;
}

export interface NexTakeSupabaseClient {
  from(table: string): ArticleQueryBuilder;
}

const STORAGE_KEY = "nextake_articles_db";

function getLocalArticles(): ArticleRow[] {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved) as ArticleRow[];
      }
    }
  } catch {
    // Ignore storage read error
  }

  const initial: ArticleRow[] = INITIAL_ARTICLES.map((art, idx) => ({
    id: art.id,
    category: art.category,
    title: art.title,
    excerpt: art.excerpt,
    content: art.content,
    author: art.author,
    date: art.date,
    status: art.status,
    views: art.views,
    read_time: art.readTime,
    avatar: art.avatar,
    image: art.image,
    is_new: art.isNew,
    created_at: new Date(Date.now() - idx * 86400000).toISOString(),
  }));

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    }
  } catch {
    // Ignore storage write error
  }
  return initial;
}

function saveLocalArticles(items: ArticleRow[]) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  } catch {
    // Ignore storage write error
  }
}

// Mock query builder for Supabase chained calls
function createMockQueryBuilder(table: string): ArticleQueryBuilder {
  let records = table === "articles" ? getLocalArticles() : [];
  let filterFn: (item: ArticleRow) => boolean = () => true;
  let pendingInsert: ArticleInsert | null = null;
  let pendingUpdate: Partial<ArticleRow> | null = null;
  let filterCol: keyof ArticleRow | null = null;
  let filterVal: unknown = null;

  const builder: ArticleQueryBuilder = {
    select() {
      return builder;
    },
    insert(val: ArticleInsert | ArticleInsert[]) {
      pendingInsert = Array.isArray(val) ? val[0] : val;
      return builder;
    },
    update(val: Partial<ArticleRow>) {
      pendingUpdate = val;
      return builder;
    },
    delete() {
      return builder;
    },
    eq(column: string, value: unknown) {
      filterCol = column as keyof ArticleRow;
      filterVal = value;
      const prevFilter = filterFn;
      filterFn = (item: ArticleRow) => prevFilter(item) && item[filterCol!] === value;
      return builder;
    },
    order(column: string, options?: { ascending?: boolean }) {
      const col = column as keyof ArticleRow;
      const asc = options?.ascending ?? true;
      records.sort((a, b) => {
        const valA = (a[col] ?? "") as string | number;
        const valB = (b[col] ?? "") as string | number;
        if (valA < valB) return asc ? -1 : 1;
        if (valA > valB) return asc ? 1 : -1;
        return 0;
      });
      return builder;
    },
    single(): Promise<{ data: ArticleRow; error: Error | null }> {
      if (pendingInsert) {
        const item = pendingInsert;
        const newRecord: ArticleRow = {
          id: item.id || `art-${Date.now()}`,
          category: item.category || "General",
          title: item.title || "Untitled",
          excerpt: item.excerpt || "",
          content: item.content || "",
          author: item.author || "Admin",
          date: item.date || new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
          status: item.status || "draft",
          views: item.views ?? 0,
          read_time: item.read_time || "4 min read",
          avatar: item.avatar || "https://i.pravatar.cc/64?img=12",
          image: item.image || "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=500&fit=crop",
          is_new: item.is_new ?? true,
          created_at: item.created_at || new Date().toISOString(),
        };
        records = [newRecord, ...records];
        saveLocalArticles(records);
        return Promise.resolve({ data: newRecord, error: null });
      }
      const filtered = records.filter(filterFn);
      const found = filtered[0] ?? records[0];
      return Promise.resolve({ data: found, error: null });
    },
    then<TResult1 = unknown, TResult2 = never>(
      onfulfilled?: ((value: { data: ArticleRow[] | null; error: Error | null }) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
    ) {
      if (pendingUpdate && filterCol) {
        records = records.map((r) => {
          if (r[filterCol!] === filterVal) {
            return { ...r, ...pendingUpdate };
          }
          return r;
        });
        saveLocalArticles(records);
        return Promise.resolve({ data: records, error: null }).then(onfulfilled, onrejected);
      }

      if (filterCol) {
        // Handle delete if filtered
        records = records.filter((r) => r[filterCol!] !== filterVal);
        saveLocalArticles(records);
        return Promise.resolve({ data: null, error: null }).then(onfulfilled, onrejected);
      }

      const filtered = records.filter(filterFn);
      return Promise.resolve({ data: filtered, error: null }).then(onfulfilled, onrejected);
    },
  };

  return builder;
}

const mockClient: NexTakeSupabaseClient = {
  from: (_table: string) => createMockQueryBuilder(_table),
};

// Return real client if configured, otherwise fallback to mock
export const supabase: NexTakeSupabaseClient = (isConfigured
  ? (createClient(supabaseUrl!, supabaseAnonKey!) as unknown as NexTakeSupabaseClient)
  : mockClient);
