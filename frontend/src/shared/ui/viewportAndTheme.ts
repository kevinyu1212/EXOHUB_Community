import { useEffect, useState } from "react";
import type React from "react";

export type ThemeMode = "dark" | "light";

export interface SidebarNavItem {
  path: string;
  label: string;
  adminOnly?: boolean;
}

export const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { path: "/", label: "홈" },
  { path: "/taxa", label: "생물 도감" },
  { path: "/price", label: "가격 비교" },
  { path: "/market", label: "마켓" },
  { path: "/care", label: "사육 관리" },
  { path: "/collection", label: "표본·박제 컬렉션" },
  { path: "/community", label: "커뮤니티" },
  { path: "/ai-lab", label: "AI LAB" },
  { path: "/me", label: "마이페이지" },
  { path: "/admin", label: "관리자", adminOnly: true }
];

export function useIsCompactViewport(breakpointPx = 960): boolean {
  const [isCompact, setIsCompact] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpointPx : false
  );

  useEffect(() => {
    const onResize = () => {
      setIsCompact(window.innerWidth < breakpointPx);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpointPx]);

  return isCompact;
}

export function useThemeMode(initialMode: ThemeMode = "dark"): {
  themeMode: ThemeMode;
  setThemeMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
  toggleThemeMode: () => void;
} {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return initialMode;
    const saved = window.localStorage.getItem("exohub_theme_mode");
    return saved === "light" || saved === "dark" ? saved : initialMode;
  });

  useEffect(() => {
    const root = document.documentElement;
    const isLight = themeMode === "light";

    root.style.setProperty("--bg-canvas", isLight ? "#F8FAFC" : "#111827");
    root.style.setProperty("--bg-surface", isLight ? "#FFFFFF" : "#1F2937");
    root.style.setProperty("--text-primary", isLight ? "#0F172A" : "#F9FAFB");
    root.style.setProperty("--text-muted", isLight ? "#475569" : "#9CA3AF");
    root.style.setProperty("--border-subtle", isLight ? "#CBD5E1" : "#374151");
    root.style.setProperty("--accent-primary", isLight ? "#4D7C0F" : "#A3E635");
    root.style.setProperty("--accent-secondary", isLight ? "#0284C7" : "#38BDF8");
    root.setAttribute("data-theme", themeMode);

    document.body.style.backgroundColor = "var(--bg-canvas)";
    document.body.style.color = "var(--text-primary)";

    try {
      window.localStorage.setItem("exohub_theme_mode", themeMode);
    } catch {
      // 스토리지 접근 불가 환경 무시
    }
  }, [themeMode]);

  const toggleThemeMode = () => {
    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return { themeMode, setThemeMode, toggleThemeMode };
}