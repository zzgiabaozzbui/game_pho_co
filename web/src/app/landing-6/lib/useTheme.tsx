"use client";

/**
 * Post-plan enhancement: real light theme for landing-6, toggled from Frame's
 * top bar. Mirrors `web/src/lib/i18n.tsx`'s LanguageProvider pattern exactly
 * (small context + provider, localStorage read on mount, write on change) —
 * same shape, different key, so the two contexts read the same to maintain.
 *
 * Default: SSR/first paint always renders "dark" (matches tokens.css's
 * unscoped default, so no themed flash on slow connections before JS runs).
 * On mount, a saved choice wins; absent one, `prefers-color-scheme: light`
 * flips the default to light — no-preference or a `dark` media query both
 * keep the page on its dark default, per the task's "don't force everyone
 * into light or dark regardless of their OS setting" rule (light is the only
 * thing worth auto-detecting since dark is already the shipped default).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type L6Theme = "dark" | "light";

interface ThemeContextValue {
  theme: L6Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "l6_theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<L6Theme>("dark");

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") {
      setThemeState(saved);
      return;
    }
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      setThemeState("light");
    }
  }, []);

  const setTheme = useCallback((t: L6Theme) => {
    setThemeState(t);
    window.localStorage.setItem(STORAGE_KEY, t);
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
