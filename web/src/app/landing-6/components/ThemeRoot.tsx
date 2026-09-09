"use client";

/**
 * Applies the `.l6` scope class AND the live theme's `data-theme` attribute
 * to the SAME element — tokens.css's light overrides are written as
 * `.l6[data-theme="light"]`, which only matches when both live together.
 * `layout.tsx` is a server component (can't call hooks), so this one client
 * wrapper carries both the class and the ThemeProvider that feeds it.
 */

import type { ReactNode } from "react";
import { ThemeProvider, useTheme } from "../lib/useTheme";

function ThemedDiv({ className, children }: { className: string; children: ReactNode }) {
  const { theme } = useTheme();
  return (
    <div className={className} data-theme={theme}>
      {children}
    </div>
  );
}

export function ThemeRoot({ className, children }: { className: string; children: ReactNode }) {
  return (
    <ThemeProvider>
      <ThemedDiv className={className}>{children}</ThemedDiv>
    </ThemeProvider>
  );
}
