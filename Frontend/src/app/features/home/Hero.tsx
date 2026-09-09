import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { Link } from "react-router";
import { Magnetic, MaskReveal, Eyebrow } from "../../components/primitives";
import { useLang } from "../../providers/LanguageProvider";
import { useContactUs } from "../../lib/siteContent";

/* SIGNATURE MOMENT 02 — HERO
   Low-angle black vehicle in a deep architectural workshop. Scroll reveals
   more, the background drifts at a slower depth, the car answers the
   pointer, headline lines wipe up behind masks, the CTA arrow is magnetic.
   No cards, stats, or badges.

   Every visible piece of content here — the vehicle image, both headline
   lines, the supporting copy, and the location line — is CMS-driven
   (GeneralInformation / ContactUs). There is deliberately no hardcoded
   fallback copy: when the backend has nothing yet, headline/copy simply do
   not render. The background image is the one exception — FALLBACK_HERO_IMAGE
   (a local asset, public/hero-fallback.jpg) stands in for it until an admin
   uploads GeneralInformation.hero_img in the Dashboard, so the section is
   never left solid black. */

const FALLBACK_HERO_IMAGE = "/hero-fallback.jpg";

type Bilingual = { ar: string; en: string };

type HeroProps = {
  /** CMS-editable content (Dashboard Homepage editor, figma-spec.md §6.5).
   *  Undefined until GeneralInformation loads — nothing renders in the
   *  meantime, there is no placeholder copy. */
  headlinePrimary?: Bilingual;
  headlineSecondary?: Bilingual;
  supportingCopy?: Bilingual;
  /** Real backend-hosted image URL (GeneralInformation.hero_img). Falls
   *  back to FALLBACK_HERO_IMAGE (a local asset) when absent, so the
   *  section always shows a photo instead of solid black. */
  backgroundImageUrl?: string;
};

