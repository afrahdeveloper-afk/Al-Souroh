import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import {
  Eyebrow,
  FadeUp,
  MaskReveal,
  TechLabel,
} from "../../components/primitives";
import { useLang } from "../../providers/LanguageProvider";

/* WARRANTY & TRUST — read as a technical certificate, not another cinematic reel.
   Every other homepage scene is a pinned full-bleed photograph the visitor scrolls
   through one frame at a time; this is the one section built entirely from line
   and number, in normal document flow. A segmented coverage dial (six promises,
   six arcs) sits beside a spec-sheet list — the same "six-part circuit" idea
   drawn twice, once as a ring and once as a trace, so the section reads as one
   authored diagram rather than a slideshow. */

const PROMISES = [
  { text: "تشخيص واضح قبل التنفيذ", tag: "CLARITY", icon: "clarity" },
  {
    text: "شرح تفاصيل العمل والموافقة عليها",
    tag: "APPROVAL",
    icon: "approval",
  },
  { text: "قطع غيار من مصادر موثوقة", tag: "TRUSTED PARTS", icon: "parts" },
  { text: "توثيق مراحل الصيانة", tag: "DOCUMENTED WORK", icon: "documented" },
  { text: "رقابة جودة قبل التسليم", tag: "QUALITY CONTROL", icon: "quality" },
  { text: "متابعة بعد انتهاء الخدمة", tag: "FOLLOW-UP", icon: "followup" },
] as const;

const SEGMENT_FRACTION = 0.6 / PROMISES.length;

const pathVariant = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ---- hand-drawn line icons, one per promise — no icon library, matches the
   hairline / no-fill visual language already used for TechLabel and the rails. */
function PromiseIcon({
  icon,
  className,
}: {
  icon: (typeof PROMISES)[number]["icon"];
  className?: string;
}) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (icon) {
    case "clarity":
      return (
        <svg viewBox="0 0 24 24" className={className} {...common}>
          <motion.circle cx="10" cy="10" r="6" variants={pathVariant} />
          <motion.path d="M14.6 14.6 L20 20" variants={pathVariant} />
        </svg>
      );
    case "approval":
      return (
        <svg viewBox="0 0 24 24" className={className} {...common}>
          <motion.rect
            x="5"
            y="3"
            width="14"
            height="18"
            rx="2"
            variants={pathVariant}
          />
          <motion.path d="M8.5 12.4 L11 14.9 L16 9.4" variants={pathVariant} />
        </svg>
      );
    case "parts":
      return (
        <svg viewBox="0 0 24 24" className={className} {...common}>
          <motion.path
            d="M12 2.5 L19 6.5 V15.5 L12 19.5 L5 15.5 V6.5 Z"
            variants={pathVariant}
          />
          <motion.circle cx="12" cy="11" r="2.3" variants={pathVariant} />
        </svg>
      );
    case "documented":
      return (
        <svg viewBox="0 0 24 24" className={className} {...common}>
          <motion.path
            d="M9.5 3.5 H14.5 A1 1 0 0 1 15.5 4.5 V5.5 H8.5 V4.5 A1 1 0 0 1 9.5 3.5 Z"
            variants={pathVariant}
          />
          <motion.rect
            x="5.5"
            y="5"
            width="13"
            height="16"
            rx="2"
            variants={pathVariant}
          />
          <motion.path
            d="M8.5 11 H15.5 M8.5 14.5 H15.5 M8.5 18 H12.5"
            variants={pathVariant}
          />
        </svg>
      );
    case "quality":
      return (
        <svg viewBox="0 0 24 24" className={className} {...common}>
          <motion.path
            d="M12 3 L19 6 V12.4 C19 17 16 19.8 12 21 C8 19.8 5 17 5 12.4 V6 Z"
            variants={pathVariant}
          />
          <motion.path
            d="M8.7 12.2 L11 14.5 L15.3 9.8"
            variants={pathVariant}
          />
        </svg>
      );
    case "followup":
      return (
        <svg viewBox="0 0 24 24" className={className} {...common}>
          <motion.path
            d="M19.5 12 A7.5 7.5 0 1 1 16.8 6.2"
            variants={pathVariant}
          />
          <motion.path d="M19.5 6.3 V12 H14" variants={pathVariant} />
        </svg>
      );
  }
}

