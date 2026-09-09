import { Link } from "react-router";
import { Eyebrow } from "../components/primitives";
import { useContactUs } from "../lib/siteContent";
import { useLang } from "../providers/LanguageProvider";

const nav = [
  { ar: "الرئيسية", en: "Home", path: "/" },
  { ar: "من نحن", en: "About Us", path: "/about" },
  { ar: "الخدمات", en: "Services", path: "/services" },
  { ar: "المشاريع", en: "Projects", path: "/projects" },
  { ar: "الأخبار والمقالات", en: "News & Articles", path: "/news" },
  { ar: "تواصل معنا", en: "Contact Us", path: "/contact" },
];

export function HomeFooter() {
  const { isAr, t } = useLang();
  const contact = useContactUs();
  const address = contact ? t(contact.address_ar, contact.address) : "";
  const phone = contact?.phone_number ?? "";
  const email = contact?.email ?? "";
  const workDays = contact
    ? (t(
        contact.work_days_ar || contact.work_days,
        contact.work_days,
      ) as string)
    : "";
  const hours =
    workDays || contact?.work_hours
      ? [workDays, contact?.work_hours].filter(Boolean).join(" · ")
      : "";
  return (
    <footer className="page-gutter relative border-t border-[var(--sorouh-ivory)]/10 bg-[#060708] pb-10 pt-24 text-[var(--sorouh-ivory)]">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link
            to="/"
            className="font-display"
            style={{
              fontSize: "clamp(40px,5vw,80px)",
              fontWeight: 800,
              lineHeight: 1.14,
              paddingBottom: "0.06em",
            }}
          >
            {t("ركن الصروح", "Al-Sorouh")}
          </Link>
          <p
            className="mt-6 max-w-[420px] text-[var(--sorouh-steel)]"
            style={{ fontSize: 17, lineHeight: 1.9 }}
          >
            {isAr ? (
              "منظومة عراقية متكاملة للعناية بالمركبات الفارهة، وصيانتها واستعادتها، بخبرة تمتد منذ عام 1989."
            ) : (
              <>
                An Iraqi vehicle-care atelier for considered maintenance,
                <br />
                restoration, and protection since 1989.
              </>
            )}
          </p>
        </div>
        <div>
          <Eyebrow>{t("الصفحات", "PAGES")}</Eyebrow>
          <ul className="mt-6 flex flex-col gap-3">
            {nav.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="transition-colors hover:text-[var(--sorouh-bronze)]"
                  style={{ fontSize: 17 }}
                >
                  {isAr ? item.ar : item.en}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Eyebrow>{t("تواصل", "CONTACT")}</Eyebrow>
          <ul
            className="mt-6 flex flex-col gap-3 text-[var(--sorouh-steel)]"
            style={{ fontSize: 17 }}
          >
            {address && <li>{address}</li>}
            {phone && (
              <li dir="ltr" className={isAr ? "text-right" : "text-left"}>
                {phone}
              </li>
            )}
            {email && (
              <li dir="ltr" className={isAr ? "text-right" : "text-left"}>
                {email}
              </li>
            )}
            {hours && (
              <li
                className="pt-2 text-[var(--sorouh-steel)]"
                style={{ fontSize: 14 }}
              >
                {hours}
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-[var(--sorouh-ivory)]/10 pt-8 lg:flex-row">
        <span className="text-[var(--sorouh-muted)]" style={{ fontSize: 12 }}>
          <span className="font-mono-tech" style={{ letterSpacing: "0.2em" }}>
            © 2026 AL·SOROUH
          </span>
          {" — "}
          {t("ركن الصروح لخدمات المركبات", "Al-Sorouh Vehicle Services")}
        </span>
        <span
          className="font-mono-tech text-[var(--sorouh-muted)]"
          style={{ fontSize: 11, letterSpacing: "0.2em" }}
        >
          BAGHDAD · SINCE 1989
        </span>
      </div>
    </footer>
  );
}
