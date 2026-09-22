
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

import type {
  NavPageId,
  Article,
  WebsiteConfig,
  ActivityItem,
  SystemMetric,
} from "./types";

import {
  INITIAL_WEBSITE_CONFIG,
  INITIAL_ACTIVITIES,
  SYSTEM_METRICS,
} from "./data/initialData";

import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";
import AdminFooter from "./components/AdminFooter";
import DashboardHome from "./components/pages/DashboardHome";
import WebsiteManager from "./components/pages/WebsiteManager";
import BlogManager from "./components/pages/BlogManager";
import LogoutModal from "./components/LogoutModal";
import LoggedOutView from "./components/LoggedOutView";
import LiveWebsiteModal from "./components/LiveWebsiteModal";

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPageId>("home");
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLiveWebsiteOpen, setIsLiveWebsiteOpen] = useState(false);
  const [isNewArticleModalOpen, setIsNewArticleModalOpen] = useState(false);

  // App core state
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);

  const [websiteConfig, setWebsiteConfig] =
    useState<WebsiteConfig>(INITIAL_WEBSITE_CONFIG);

  const [activities, setActivities] =
    useState<ActivityItem[]>(INITIAL_ACTIVITIES);

  const [metrics, setMetrics] =
    useState<SystemMetric[]>(SYSTEM_METRICS);

  // Load articles from Supabase
  useEffect(() => {
    const loadArticles = async () => {
      setIsLoadingArticles(true);

      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading articles:", error);
        setIsLoadingArticles(false);
        return;
      }

      const formattedArticles: Article[] = (data ?? []).map((article) => ({
        id: article.id,
        category: article.category,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        author: article.author,
        date: article.date,
        status: article.status,
        views: article.views,
        readTime: article.read_time,
        avatar: article.avatar,
        image: article.image,
        isNew: article.is_new,
      }));

      setArticles(formattedArticles);
      setIsLoadingArticles(false);
    };

    loadArticles();
  }, []);

  const handleNavigate = (page: NavPageId) => {
    if (page === "logout") {
      setIsLogoutModalOpen(true);
      return;
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    setIsLoggedIn(false);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage("home");
  };

  // Article Actions
 const handleAddArticle = async (
  newArticleData: Omit<Article, "id">
) => {
  const { data, error } = await supabase
    .from("articles")
    .insert({
      category: newArticleData.category,
      title: newArticleData.title,
      excerpt: newArticleData.excerpt,
      content: newArticleData.content,
      author: newArticleData.author,
      date: newArticleData.date,
      status: newArticleData.status,
      views: newArticleData.views,
      read_time: newArticleData.readTime,
      avatar: newArticleData.avatar,
      image: newArticleData.image,
      is_new: newArticleData.isNew,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating article:", error);
    return;
  }

  const newArticle: Article = {
    id: data.id,
    category: data.category,
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    author: data.author,
    date: data.date,
    status: data.status,
    views: data.views,
    readTime: data.read_time,
    avatar: data.avatar,
    image: data.image,
    isNew: data.is_new,
  };

  setArticles((prev) => [newArticle, ...prev]);
};

  // Update Article
 const handleUpdateArticle = async (updatedArticle: Article) => {
  const { error } = await supabase
    .from("articles")
    .update({
      category: updatedArticle.category,
      title: updatedArticle.title,
      excerpt: updatedArticle.excerpt,
      content: updatedArticle.content,
      author: updatedArticle.author,
      date: updatedArticle.date,
      status: updatedArticle.status,
      views: updatedArticle.views,
      read_time: updatedArticle.readTime,
      avatar: updatedArticle.avatar,
      image: updatedArticle.image,
      is_new: updatedArticle.isNew,
    })
    .eq("id", updatedArticle.id);

  if (error) {
    console.error("Error updating article:", error);
    return;
  }

  setArticles((prev) =>
    prev.map((article) =>
      article.id === updatedArticle.id
        ? updatedArticle
        : article
    )
  );
};

  // Delete Article
 const handleDeleteArticle = async (id: string) => {
  const target = articles.find((article) => article.id === id);

  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting article:", error);
    return;
  }

  setArticles((prev) =>
    prev.filter((article) => article.id !== id)
  );

  if (target) {
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      action: "Removed article",
      target: target.title,
      timestamp: "Just now",
      user: "Promise Akanni",
      type: "system",
    };

    setActivities((prev) => [newActivity, ...prev]);
  }
};

  // Website Config Actions
  const handleUpdateWebsiteConfig = (
    newConfig: WebsiteConfig
  ) => {
    setWebsiteConfig(newConfig);

    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      action: "Updated website layout",
      target: `Hero & Navigation for ${newConfig.siteName}`,
      timestamp: "Just now",
      user: "Promise Akanni",
      type: "edit",
    };

    setActivities((prev) => [newActivity, ...prev]);
  };

  if (!isLoggedIn) {
    return <LoggedOutView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#071A2B]">
      <AdminHeader
        currentPage={currentPage}
        onNavigate={handleNavigate}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() =>
          setMobileMenuOpen(!mobileMenuOpen)
        }
        onOpenLiveSite={() => setIsLiveWebsiteOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <AdminSidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
          articleCount={articles.length}
        />

        <main
          id="admin-main-content"
          className="flex-1 w-full lg:pl-64 bg-white min-h-[calc(100vh-140px)] transition-all"
        >
          <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto">
            {isLoadingArticles ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-sm text-slate-500">
                  Loading articles...
                </p>
              </div>
            ) : (
              <>
                {currentPage === "home" && (
                  <DashboardHome
                    articles={articles}
                    metrics={metrics}
                    activities={activities}
                    onNavigate={handleNavigate}
                    onOpenNewArticleModal={() => {
                      setCurrentPage("blog");
                      setIsNewArticleModalOpen(true);
                    }}
                  />
                )}

                {currentPage === "website" && (
                  <WebsiteManager
                    config={websiteConfig}
                    onUpdateConfig={handleUpdateWebsiteConfig}
                    onOpenLiveSite={() =>
                      setIsLiveWebsiteOpen(true)
                    }
                    articles={articles}
                    onUpdateArticle={handleUpdateArticle}
                  />
                )}

                {currentPage === "blog" && (
                  <BlogManager
                    articles={articles}
                    onAddArticle={handleAddArticle}
                    onUpdateArticle={handleUpdateArticle}
                    onDeleteArticle={handleDeleteArticle}
                    isNewModalOpen={isNewArticleModalOpen}
                    onCloseNewModal={() =>
                      setIsNewArticleModalOpen(false)
                    }
                    onOpenNewModal={() =>
                      setIsNewArticleModalOpen(true)
                    }
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <div className="lg:pl-64 bg-[#071A2B]">
        <AdminFooter onNavigate={handleNavigate} />
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={handleConfirmLogout}
      />

      <LiveWebsiteModal
        isOpen={isLiveWebsiteOpen}
        onClose={() => setIsLiveWebsiteOpen(false)}
        config={websiteConfig}
        articles={articles}
      />
    </div>
  );
}
