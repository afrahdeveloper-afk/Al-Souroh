import { Outlet } from 'react-router';
import { Nav } from './Nav';
import { HomeFooter } from './HomeFooter';

/**
 * Shell for every public-facing route: wraps the shared Nav/HomeFooter chrome
 * around whichever portfolio page is active. Kept as its own layout (rather
 * than inline in App.tsx) so it stays a clean sibling of DashboardLayout —
 * the Dashboard route tree never mounts this chrome.
 */
export function PortfolioLayout() {
  return <>
    <Nav />
    <Outlet />
    <HomeFooter />
  </>;
}
