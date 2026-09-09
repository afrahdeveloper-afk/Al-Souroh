import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { Link, useLocation } from "react-router";
import { useLang } from "../providers/LanguageProvider";
import { useContactUs, useGeneralInformation, useStaticImages, mediaUrl } from "../lib/siteContent";

const officialLogo = "/alsorouh-icon.svg";
const EASE = [0.16, 1, 0.3, 1] as const;
const MENU_ID = "sorouh-menu";
const FOCUSABLE = "a[href], button:not([disabled])";

type NavPreviewImageProps = HTMLMotionProps<"img"> & {
  src: string;
};

function NavPreviewImage({
  src,
  alt = "",
  className,
  style,
  ...motionProps
}: NavPreviewImageProps) {
  return (
    <motion.img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      style={style}
      {...motionProps}
    />
  );
}

export function Nav() {
  const { lang, isAr, setLang, t } = useLang();
  const location = useLocation();
  const reduced = useReducedMotion();
  const contact = useContactUs();
  const contactAddress = contact?.address ?? "";
  const contactPhone = contact?.phone_number ?? "";
  const contactEmail = contact?.email ?? "";

  const generalInfo = useGeneralInformation();
  const aboutImages = useStaticImages("about-us");
  const servicesImages = useStaticImages("services");
  const projectsImages = useStaticImages("projects");
  const newsImages = useStaticImages("news");
  const contactImages = useStaticImages("contact-us");

  const links = [
    {
      label: t("الرئيسية", "Home"),
      tag: "HOME",
      note: t("لمحة كاملة عن الصروح", "The full picture of Al-Sorouh"),
      image: mediaUrl(generalInfo?.hero_img),
      path: "/",
    },
    {
      label: t("من نحن", "About Us"),
      tag: "ATELIER",
      note: t("قصتنا منذ 1989", "Our story since 1989"),
      image: mediaUrl(aboutImages?.main_image),
      path: "/about",
    },
    {
      label: t("الخدمات", "Services"),
      tag: "SERVICES",
      note: t("كل ما نقدمه للمركبة", "Everything we do for a vehicle"),
      image: mediaUrl(servicesImages?.main_image),
      path: "/services",
    },
    {
      label: t("المشاريع", "Projects"),
      tag: "WORK",
      note: t("أعمال منجزة بالتفصيل", "Completed work, in detail"),
      image: mediaUrl(projectsImages?.main_image),
      path: "/projects",
    },
    {
      label: t("الأخبار والمقالات", "News & Articles"),
      tag: "EDITORIAL",
      note: t("أخبار ومقالات من الورشة", "Notes from the workshop"),
      image: mediaUrl(newsImages?.main_image),
      path: "/news",
    },
    {
      label: t("تواصل معنا", "Contact Us"),
      tag: "CONTACT",
      note: t("الموقع وأوقات العمل والحجز", "Location, hours, and booking"),
      image: mediaUrl(contactImages?.main_image),
      path: "/contact",
    },
  ];

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(0);
  const [logoFailed, setLogoFailed] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const preview = links[active] ?? links[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const current = links.findIndex((link) => link.path === location.pathname);
    setActive(current === -1 ? 0 : current);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      const panel = document.getElementById(MENU_ID);
      if (event.key !== "Tab" || !panel) return;
      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      (triggerRef.current ?? opener)?.focus();
    };
  }, [open]);

  const replayHomeIntro = useCallback(() => {
    window.dispatchEvent(new Event("alsorouh:replay-intro"));
    setOpen(false);
  }, []);

  const Logo = ({ menu = false }: { menu?: boolean }) =>
    logoFailed ? null : (
      <Link
        to="/"
        onClick={replayHomeIntro}
        aria-label={t("الرئيسية", "Home")}
        className={`block shrink-0 ${menu ? "w-12 md:w-14" : "w-9 md:w-11"}`}
      >
        <img
          src={officialLogo}
          alt="Al-Sorouh"
          onError={() => setLogoFailed(true)}
          className="block h-auto w-full object-contain"
        />
      </Link>
    );

  const menuLinkSize = isAr
    ? "clamp(30px, 5.2vw, 66px)"
    : "clamp(28px, 4.4vw, 54px)";

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-[9000]"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: EASE }}
      >
        <div
          dir={isAr ? "rtl" : "ltr"}
          className={`nav-gutter relative flex h-16 items-center justify-between overflow-visible md:h-[72px] lg:h-[76px] transition-all duration-500 ${scrolled || location.pathname !== "/" ? "bg-[#060708]/90 backdrop-blur-xl" : "bg-transparent"}`}
        >
          <Logo />
          {contactAddress && (
            <div
              className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 font-mono-tech tabular-latin leading-none text-[var(--sorouh-steel)] lg:block"
              style={{ fontSize: 11, letterSpacing: "0.2em" }}
            >
              {contactAddress}
            </div>
          )}
          <div className="flex min-h-10 items-center gap-4 md:gap-5">
            <div
              className="font-mono-tech flex items-center gap-2.5 leading-none text-[var(--sorouh-steel)]"
              style={{ fontSize: 12, letterSpacing: "0.1em" }}
            >
              <button
                onClick={() => setLang("ar")}
                aria-pressed={lang === "ar"}
                className={`border-b pb-1.5 transition-colors ${lang === "ar" ? "border-[var(--sorouh-bronze)] font-medium text-[var(--sorouh-ivory)]" : "border-transparent hover:text-[var(--sorouh-ivory)]"}`}
              >
                AR
              </button>
              <span className="h-3 w-px bg-[var(--sorouh-steel)]/70" />
              <button
                onClick={() => setLang("en")}
                aria-pressed={lang === "en"}
                className={`border-b pb-1.5 transition-colors ${lang === "en" ? "border-[var(--sorouh-bronze)] font-medium text-[var(--sorouh-ivory)]" : "border-transparent hover:text-[var(--sorouh-ivory)]"}`}
              >
                EN
              </button>
            </div>
            <button
              ref={triggerRef}
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls={MENU_ID}
              aria-haspopup="dialog"
              className="group flex min-h-10 items-center gap-3 leading-none"
              aria-label={t("القائمة", "Menu")}
            >
              <span
                className="text-[var(--sorouh-ivory)]"
                style={{ fontSize: 15, lineHeight: 1 }}
              >
                {t("القائمة", "Menu")}
              </span>
              <span className="flex flex-col gap-[5px]">
                <span className="block h-px w-7 bg-[var(--sorouh-ivory)] transition-all duration-300 group-hover:w-8 group-hover:bg-[var(--sorouh-bronze)]" />
                <span className="block h-px w-5 self-end bg-[var(--sorouh-ivory)] transition-all duration-300 group-hover:w-8 group-hover:bg-[var(--sorouh-bronze)]" />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id={MENU_ID}
            role="dialog"
            aria-modal="true"
            aria-label={t("قائمة التنقل", "Site navigation")}
            dir={isAr ? "rtl" : "ltr"}
            className="cinematic-grain fixed inset-0 z-[9500] flex flex-col overflow-hidden bg-[#060708]"
            initial={
              reduced ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }
            }
            animate={reduced ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
            exit={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            transition={{
              duration: reduced ? 0.2 : 0.9,
              ease: [0.7, 0, 0.2, 1],
            }}
          >
            {/* Ambient echo of the previewed destination — depth without competing
            with the type. The legible copy of this image lives in the panel. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {preview.image && (
                  <NavPreviewImage
                    key={`ambient-${preview.image}`}
                    src={preview.image}
                    className="h-full w-full object-cover"
                    style={{ filter: "brightness(0.5) saturate(0.7)" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.7, ease: EASE }}
                  />
                )}
              </AnimatePresence>
              <div
                className={`absolute inset-0 ${isAr ? "bg-gradient-to-l" : "bg-gradient-to-r"} from-[#060708] via-[#060708]/85 to-[#060708]/55`}
              />
            </div>

            <div className="page-gutter relative z-10 flex h-16 shrink-0 items-center justify-between md:h-[72px] lg:h-[76px]">
              <Logo menu />
              <button
                ref={closeRef}
                onClick={() => setOpen(false)}
                className="group flex min-h-10 items-center gap-3 leading-none"
              >
                <span
                  className="text-[var(--sorouh-ivory)]"
                  style={{ fontSize: 15, lineHeight: 1 }}
                >
                  {t("إغلاق", "Close")}
                </span>
                <span className="relative block h-4 w-4">
                  <span className="absolute left-0 top-1/2 block h-px w-4 rotate-45 bg-[var(--sorouh-ivory)] transition-colors group-hover:bg-[var(--sorouh-bronze)]" />
                  <span className="absolute left-0 top-1/2 block h-px w-4 -rotate-45 bg-[var(--sorouh-ivory)] transition-colors group-hover:bg-[var(--sorouh-bronze)]" />
                </span>
              </button>
            </div>

            {/* Two tracks: destinations at the inline start, the preview at the
            inline end. The index rail is a fixed width, so every label — Arabic
            or English, short or long — begins on one shared vertical line. */}
            <div
              className="page-gutter relative z-10 grid min-h-0 flex-1 items-center gap-x-[clamp(32px,5vw,88px)] py-[clamp(16px,3vh,40px)] lg:grid-cols-[minmax(0,1fr)_minmax(240px,32%)]"
              style={{ ["--rail" as string]: "clamp(2.25rem, 3.2vw, 3.25rem)" }}
            >
              <nav
                aria-label={t("صفحات الموقع", "Site pages")}
                className="hide-scrollbar min-h-0 min-w-0 max-h-full self-center overflow-y-auto"
              >
                <ul className="border-b border-[var(--sorouh-line)]">
                  {links.map((link, index) => {
                    const current = location.pathname === link.path;
                    const focused = active === index;
                    return (
                      <li
                        key={link.path}
                        className="overflow-hidden border-t border-[var(--sorouh-line)]"
                      >
                        <motion.div
                          initial={reduced ? { opacity: 0 } : { y: "110%" }}
                          animate={reduced ? { opacity: 1 } : { y: "0%" }}
                          transition={{
                            duration: reduced ? 0.2 : 0.75,
                            delay: reduced ? 0 : 0.18 + index * 0.06,
                            ease: EASE,
                          }}
                        >
                          <Link
                            to={link.path}
                            onClick={
                              link.path === "/" ? replayHomeIntro : undefined
                            }
                            onMouseEnter={() => setActive(index)}
                            onFocus={() => setActive(index)}
                            aria-current={current ? "page" : undefined}
                            className="group relative grid w-full items-baseline gap-x-[clamp(12px,1.6vw,24px)] py-[clamp(8px,1.3vh,18px)] [grid-template-columns:var(--rail)_minmax(0,1fr)]"
                          >
                            <span
                              aria-hidden
                              className={`absolute inset-x-0 top-0 h-px bg-[var(--sorouh-bronze)] transition-transform duration-500 ${focused ? "scale-x-100" : "scale-x-0"}`}
                              style={{
                                transformOrigin: isAr ? "right" : "left",
                              }}
                            />
                            <span
                              dir="ltr"
                              className={`font-mono-tech tabular-latin self-baseline text-start transition-colors duration-300 ${focused || current ? "text-[var(--sorouh-bronze)]" : "text-[var(--sorouh-steel)]"}`}
                              style={{ fontSize: 12, letterSpacing: "0.16em" }}
                            >
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <span
                              className={`font-display min-w-0 break-words text-start transition-colors duration-300 group-hover:text-[var(--sorouh-bronze)] ${current ? "text-[var(--sorouh-bronze)]" : "text-[var(--sorouh-ivory)]"}`}
                              style={{
                                fontSize: menuLinkSize,
                                fontWeight: 800,
                                lineHeight: 1.12,
                                paddingBottom: "0.1em",
                              }}
                            >
                              {link.label}
                            </span>
                          </Link>
                        </motion.div>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Preview panel: the tag and one-line summary that used to clutter each
              row do their real work here, captioning the destination. */}
              <motion.aside
                aria-hidden
                className="hidden min-w-0 lg:block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: reduced ? 0 : 0.5, duration: 0.7 }}
              >
                <div className="ms-auto w-fit max-w-full">
                  <div className="relative aspect-[4/5] h-[clamp(300px,52vh,560px)] max-w-full overflow-hidden border border-[var(--sorouh-line-strong)]">
                    <AnimatePresence mode="wait">
                      {preview.image && (
                        <NavPreviewImage
                          key={preview.image}
                          src={preview.image}
                          className="h-full w-full object-cover"
                          style={{ filter: "brightness(0.88) contrast(1.05)" }}
                          initial={
                            reduced ? { opacity: 0 } : { opacity: 0, scale: 1.06 }
                          }
                          animate={
                            reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }
                          }
                          exit={{ opacity: 0 }}
                          transition={{ duration: reduced ? 0 : 0.7, ease: EASE }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="mt-5 flex items-baseline justify-between gap-6 border-t border-[var(--sorouh-line)] pt-4">
                    <div className="min-w-0">
                      <span
                        lang="en"
                        dir="ltr"
                        className="font-mono-tech block text-[var(--sorouh-bronze)]"
                        style={{ fontSize: 11, letterSpacing: "0.28em" }}
                      >
                        {preview.tag}
                      </span>
                      <p
                        className="mt-2 text-[var(--sorouh-ivory)]"
                        style={{ fontSize: 14, lineHeight: 1.5 }}
                      >
                        {preview.note}
                      </p>
                    </div>
                    <span
                      dir="ltr"
                      className="font-mono-tech tabular-latin shrink-0 text-[var(--sorouh-steel)]"
                      style={{ fontSize: 11, letterSpacing: "0.16em" }}
                    >
                      {String(active + 1).padStart(2, "0")}/
                      {String(links.length).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </motion.aside>
            </div>

            <motion.div
              className="page-gutter relative z-10 flex shrink-0 flex-wrap items-end justify-between gap-x-8 gap-y-3 border-t border-[var(--sorouh-line)] pb-6 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduced ? 0 : 0.65, duration: 0.8 }}
            >
              {contactAddress && (
                <div className="text-start">
                  <span
                    className="font-mono-tech block text-[var(--sorouh-steel)]"
                    style={{ fontSize: 10, letterSpacing: "0.22em" }}
                  >
                    {t("الورشة", "ATELIER")}
                  </span>
                  <span
                    dir="ltr"
                    className="font-mono-tech tabular-latin mt-1 block text-[var(--sorouh-ivory)]"
                    style={{ fontSize: 13 }}
                  >
                    {contactAddress}
                  </span>
                </div>
              )}
              {(contactPhone || contactEmail) && (
                <div className="text-start">
                  <span
                    className="font-mono-tech block text-[var(--sorouh-steel)]"
                    style={{ fontSize: 10, letterSpacing: "0.22em" }}
                  >
                    {t("للتواصل", "CONTACT")}
                  </span>
                  <span
                    dir="ltr"
                    className="tabular-latin mt-1 block text-[var(--sorouh-ivory)]"
                    style={{ fontSize: 14 }}
                  >
                    {[contactPhone, contactEmail].filter(Boolean).join(" · ")}
                  </span>
                </div>
              )}
              <div
                className="font-mono-tech flex items-center gap-3 self-end text-[var(--sorouh-steel)]"
                style={{ fontSize: 11, letterSpacing: "0.16em" }}
              >
                <button
                  onClick={() => setLang("ar")}
                  aria-pressed={lang === "ar"}
                  className={
                    lang === "ar"
                      ? "text-[var(--sorouh-ivory)]"
                      : "hover:text-[var(--sorouh-ivory)]"
                  }
                >
                  AR
                </button>
                <span className="h-3 w-px bg-[var(--sorouh-steel)]" />
                <button
                  onClick={() => setLang("en")}
                  aria-pressed={lang === "en"}
                  className={
                    lang === "en"
                      ? "text-[var(--sorouh-ivory)]"
                      : "hover:text-[var(--sorouh-ivory)]"
                  }
                >
                  EN
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
