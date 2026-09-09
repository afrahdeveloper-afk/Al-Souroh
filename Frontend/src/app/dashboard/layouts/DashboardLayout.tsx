import { useState } from 'react';
import { Outlet } from 'react-router';

import { Toaster } from '../../components/ui/sonner';
import { ScopedPortalProvider } from '../../components/ui/scoped-portal';
import { AuthProvider } from '../providers/AuthProvider';

/**
 * Root shell for the /dashboard route tree. Deliberately renders none of the
 * public portfolio's chrome (Nav, HomeFooter) or its cinematic primitives —
 * the Dashboard has its own visual language, defined in
 * `src/styles/dashboard-theme.css` / `dashboard-components.css`.
 * `data-app="dashboard"` is the scoping hook those stylesheets key off so
 * they can retint every `components/ui/*` primitive without touching the
 * portfolio's CSS. `<Toaster />` is mounted here (not in any individual
 * page) since save/delete feedback is needed CMS-domain-wide and Figma
 * never designed a bespoke one (figma-spec.md §7) — this is the shared
 * shadcn/sonner primitive, retinted via the same token bridge.
 *
 * `ScopedPortalProvider` redirects Dialog/AlertDialog/Select/Sheet/Tooltip
 * portals to mount inside this div instead of `document.body` — without
 * it, every portaled primitive renders as a DOM sibling of this scope, not
 * a descendant, so none of the scoped CSS variables above would reach it
 * (confirmed live: a DeleteConfirmDialog rendered with the portfolio's
 * generic radius/tokens instead of the Dashboard's until this was added).
 * The callback ref triggers one extra render once the DOM node exists,
 * which is fine — portals only matter once something is actually opened.
 */
export function DashboardLayout() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div data-app="dashboard" className="dashboard-shell" ref={setContainer}>
      <ScopedPortalProvider container={container}>
        <AuthProvider>
          <Outlet />
          <Toaster position="top-center" />
        </AuthProvider>
      </ScopedPortalProvider>
    </div>
  );
}
