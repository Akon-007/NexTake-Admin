import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useCms } from "../../lib/store/context";
import { isLive } from "../../lib/visibility";
import type { NavPageId } from "../../types";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";
import LogoutModal from "./LogoutModal";

function pageFromPath(pathname: string): NavPageId {
  if (pathname.startsWith("/preview")) return "preview";
  if (pathname.startsWith("/website")) return "website";
  if (pathname.startsWith("/articles")) return "articles";
  return "home";
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { articles } = useCms();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const currentPage = pageFromPath(location.pathname);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const handleNavigate = (page: NavPageId) => {
    setMobileMenuOpen(false);

    if (page === "logout") {
      setLogoutOpen(true);
      return;
    }

    const target =
      page === "home"
        ? "/"
        : page === "articles"
          ? "/articles"
          : page === "website"
            ? "/website"
            : "/preview";

    navigate(target);
  };

  const draftCount = articles.filter(
    (article) => article.status === "draft"
  ).length;

  const scheduledCount = articles.filter(
    (article) => article.status === "scheduled"
  ).length;

  const publishedCount = articles.filter((article) => isLive(article)).length;

  return (
    <div className="min-h-screen bg-canvas">
      <AdminHeader
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((open) => !open)}
        onOpenLiveSite={() => navigate("/preview")}
        onRequestLogout={() => setLogoutOpen(true)}
      />

      <AdminSidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
        articleCount={articles.length}
        draftCount={draftCount}
        scheduledCount={scheduledCount}
      />

      <main className="lg:pl-64">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>

      <div className="lg:pl-64">
        <AdminFooter onNavigate={handleNavigate} publishedCount={publishedCount} />
      </div>

      <LogoutModal open={logoutOpen} onClose={() => setLogoutOpen(false)} />
    </div>
  );
}
