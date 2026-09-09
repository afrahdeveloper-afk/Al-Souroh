import {
  FolderOpen,
  Home as HomeIcon,
  Images,
  LogOut,
  Newspaper,
  Phone,
  SlidersHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router";

import { useLang } from "../../providers/LanguageProvider";
import { Container } from "../components/Container";
import { NavCard } from "../components/NavCard";
import { useAuth } from "../providers/AuthProvider";

/**
 * Home hub (figma-spec.md §3.1/§6.1) — the Dashboard's own landing screen.
 * Deliberately has no sidebar/nav bar (§3.1: only Home lacks one) — a thin
 * header (wordmark + "go to website") above the logo block above a 5-tile
 * CMS navigation grid. Cards are pure navigation, never stats — the spec is
 * explicit that no numeric/metric content exists anywhere on this screen.
 */
const TILES = [
  {
    to: "/dashboard/homepage",
    icon: HomeIcon,
    titleAr: "الرئيسية",
    titleEn: "Home",
    description: {
      ar: "تعديل صورة البانر الرئيسية والنصوص الظاهرة في بداية الموقع",
      en: "Edit the main banner image and the texts shown at the start of the site",
    },
    span: "lg:col-span-2",
  },
  {
    to: "/dashboard/services",
    icon: SlidersHorizontal,
    titleAr: "الخدمات",
    titleEn: "Services",
    description: {
      ar: "إضافة خدمة جديدة، تعديل الخدمات الحالية، أو حذف أي خدمة من الموقع",
      en: "Add a new service, edit existing services, or delete any service from the site",
    },
    span: "lg:col-span-2",
  },
  {
    to: "/dashboard/projects",
    icon: FolderOpen,
    titleAr: "المشاريع",
    titleEn: "Projects",
    description: {
      ar: "إضافة مشروع، تعديل بيانات المشاريع، أو حذف أي مشروع بما في ذلك الصور والتفاصيل",
      en: "Add a project, edit project data, or delete any project including photos and details",
    },
    span: "lg:col-span-2",
  },
  {
    to: "/dashboard/news",
    icon: Newspaper,
    titleAr: "الأخبار والمقالات",
    titleEn: "News & Articles",
    description: {
      ar: "إضافة خبر أو مقال، تعديل المحتوى، حذف العناصر، وتحديد الخبر أو المقال المميز",
      en: "Add a news item or article, edit content, delete items, and set the featured news/article",
    },
    span: "lg:col-span-2",
  },
  {
    to: "/dashboard/contact",
    icon: Phone,
    titleAr: "معلومات التواصل",
    titleEn: "Contact Information",
    description: {
      ar: "تعديل أرقام الهاتف، البريد الإلكتروني، العنوان، وروابط حسابات التواصل الاجتماعي",
      en: "Edit phone numbers, email, address, and social-media account links",
    },
    span: "lg:col-span-2",
  },
  {
    to: "/dashboard/static-images",
    icon: Images,
    titleAr: "صور الموقع",
    titleEn: "Site Images",
    description: {
      ar: "استبدال صور الصفحات الثابتة: مشاهد الصفحة الرئيسية، معرض من نحن، وأغلفة باقي الصفحات",
      en: "Replace the pages' fixed images: the home page scenes, the About gallery, and every other page's banner",
    },
    span: "lg:col-span-2",
  },
] as const;

export function DashboardHome() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/dashboard/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <Container
        width="comfortable"
        className="flex min-h-screen flex-col py-dashboard-6"
      >
        <header className="flex items-center justify-between">
          <span
            dir="ltr"
            lang="en"
            className="text-dashboard-eyebrow-sm uppercase tracking-dashboard-wordmark text-dashboard-accent"
          >
            AL-SOROUH DASHBOARD
          </span>
          <div className="flex items-center gap-dashboard-6">
            <a
              href="/"
              className="flex items-center gap-dashboard-2 text-dashboard-table-body text-dashboard-foreground transition-colors hover:text-dashboard-primary-hover"
            >
              {t("الانتقال للموقع", "Go to the website")}
              <svg
                width={17}
                height={17}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                aria-hidden="true"
              >
                <path
                  d="M7 17 17 7M9 7h8v8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-dashboard-2 text-dashboard-table-body text-dashboard-faint-foreground transition-colors hover:text-dashboard-error"
            >
              <LogOut className="size-4" aria-hidden="true" />
              {t("تسجيل الخروج", "Log out")}
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center gap-dashboard-8 py-dashboard-16">
          <img
            src="/alsorouh-icon.svg"
            alt={t("شعار الصروح", "Al-Sorouh logo")}
            className="h-38 w-auto"
          />

          <h1
            className="text-dashboard-h1 font-dashboard-semibold text-dashboard-foreground mt-2"
            style={{ fontFamily: "var(--dashboard-font-h1)" }}
          >
            {t("لوحة تحكم الصروح", "Al-Sorouh Dashboard")}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-dashboard-4 pb-dashboard-6 lg:grid-cols-6">
          {TILES.map((tile) => (
            <NavCard
              key={tile.to}
              to={tile.to}
              icon={tile.icon}
              titleAr={tile.titleAr}
              titleEn={tile.titleEn}
              description={t(tile.description.ar, tile.description.en)}
              className={tile.span}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