/* ---- count-up used only for the two coverage numbers; instant when reduced-motion. */
function useCountUp(target: number, start: boolean, duration: number) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);
  useEffect(() => {
    if (!start || startedRef.current) return;
    startedRef.current = true;
    if (duration <= 0) {
      setValue(target);
      return;
    }
    let raf: number;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => raf && cancelAnimationFrame(raf);
  }, [start, target, duration]);
  return value;
}

/* ---- the signature element: a six-arc coverage ring with a count-up readout. */
function CoverageDial({
  hovered,
  reduceMotion,
}: {
  hovered: number | null;
  reduceMotion: boolean;
}) {
  const { t } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const years = useCountUp(5, inView, reduceMotion ? 0 : 1200);

  return (
    <div
      ref={ref}
      className="relative mx-auto aspect-square w-full max-w-[340px] shrink-0 lg:max-w-[560px]"
    >
      <svg viewBox="0 0 200 200" className="h-full w-full">
        <circle
          cx="100"
          cy="100"
          r="84"
          fill="none"
          stroke="var(--sorouh-ivory)"
          strokeOpacity={0.1}
          strokeWidth={1}
        />
        {PROMISES.map((p, i) => (
          <g
            key={p.tag}
            transform={`rotate(${-90 + i * (360 / PROMISES.length)} 100 100)`}
          >
            <motion.circle
              cx="100"
              cy="100"
              r="84"
              fill="none"
              stroke="var(--sorouh-bronze)"
              strokeWidth={hovered === i ? 4 : 2.5}
              strokeLinecap="round"
              style={{
                strokeOpacity:
                  hovered === null ? 0.68 : hovered === i ? 1 : 0.26,
                transition:
                  "stroke-opacity 300ms ease, stroke-width 300ms ease",
              }}
              variants={{
                hidden: { pathLength: 0 },
                visible: {
                  pathLength: SEGMENT_FRACTION,
                  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            />
          </g>
        ))}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <span
          className="font-mono-tech text-[var(--sorouh-bronze)] font-body"
          style={{ fontSize: 18, letterSpacing: "0.34em", fontWeight: 500 }}
        >
          {t("ضمان يصل ", "Warranty valid until")}
        </span>
        <div className="mt-3 flex items-baseline gap-2" dir="ltr">
          <span
            className="font-body text-[var(--sorouh-steel)]"
            style={{ fontSize: 15 }}
          >
            {t("سنوات", "up to")}
          </span>
          <span
            className="font-display tabular-latin text-[var(--sorouh-ivory)]"
            style={{
              fontSize: "clamp(64px,7vw,88px)",
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {years}
          </span>
          <span
            className="font-body text-[var(--sorouh-steel)]"
            style={{ fontSize: 15 }}
          >
            {t("حتى", "years")}
          </span>
        </div>
        <p
          className="mt-4 text-[var(--sorouh-steel)]"
          style={{ fontSize: 13, lineHeight: 1.6 }}
        >
          {t(
            "بدءاً من 3 أشهر بحسب نوع الخدمة",
            "From 3 months, depending on the service",
          )}
        </p>
      </div>
    </div>
  );
}

export function WarrantyTrust() {
  const { isAr, t } = useLang();
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };
  const rowVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.06,
        delayChildren: 0.15,
      },
    },
  };

  return (
    <section className="relative overflow-hidden bg-[#060708] py-12 lg:py-20">
      {/* faint blueprint grid — the section's own visual signature, no photography */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(237,233,224,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(237,233,224,0.035) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(80% 70% at 50% 40%, black, transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute h-[560px] w-[560px] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(164,148,112,0.14), transparent)",
          [isAr ? "left" : "right"]: "-8%",
          top: "18%",
        }}
      />

      <div className="page-gutter relative">
        <motion.div
          className="flex flex-col gap-10 lg:grid lg:grid-cols-[560px_1fr] lg:items-start lg:gap-x-16 lg:gap-y-8"
          initial={reduceMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <div
            className={`lg:col-start-2 lg:row-start-1 ${isAr ? "text-right" : "text-left"}`}
            dir={isAr ? "rtl" : "ltr"}
          >
            <Eyebrow>{t("ضمان الصروح", "Al-Sorouh warranty")}</Eyebrow>
            <div className="mt-4">
              <MaskReveal>
                <span
                  className="font-display block text-[var(--sorouh-ivory)]"
                  style={{
                    fontSize: isAr ? "clamp(22px,3.6vw,60px)" : "clamp(20px, calc(4.7vw - 34px), 80px)",
                    fontWeight: 800,
                    lineHeight: 1.16,
                    paddingBottom: "0.08em",
                    whiteSpace: "nowrap",
                    zoom: 1,
                    ...(isAr ? {} : { maxInlineSize: 'none' }),
                  }}
                >
                  {t(
                    "الجودة لا تنتهي عند التسليم.",
                    "Quality does not end at handover.",
                  )}
                </span>
              </MaskReveal>
            </div>
            <FadeUp delay={0.15}>
              <p
                className="mt-4 max-w-[560px] text-[var(--sorouh-steel)]"
                style={{ fontSize: "clamp(15px,1.3vw,18px)", lineHeight: 1.85 }}
              >
                {t(
                  "ضمان يبدأ من 3 أشهر وقد يصل إلى 5 سنوات، بحسب نوع الخدمة أو القطعة والجهة المصنّعة.",
                  "Warranty starts at three months and may extend to five years, depending on the service, part and manufacturer.",
                )}
              </p>
            </FadeUp>
          </div>

          <div className="lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:self-start">
            <CoverageDial hovered={hovered} reduceMotion={!!reduceMotion} />
          </div>

          <ul className="relative w-full max-w-[620px] lg:col-start-2 lg:row-start-2">
            {/* connecting trace — the ring's straight-line counterpart */}
            <span
              aria-hidden
              className="absolute top-2 bottom-2 w-px bg-[var(--sorouh-ivory)]/10"
              style={isAr ? { right: 19 } : { left: 19 }}
            />
            {PROMISES.map((p, i) => {
              const on = hovered === i;
              return (
                <motion.li
                  key={p.tag}
                  variants={rowVariants}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className="relative flex items-center gap-4 border-b border-[var(--sorouh-ivory)]/8 py-3 first:pt-0 last:border-b-0"
                >
                  <span
                    className="font-mono-tech shrink-0 transition-colors duration-300"
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.14em",
                      color: on
                        ? "var(--sorouh-bronze)"
                        : "var(--sorouh-steel)",
                      width: 20,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-300"
                    style={{
                      borderColor: on
                        ? "var(--sorouh-bronze)"
                        : "var(--sorouh-line)",
                      background: "#060708",
                      color: on
                        ? "var(--sorouh-bronze)"
                        : "var(--sorouh-steel)",
                    }}
                  >
                    <PromiseIcon icon={p.icon} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <span
                      className="font-body block"
                      style={{
                        fontSize: "clamp(16px,1.5vw,19px)",
                        fontWeight: 500,
                        lineHeight: 1.5,
                        color: "var(--sorouh-ivory)",
                      }}
                    >
                      {t(p.text, EN_PROMISE[p.tag])}
                    </span>
                    <TechLabel className="mt-1 !text-[10px] !tracking-[0.22em] !text-[var(--sorouh-steel)]">
                      {p.tag}
                    </TechLabel>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>

        <FadeUp delay={0.1} className="mt-8 lg:mt-10">
          <div
            className={`max-w-[620px] border-[var(--sorouh-bronze)] ${isAr ? "mr-auto border-r pr-6 text-right" : "ml-auto border-l pl-6 text-left"}`}
            dir={isAr ? "rtl" : "ltr"}
          >
            <p
              className="text-[var(--sorouh-steel)]"
              style={{ fontSize: 17, lineHeight: 1.85 }}
            >
              {t(
                "هدفنا ليس إنجاز الخدمة فقط، بل الحفاظ على ثقة العميل وقيمة مركبته.",
                "Our goal is not only to complete the service, but to protect the client’s confidence and vehicle value.",
              )}
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

const EN_PROMISE: Record<(typeof PROMISES)[number]["tag"], string> = {
  CLARITY: "Clear diagnosis before execution",
  APPROVAL: "Work details explained and approved",
  "TRUSTED PARTS": "Parts from trusted sources",
  "DOCUMENTED WORK": "Documented maintenance stages",
  "QUALITY CONTROL": "Quality control before handover",
  "FOLLOW-UP": "Follow-up after service completion",
};
