import { useState } from "react";
import type { NavPageId, Article, WebsiteConfig, ActivityItem, SystemMetric } from "./types";
import { INITIAL_ARTICLES, INITIAL_WEBSITE_CONFIG, INITIAL_ACTIVITIES, SYSTEM_METRICS } from "./data/initialData";
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
  const [currentPage, setCurrentPage] = useState<NavPageId>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modals state
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLiveWebsiteOpen, setIsLiveWebsiteOpen] = useState(false);
  const [isNewArticleModalOpen, setIsNewArticleModalOpen] = useState(false);

  // App core state
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig>(INITIAL_WEBSITE_CONFIG);
  const [activities, setActivities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [metrics, setMetrics] = useState<SystemMetric[]>(SYSTEM_METRICS);

  const handleNavigate = (page: NavPageId) => {
    if (page === 'logout') {
      setIsLogoutModalOpen(true);
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    setIsLoggedIn(false);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage('home');
  };

  // Article Actions
  const handleAddArticle = (newArticleData: Omit<Article, 'id'>) => {
    const newArticle: Article = {
      ...newArticleData,
      id: `art-${Date.now()}`,
    };
    setArticles(prev => [newArticle, ...prev]);

    // Record activity
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      action: "Published new article",
      target: newArticle.title,
      timestamp: "Just now",
      user: "Promise Akanni",
      type: "publish",
    };
    setActivities(prev => [newActivity, ...prev]);

    // Update metrics
    setMetrics(prev => prev.map(m => {
      if (m.label.includes("Published Articles")) {
        const count = parseInt(m.value) + 1;
        return { ...m, value: count.toString() };
      }
      return m;
    }));
  };

  const handleUpdateArticle = (updatedArticle: Article) => {
    setArticles(prev => prev.map(a => a.id === updatedArticle.id ? updatedArticle : a));

    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      action: "Updated article",
      target: updatedArticle.title,
      timestamp: "Just now",
      user: "Promise Akanni",
      type: "edit",
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const handleDeleteArticle = (id: string) => {
    const target = articles.find(a => a.id === id);
    setArticles(prev => prev.filter(a => a.id !== id));

    if (target) {
      const newActivity: ActivityItem = {
        id: `act-${Date.now()}`,
        action: "Removed article",
        target: target.title,
        timestamp: "Just now",
        user: "Promise Akanni",
        type: "system",
      };
      setActivities(prev => [newActivity, ...prev]);
    }
  };

  // Website Config Actions
  const handleUpdateWebsiteConfig = (newConfig: WebsiteConfig) => {
    setWebsiteConfig(newConfig);

    const newActivity: ActivityItem = {
      id: `act-${Date.now()}`,
      action: "Updated website layout",
      target: `Hero & Navigation for ${newConfig.siteName}`,
      timestamp: "Just now",
      user: "Promise Akanni",
      type: "edit",
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  if (!isLoggedIn) {
    return <LoggedOutView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#071A2B]">
      
      {/* 1. Deep Navy Header */}
      <AdminHeader
        currentPage={currentPage}
        onNavigate={handleNavigate}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        onOpenLiveSite={() => setIsLiveWebsiteOpen(true)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* 2. Deep Navy Sidebar (Home page, Website, Blog, Log out) */}
        <AdminSidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
          articleCount={articles.length}
        />

        {/* 3. Main Content / Body (STRICTLY WHITE BACKGROUND) */}
        <main 
          id="admin-main-content" 
          className="flex-1 w-full lg:pl-64 bg-white min-h-[calc(100vh-140px)] transition-all"
        >
          <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto">
            {currentPage === 'home' && (
              <DashboardHome
                articles={articles}
                metrics={metrics}
                activities={activities}
                onNavigate={handleNavigate}
                onOpenNewArticleModal={() => {
                  setCurrentPage('blog');
                  setIsNewArticleModalOpen(true);
                }}
              />
            )}

            {currentPage === 'website' && (
              <WebsiteManager
                config={websiteConfig}
                onUpdateConfig={handleUpdateWebsiteConfig}
                onOpenLiveSite={() => setIsLiveWebsiteOpen(true)}
                articles={articles}
                onUpdateArticle={handleUpdateArticle}
              />
            )}

            {currentPage === 'blog' && (
              <BlogManager
                articles={articles}
                onAddArticle={handleAddArticle}
                onUpdateArticle={handleUpdateArticle}
                onDeleteArticle={handleDeleteArticle}
                isNewModalOpen={isNewArticleModalOpen}
                onCloseNewModal={() => setIsNewArticleModalOpen(false)}
                onOpenNewModal={() => setIsNewArticleModalOpen(true)}
              />
            )}
          </div>
        </main>

      </div>

      {/* 4. Deep Navy Footer */}
      <div className="lg:pl-64 bg-[#071A2B]">
        <AdminFooter onNavigate={handleNavigate} />
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={handleConfirmLogout}
      />

      {/* Live Website Preview Modal */}
      <LiveWebsiteModal
        isOpen={isLiveWebsiteOpen}
        onClose={() => setIsLiveWebsiteOpen(false)}
        config={websiteConfig}
        articles={articles}
      />

    </div>
  );
}
