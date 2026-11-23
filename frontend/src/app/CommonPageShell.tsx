import React, { useEffect, useState } from "react";
import { GlobalNav, GlobalSearchBar } from "../shared";
import type { CategoryCode } from "../shared";
import {
  SharedAdBanner,
  SharedRightSidebar,
  SharedSiteFooter,
  useIsCompactViewport,
  useThemeMode
} from "../shared/commonUiKit";
import { SharedAiChatbotWidget } from "../shared/ui/SharedAiChatbotWidget";
import { MemberWorkspaceView } from "../features/member/MemberWorkspaceView";
import { AdminWorkbenchView } from "../features/admin/AdminWorkbenchView";
import {
  AiLabPage,
  CarePage,
  CollectionPage,
  CommunityPage,
  HomePage,
  MarketPage,
  PricePage,
  SearchPage,
  TaxaPage
} from "../features/pages";

const VALID_PATHS = new Set([
  "/",
  "/search",
  "/taxa",
  "/price",
  "/market",
  "/care",
  "/collection",
  "/community",
  "/ai-lab",
  "/me",
  "/admin"
]);

function normalizePath(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  const trimmed = pathname.replace(/\/+$/, "");
  return VALID_PATHS.has(trimmed) ? trimmed : "/";
}

export const CommonPageShell: React.FC = () => {
  const [activePath, setActivePath] = useState<string>(() =>
    normalizePath(window.location.pathname)
  );
  const [query, setQuery] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("q") ?? "";
  });
  const [selectedCategory, setSelectedCategory] = useState<CategoryCode | "ALL">("ALL");
  const [isAdminPreview, setIsAdminPreview] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const isCompact = useIsCompactViewport(960);
  const { themeMode, toggleThemeMode } = useThemeMode("dark");

  const navigateTo = (nextPath: string, searchParam?: string) => {
    const targetPath = normalizePath(nextPath);
    if (typeof searchParam === "string") {
      setQuery(searchParam);
    }
    const effectiveQ = typeof searchParam === "string" ? searchParam : query;
    const searchSuffix =
      targetPath === "/search" && effectiveQ.trim().length > 0
        ? `?q=${encodeURIComponent(effectiveQ.trim())}`
        : "";
    const fullUrl = `${targetPath}${searchSuffix}`;

    if (window.location.pathname + window.location.search !== fullUrl) {
      window.history.pushState({ path: targetPath }, "", fullUrl);
    }
    setActivePath(targetPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handlePopState = () => {
      setActivePath(normalizePath(window.location.pathname));
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("q") ?? "");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleToggleAdminPreview = () => {
    const nextAdmin = !isAdminPreview;
    setIsAdminPreview(nextAdmin);
    if (!nextAdmin && activePath === "/admin") {
      navigateTo("/");
    }
  };

  const renderPage = () => {
    switch (activePath) {
      case "/search":
        return <SearchPage selectedCategory={selectedCategory} searchQuery={query} />;
      case "/taxa":
        return <TaxaPage selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />;
      case "/price":
        return <PricePage onNavigate={navigateTo} />;
      case "/market":
        return <MarketPage onNavigate={navigateTo} />;
      case "/care":
        return <CarePage />;
      case "/collection":
        return <CollectionPage />;
      case "/community":
        return <CommunityPage />;
      case "/ai-lab":
        return <AiLabPage />;
      case "/me":
        return <MemberWorkspaceView />;
      case "/admin":
        return isAdminPreview ? (
          <AdminWorkbenchView />
        ) : (
          <HomePage
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onNavigate={navigateTo}
          />
        );
      default:
        return (
          <HomePage
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onNavigate={navigateTo}
          />
        );
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <GlobalNav
        onSelectHome={() => navigateTo("/")}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        themeMode={themeMode}
        onToggleTheme={toggleThemeMode}
      />

      <div
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "1440px",
          margin: "0 auto",
          padding: "18px 24px 22px",
          display: "flex",
          flexDirection: "column",
          gap: "14px"
        }}
      >
        <SharedAdBanner
          headline="특수생물 분양·사육장비·표본/박제 기획전 및 시세 알림"
          subtext="배송비 포함 총액 비교와 출처·검수 상태 확인을 한곳에서 살펴보세요."
          ctaLabel="가격 비교 보기"
          onCtaClick={() => navigateTo("/price")}
        />

        <GlobalSearchBar
          query={query}
          selectedCategory={selectedCategory}
          onQueryChange={setQuery}
          onCategoryChange={setSelectedCategory}
          onSubmitSearch={() => navigateTo("/search", query)}
        />

        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns:
              !isCompact && sidebarOpen ? "minmax(0, 1fr) 260px" : "minmax(0, 1fr)",
            gap: !isCompact && sidebarOpen ? "18px" : "0px",
            alignItems: "start",
            transition: "gap 0.24s ease"
          }}
        >
          <main style={{ minWidth: 0 }}>{renderPage()}</main>

          <SharedRightSidebar
            activePath={activePath}
            isAdminPreview={isAdminPreview}
            isCompact={isCompact}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onNavigate={navigateTo}
            onToggleAdminPreview={handleToggleAdminPreview}
          />
        </div>
      </div>

      {isCompact && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            top: "63px",
            zIndex: 20,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            transition: "opacity 0.22s ease"
          }}
        />
      )}

      <SharedSiteFooter onNavigate={navigateTo} />
      <SharedAiChatbotWidget activePath={activePath} onNavigate={navigateTo} />
    </div>
  );
};