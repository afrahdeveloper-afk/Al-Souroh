"use client";

import * as React from "react";

/**
 * Radix's Dialog/AlertDialog/Select/Sheet primitives portal their content
 * straight to `document.body` by default. That breaks DOM-scoped theming:
 * this codebase's `[data-app="dashboard"]` CSS variable scope (see
 * dashboard-theme.css / dashboard-components.css) only reaches descendants
 * in the DOM tree, and a portaled node becomes a *sibling* of that scope,
 * not a descendant — confirmed live (a portaled AlertDialog was rendering
 * with the portfolio's generic tokens/radius, not the Dashboard's).
 *
 * Any themed subtree that wants its portaled content to inherit its own
 * scoped tokens needs to redirect the portal's mount container to
 * somewhere *inside* that subtree instead. This context is how a layout
 * (DashboardLayout) supplies that container; the handful of components in
 * this folder that render a Radix Portal read it via
 * `useScopedPortalContainer()` and fall back to Radix's own default
 * (document.body, via `undefined`) when nothing provides it — so nothing
 * here behaves differently for the portfolio, which doesn't use any of
 * these primitives today.
 */
const ScopedPortalContext = React.createContext<HTMLElement | null>(null);

export function ScopedPortalProvider({
  container,
  children,
}: {
  container: HTMLElement | null;
  children: React.ReactNode;
}) {
  return (
    <ScopedPortalContext.Provider value={container}>
      {children}
    </ScopedPortalContext.Provider>
  );
}

export function useScopedPortalContainer(): HTMLElement | undefined {
  return React.useContext(ScopedPortalContext) ?? undefined;
}
