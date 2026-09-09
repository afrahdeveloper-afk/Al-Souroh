import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ArrowUpRight, LogOut } from "lucide-react";

import { Container } from "../components/Container";
import { cn } from "../../components/ui/utils";
import { useLang } from "../../providers/LanguageProvider";
import { useAuth } from "../providers/AuthProvider";

/**
 * The dashboard chrome for every CMS section screen (Services/Projects/News
 * list+forms, Homepage editor, Contact editor) — a persistent top nav bar,
 * not a sidebar. Confirmed directly against the Figma file: `get_metadata`
 * on the "Services List" screen (node `12:2963` "Header") shows a `ناف بار`
 * (Nav bar) frame reused identically across List/Add/Edit/Delete for every
 * CMS domain (grepped 18 occurrences of that node name across the whole
 * Dashboard page), containing 5 horizontal links plus a separate "لوحة
 * التحكم" (back-to-Dashboard-hub) link — never a collapsible side panel.
 * `figma-spec.md` §1.1/§3.2 had left "sidebar vs. top bar" as an open
 * question and the previous pass guessed sidebar; this shell replaces that
 * guess with what the design file actually draws.
 *
 * Element order matches the Figma reading order exactly: "لوحة التحكم" reads
 * FIRST (it sits at the physical-right edge in the Arabic mock, i.e. RTL's
 * reading-start), before the 5-link nav (Home → Services → Projects → News
 * → Contact). Both are built as logical-start-to-end source order so `dir`
 * mirrors them automatically — no manual left/right duplication, per this
 * codebase's established convention.
 *
 * Only Home (`DashboardHome.tsx`) has no nav bar at all (figma-spec.md
 * §3.1) and renders its own thin wordmark/"go to website" header directly,
 * bypassing this shell entirely — unchanged by this pass.
 */
const NAV_ITEMS = [
  { to: "/dashboard/homepage", ar: "الرئيسية", en: "Home" },
  { to: "/dashboard/services", ar: "الخدمات", en: "Services" },
  { to: "/dashboard/projects", ar: "مشاريع", en: "Projects" },
  { to: "/dashboard/news", ar: "اخبار ومقالات", en: "News & Articles" },
  { to: "/dashboard/contact", ar: "معلومات التواصل", en: "Contact Info" },
  { to: "/dashboard/static-images", ar: "صور الموقع", en: "Site Images" },
] as const;

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const { t } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/dashboard/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <header className=" bg-dashboard-bg">
        <Container width="comfortable">
          <div className="hide-scrollbar flex h-[var(--dashboard-row-height-nav)] items-center gap-dashboard-6 overflow-x-auto">
            <Link
              to="/dashboard"
              className="flex shrink-0 items-center gap-dashboard-2 text-dashboard-table-body text-dashboard-secondary-foreground transition-colors hover:text-dashboard-primary-hover"
            >
              {t("لوحة التحكم", "Dashboard")}
              <ArrowUpRight className="size-[17px]" aria-hidden="true" />
            </Link>

            <div className="flex items-center lg:flex-1 lg:justify-center">
              <nav className="flex shrink-0 items-center">
                {NAV_ITEMS.map((item) => {
                  const isActive = location.pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "border-b px-dashboard-3 py-dashboard-3 text-dashboard-button-sm font-bold tracking-[0.99px] transition-colors",
                        isActive
                          ? "border-dashboard-primary-hover text-dashboard-primary-hover"
                          : "border-transparent text-dashboard-faint-foreground hover:text-dashboard-foreground",
                      )}
                    >
                      {t(item.ar, item.en)}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex shrink-0 items-center gap-dashboard-2 text-dashboard-table-body text-dashboard-faint-foreground transition-colors hover:text-dashboard-error"
            >
              <LogOut className="size-4" aria-hidden="true" />
              {t("تسجيل الخروج", "Log out")}
            </button>
          </div>
        </Container>
      </header>

      <main>{children}</main>
    </div>
  );
}
