import React, { useEffect, useState } from "react";
import { GlobalNav, GlobalSearchBar } from "../shared";
import type { CategoryCode } from "../shared";
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

  const navigateTo = (nextPath: string, searchParam?: string) => {
    const targetPath = normalizePath(nextPath);
    const searchSuffix =
      searchParam && searchParam.trim().length > 0
        ? `?q=${encodeURIComponent(searchParam.trim())}`
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
      <GlobalNav activePath={activePath} onSelectPath={navigateTo} isAdmin={isAdminPreview} />

      <div
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "24px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "18px"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap"
          }}
        >
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            현재 경로: <strong style={{ color: "var(--text-primary)" }}>{activePath}</strong> · 각 메뉴 우측{" "}
            <strong style={{ color: "var(--accent-secondary)" }}>↗</strong> 클릭 시 새 창으로 열립니다.
          </span>
          <button
            type="button"
            onClick={() => {
              const nextAdmin = !isAdminPreview;
              setIsAdminPreview(nextAdmin);
              if (!nextAdmin && activePath === "/admin") {
                navigateTo("/");
              }
            }}
            style={{
              padding: "5px 10px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-surface)",
              color: "var(--text-muted)",
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            관리자 메뉴 미리보기: {isAdminPreview ? "ON" : "OFF"}
          </button>
        </div>

        <GlobalSearchBar
          query={query}
          selectedCategory={selectedCategory}
          onQueryChange={setQuery}
          onCategoryChange={setSelectedCategory}
          onSubmitSearch={() => navigateTo("/search", query)}
        />

        <main style={{ flex: 1 }}>{renderPage()}</main>
      </div>

      <footer
        style={{
          padding: "16px 20px",
          backgroundColor: "var(--bg-surface)",
          borderTop: "1px solid var(--border-subtle)",
          fontSize: "12px",
          color: "var(--text-muted)",
          lineHeight: 1.6
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          EXOHUB · 정보는 출처 및 검수 상태와 함께 제공되며, 법적 거래 허용·종 확정 동정·질병 진단은 별도 확인 및 전문가 검수가 필요합니다.
        </div>
      </footer>
    </div>
  );
};