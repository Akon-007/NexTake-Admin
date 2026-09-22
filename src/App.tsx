import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import { AuthProvider } from "./lib/auth/AuthProvider";
import { useAuth } from "./lib/auth/context";
import { CmsProvider } from "./lib/store/CmsProvider";
import { NexTakeLogo } from "./components/brand/NexTakeLogo";
import { Spinner } from "./components/ui/Feedback";
import AuthScreen from "./components/auth/AuthScreen";
import AdminLayout from "./components/admin/AdminLayout";
import DashboardHome from "./components/pages/DashboardHome";
import ArticleList from "./components/pages/ArticleList";
import ArticleEditor from "./components/pages/ArticleEditor";
import WebsiteManager from "./components/pages/WebsiteManager";
import LivePreview from "./components/pages/LivePreview";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}

/**
 * Route guard: the console, its data and every CMS operation sit behind a
 * verified session. Unauthenticated visitors only ever see the auth screen.
 */
function AppShell() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas">
        <NexTakeLogo showWordmark={false} />
        <Spinner className="h-5 w-5" />
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-deep">
          Restoring session…
        </p>
      </div>
    );
  }

  if (status !== "authenticated") {
    return <AuthScreen />;
  }

  return (
    <CmsProvider>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/articles" element={<ArticleList />} />
          <Route path="/articles/new" element={<ArticleEditor />} />
          <Route path="/articles/:articleId" element={<ArticleEditorRoute />} />
          <Route path="/website" element={<WebsiteManager />} />
        </Route>

        <Route path="/preview" element={<LivePreview />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </CmsProvider>
  );
}

/** Reads the `:articleId` param and hands it to the editor. */
function ArticleEditorRoute() {
  const { articleId } = useParams<{ articleId: string }>();
  return <ArticleEditor articleId={articleId} />;
}