export function Hero({
  headlinePrimary,
  headlineSecondary,
  supportingCopy,
  backgroundImageUrl,
}: HeroProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { t, isAr } = useLang();
  const heroImageUrl = backgroundImageUrl ?? FALLBACK_HERO_IMAGE;
  const reducedMotion = useReducedMotion();
  const scrollAnimRef = useRef<number | null>(null);
  const contact = useContactUs();
  const addressAr = contact?.address_ar;
  const addressEn = contact?.address;

  const [isNarrow, setIsNarrow] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 700px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 700px)");
    const onChange = () => setIsNarrow(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const primaryRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = primaryRef.current;
    if (!el || !headlinePrimary) return;
    const MIN = isNarrow ? 20 : 16;
    const CLAMP_MIN = isAr ? 40 : 48;
    const CLAMP_MAX = isAr ? 90 : 64;
    const CLAMP_VW = isAr ? 2.6 : 3.8;
    const LINE_HEIGHT = isAr ? 1.5 : 1.12;
    const MAX_LINES = isNarrow ? 3 : 1;

    const apply = (size: number) => {
      el.style.setProperty("font-size", `${size}px`, "important");
      el.style.setProperty("line-height", String(LINE_HEIGHT), "important");
    };

    const fit = () => {
      let size = Math.min(
        CLAMP_MAX,
        Math.max(CLAMP_MIN, (CLAMP_VW * window.innerWidth) / 100),
      );
      apply(size);
      const overflows = (current: number) =>
        MAX_LINES === 1
          ? el.scrollWidth > el.clientWidth + 1
          : el.scrollHeight > current * LINE_HEIGHT * MAX_LINES + 2;
      while (size > MIN && overflows(size)) {
        size -= 1;
        apply(size);
      }
    };

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [headlinePrimary?.ar, headlinePrimary?.en, t, isAr, isNarrow]);

  const secondaryRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = secondaryRef.current;
    if (!el || !headlineSecondary) return;
    const MIN = 20;
    const CLAMP_MIN = isAr ? 45 : 56;
    const CLAMP_MAX = isAr ? 90 : 76;
    const CLAMP_VW = isAr ? 3.2 : 4.5;
    const LINE_HEIGHT = isAr ? 1.5 : 1.1;
    const MAX_LINES = 2;

    const fit = () => {
      let size = Math.min(
        CLAMP_MAX,
        Math.max(CLAMP_MIN, (CLAMP_VW * window.innerWidth) / 100),
      );
      el.style.setProperty("font-size", `${size}px`, "important");
      el.style.setProperty("line-height", String(LINE_HEIGHT), "important");
      const maxHeight = size * LINE_HEIGHT * MAX_LINES + 2;
      while (size > MIN && el.scrollHeight > maxHeight) {
        size -= 1;
        el.style.setProperty("font-size", `${size}px`, "important");
      }
    };

    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [headlineSecondary?.ar, headlineSecondary?.en, t, isAr]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const carScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.22]);
  const carY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const carX = useSpring(useTransform(mx, [-0.5, 0.5], [22, -22]), {
    stiffness: 60,
    damping: 18,
  });
  const carTilt = useSpring(useTransform(mx, [-0.5, 0.5], [-2, 2]), {
    stiffness: 60,
    damping: 18,
  });
  const glareX = useSpring(useTransform(mx, [-0.5, 0.5], ["20%", "80%"]), {
    stiffness: 50,
    damping: 20,
  });

  const [ready] = useState(true);

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  useEffect(() => {
    const cancel = () => {
      if (scrollAnimRef.current !== null) {
        cancelAnimationFrame(scrollAnimRef.current);
        scrollAnimRef.current = null;
      }
    };
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchstart", cancel, { passive: true });
    window.addEventListener("keydown", cancel, { passive: true });
    return () => {
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      window.removeEventListener("keydown", cancel);
    };
  }, []);

  const scrollToServices = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return;
    const target = document.getElementById("services");
    if (!target) return;
    e.preventDefault();

    const startY = window.scrollY;
    const endY = startY + target.getBoundingClientRect().top;

    if (reducedMotion) {
      window.scrollTo({ top: endY, behavior: "instant" as ScrollBehavior });
      return;
    }

    const distance = endY - startY;
    const duration = 4500;
    const startTime = performance.now();
    const linear = (p: number) => p;

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      window.scrollTo({
        top: startY + distance * linear(progress),
        behavior: "instant" as ScrollBehavior,
      });
      scrollAnimRef.current = progress < 1 ? requestAnimationFrame(step) : null;
    };
    scrollAnimRef.current = requestAnimationFrame(step);
  };

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      className="relative h-[160vh] bg-[#060708]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden cinematic-grain vignette">
        {/* The CMS-provided hero image, or FALLBACK_HERO_IMAGE until an
            admin uploads one in the Dashboard — never solid black. */}
        <motion.div
          className="absolute inset-0"
          style={{ scale: carScale, y: carY, x: carX, rotate: carTilt }}
          initial={{ opacity: 0, y: 60 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src={heroImageUrl}
            alt=""
            loading="eager"
            fetchpriority="high"
            decoding="async"
            className="h-full w-full object-cover"
            style={{
              filter: "brightness(0.6) contrast(1.14)",
              objectPosition: "center 42%",
            }}
          />
          {/* Independent moving reflection over the image */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.10) 50%, transparent 60%)",
              backgroundSize: "200% 100%",
              backgroundPositionX: glareX,
            }}
          />
        </motion.div>

        {/* Atmospheric ceiling light pools */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 45% at 50% 8%, rgba(188,172,134,0.14), transparent 72%)",
          }}
        />

        {/* Seamless tonal blend — a single continuous darkness, no hard band.
            Top: subtle shade for header legibility. Bottom: deep sink for copy. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#060708] via-[#060708]/45 via-40% to-[#060708]/55" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#060708]/70 to-transparent" />

        {/* Typography — asymmetric, pinned to the right (RTL) */}
        <motion.div
          className="hero-gutter relative z-20 flex h-full flex-col justify-center"
          style={{ y: copyY, opacity: copyOpacity }}
        >
          <MaskReveal delay={0.4}>
            <Eyebrow>ركن الصروح — منذ 1989</Eyebrow>
          </MaskReveal>

          {(headlinePrimary || headlineSecondary) && (
            <div className="mt-6">
              {headlinePrimary && (
                <MaskReveal delay={0.6} duration={1.2}>
                  <span
                    ref={primaryRef}
                    className="hero-title-primary font-display block max-w-[1400px] text-[var(--sorouh-ivory)]"
                    style={{
                      fontSize: "clamp(40px, 2.6vw, 90px)",
                      fontWeight: 700,
                      lineHeight: 1.5,
                      paddingBottom: "0.08em",
                      whiteSpace: isNarrow ? "normal" : "nowrap",
                      overflow: isNarrow ? "visible" : "hidden",
                    }}
                  >
                    {t(headlinePrimary.ar, headlinePrimary.en)}
                  </span>
                </MaskReveal>
              )}
              {headlineSecondary && (
                <MaskReveal delay={1.1} duration={1.2}>
                  <span
                    ref={secondaryRef}
                    className="hero-title-secondary font-display block max-w-[1400px] text-[var(--sorouh-bronze)]"
                    style={{
                      fontSize: "clamp(45px, 3.2vw, 90px)",
                      fontWeight: 700,
                      lineHeight: 1.5,
                      paddingBottom: "0.08em",
                    }}
                  >
                    {t(headlineSecondary.ar, headlineSecondary.en)}
                  </span>
                </MaskReveal>
              )}
            </div>
          )}

          {supportingCopy && (
            <motion.p
              className="hero-copy mt-8 max-w-[540px] text-[var(--sorouh-steel)]"
              style={{ fontSize: 19, lineHeight: 1.9 }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.6 }}
            >
              {t(supportingCopy.ar, supportingCopy.en)}
            </motion.p>
          )}

          <motion.div
            className="mt-11 flex items-center gap-8"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.9 }}
          >
            <Magnetic strength={0.5}>
              <Link
                to="/contact"
                className="group flex items-center gap-4 bg-[var(--sorouh-bronze)] px-9 py-4 text-[#060708] transition-colors duration-300 hover:bg-[var(--sorouh-bronze-soft)]"
              >
                <span style={{ fontSize: 16, fontWeight: 500 }}>
                  {t("تواصل معنا", "Contact Us")}
                </span>
                <span className="transition-transform duration-300 group-hover:-translate-x-1.5">
                  ←
                </span>
              </Link>
            </Magnetic>

            <a
              href="#services"
              onClick={scrollToServices}
              className="group flex items-center gap-3 text-[var(--sorouh-ivory)]"
            >
              <span style={{ fontSize: 16 }}>اكتشف التجربة</span>
              <span className="block h-px w-10 origin-right bg-[var(--sorouh-bronze)] transition-transform duration-500 group-hover:scale-x-150" />
            </a>
          </motion.div>
        </motion.div>

        {/* Location + scroll cue */}
        <div className="safe-inline absolute inset-x-0 bottom-8 z-20 flex items-end justify-between">
          {addressAr || addressEn ? (
            <Eyebrow>
              {t(addressAr || addressEn || "", addressEn || addressAr || "")}
            </Eyebrow>
          ) : (
            <span />
          )}
          <motion.div
            className="flex flex-col items-center gap-2"
            animate={{ opacity: [0.9, 1, 0.65] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            <span
              className="font-mono-tech text-[var(--sorouh-steel)]"
              style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.35em" }}
            >
              SCROLL
            </span>
            <span className="block h-10 w-px bg-gradient-to-b from-[var(--sorouh-bronze)] to-transparent" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
