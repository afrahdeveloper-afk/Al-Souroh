import { useRef, ReactNode } from "react";
import { Link } from "react-router";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { ArrowUpRight, Compass, Target } from "lucide-react";
import { useLang } from "../providers/LanguageProvider";
import { Eyebrow, FadeUp, MaskReveal } from "../components/primitives";
import { mediaUrl, useStaticImages } from "../lib/siteContent";

/* ABOUT — v3, "The Living Timeline". Content (headline, the three story
   paragraphs, the three milestones, founder copy, the vision/mission
   statements, the eight values, and the closing CTA) is byte-identical to
   the original build in both languages — only structure and imagery
   changed, for the third time. The first two passes were rejected for the
   same underlying reason stated two different ways: v1 kept the original's
   section shapes and only swapped chrome for hairlines (a reskin); v2
   replaced that with a sequence of full-viewport cinematic scenes (a
   different reskin — still a stack of independent "moments" with no shape
   connecting them, just bigger). This pass drops the "stack of sections"
   idea entirely. Every piece of content — the founding year, the 2019
   transformation, today's institution, the founder's legacy, the vision
   and mission, the values, the gallery — now hangs off ONE continuous
   vertical spine that runs the height of the page, with a hairline that
   fills bronze as the visitor scrolls and small nodes that light up as
   each is reached. The page reads as a single unfolding record instead of
   eight unrelated scenes stitched together. The hero is deliberately a
   quiet typographic title page (no full-bleed photo, no viewport-height
   section) so the spine — not another big photograph — is the page's one
   idea. */

const timeline = [
  {
    yearAr: "1989",
    yearEn: "1989",
    ar: "بداية النشاط التجاري",
    en: "Commercial activity begins",
    arDetail:
      'بدأت الجذور في بغداد بتخصص في قطع غيار مرسيدس بنز تحت مسمى "الخير".',
    enDetail:
      'Roots began in Baghdad specializing in Mercedes-Benz spare parts under the name "Al-Khair".',
  },
  {
    yearAr: "2019",
    yearEn: "2019",
    ar: "مرحلة التطوير والتوسع",
    en: "Development & Expansion Phase",
    arDetail: "بدء تطوير الهوية، توسيع النشاط وبناء منظومة خدمات متكاملة.",
    enDetail:
      "Identity development began, activity expanded, and an integrated service system was built.",
  },
  {
    yearAr: "اليوم",
    yearEn: "Today",
    ar: "منظومة متكاملة لخدمات المركبات",
    en: "A Complete Vehicle Services Institution",
    arDetail:
      "ركن الصروح: مؤسسة متكاملة تقدم تجربة شاملة لصيانة المركبات وعنايتها وتحديثها.",
    enDetail:
      "Al-Sorouh: A complete institution offering a comprehensive vehicle maintenance, care, and upgrade experience.",
  },
];

const storyParagraphs = {
  ar: [
    'بدأت القصة عام 1989 في بغداد بنشاط تجاري متخصص في قطع غيار مرسيدس بنز تحت مسمى "الخير"، وكانت الانطلاقة من رؤية واضحة: تقديم قطع أصلية بجودة موثوقة في سوق كان يفتقر إلى التنظيم.',
    "مع مرور السنوات، نمت التجربة وتراكمت الخبرة الميدانية، حتى جاءت مرحلة التحول عام 2019 بقيادة مصطفى شربه، لتبدأ رحلة بناء هوية جديدة: ركن الصروح لخدمات المركبات.",
    "اليوم، ركن الصروح ليست مجرد ورشة صيانة — بل منظومة متكاملة تجمع الفحص، الصيانة، الإصلاح، العناية والتحديث، مع نظام عمل واضح يعتمد على التوثيق والشفافية وضمان الجودة.",
  ],
  en: [
    'The story began in 1989 in Baghdad with a commercial activity specializing in Mercedes-Benz spare parts under the name "Al-Khair", launched with a clear vision: providing original parts with reliable quality in a market that lacked organization.',
    "Over the years, experience and field expertise grew, until the transformation phase began in 2019 under Mustafa Sharba's leadership, starting a journey to build a new identity: Al-Sorouh Vehicle Services.",
    "Today, Al-Sorouh is not just a maintenance workshop — it's a complete system combining inspection, maintenance, repair, care, and upgrades, with a clear operational system based on documentation, transparency, and quality assurance.",
  ],
};

const values = [
  { ar: "الشفافية", en: "Transparency" },
  { ar: "المصداقية", en: "Credibility" },
  { ar: "الوضوح", en: "Clarity" },
  { ar: "النظام", en: "Organization" },
  { ar: "النزاهة", en: "Integrity" },
  { ar: "احترام العميل", en: "Client Respect" },
  { ar: "احترام اليد العاملة", en: "Workforce Respect" },
  { ar: "الالتزام بالجودة", en: "Quality Commitment" },
];

function FieldLabel({ children, isAr }: { children: string; isAr: boolean }) {
  return (
    <p
      className={`text-[var(--sorouh-bronze)] ${isAr ? "font-body" : "font-mono-tech uppercase"}`}
      style={{
        fontSize: 12.5,
        fontWeight: 600,
        letterSpacing: isAr ? 0 : "0.08em",
      }}
    >
      {children}
    </p>
  );
}

/* ============================================================
   TITLE PAGE — a quiet typographic opening. No full-bleed photo, no
   viewport-height section: this page's one big idea is the spine below,
   not another cinematic hero.
   ============================================================ */

function TitlePage() {
  const { t } = useLang();
  return (
    <section className="page-gutter pb-16 pt-28 lg:pb-24 lg:pt-36">
      <div className="grid gap-12 lg:grid-cols-[1fr_320px] lg:items-center lg:gap-16">
        <div>
          <MaskReveal>
            <Eyebrow>{t("من نحن", "About Us")}</Eyebrow>
          </MaskReveal>
          <div className="mt-6">
            <MaskReveal duration={1.2} delay={0.1}>
              <h1
                className="font-display block max-w-[720px] text-[var(--sorouh-ivory)]"
                style={{
                  fontSize: "clamp(34px,4.8vw,62px)",
                  fontWeight: 800,
                  lineHeight: 1.2,
                  paddingBottom: "0.08em",
                }}
              >
                {t(
                  "إرث من الخبرة، ورؤية لمستقبل خدمات المركبات",
                  "A Legacy of Experience, and a Vision for the Future of Vehicle Services",
                )}
              </h1>
            </MaskReveal>
          </div>
          <FadeUp delay={0.25}>
            <p
              className="mt-6 max-w-[520px] text-[var(--sorouh-steel)]"
              style={{ fontSize: 16, lineHeight: 1.9, fontWeight: 500 }}
            >
              {t(
                "بدأت الجذور عام 1989، وتطورت اليوم إلى مؤسسة متكاملة تسعى لبناء نموذج عراقي حديث في صيانة المركبات والعناية بها.",
                "Roots dating back to 1989, now evolved into a complete institution building a modern Iraqi model in vehicle maintenance and care.",
              )}
            </p>
          </FadeUp>
        </div>

        <FadeUp
          delay={0.15}
          className="hidden lg:flex lg:items-center lg:justify-center"
        >
          <img
            src="/alsorouh-icon.svg"
            alt=""
            aria-hidden="true"
            className="h-auto w-full opacity-95"
            style={{ maxWidth: 200 }}
          />
        </FadeUp>
      </div>
    </section>
  );
}

/* ============================================================
   SPINE — one continuous vertical hairline running the height of the
   narrative, filling bronze as the visitor scrolls; every chapter (the
   founding year, 2019, today, the founder's legacy, vision & mission, the
   values, the gallery) is a node hanging off it.
   ============================================================ */

function SpineNode({
  index,
  kicker,
  kickerIsYear,
  heading,
  children,
}: {
  index: number;
  kicker: string;
  kickerIsYear: boolean;
  heading?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="relative grid gap-x-6 lg:gap-x-10"
      style={{ gridTemplateColumns: "20px 1fr" }}
    >
      <div className="relative flex justify-center pt-2">
        <motion.span
          aria-hidden
          className="relative z-10 block h-2.5 w-2.5 rounded-full border border-[var(--sorouh-bronze)]"
          initial={{ scale: 0.5 }}
          whileInView={{ scale: 1, backgroundColor: "var(--sorouh-bronze)" }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="relative pb-16 lg:pb-20">
        <FadeUp amount={0.3} className="relative z-10">
          <div className="flex items-baseline gap-3">
            <span
              dir={kickerIsYear ? "ltr" : undefined}
              className={`font-display shrink-0 text-[var(--sorouh-bronze)] ${kickerIsYear ? "tabular-latin" : ""}`}
              style={{
                fontSize: kickerIsYear ? "clamp(44px,5.2vw,68px)" : 16,
                fontWeight: kickerIsYear ? 800 : 600,
                letterSpacing: kickerIsYear ? 0 : "0.04em",
              }}
            >
              {kicker}
            </span>
            {index !== undefined && (
              <span
                dir="ltr"
                className="tabular-latin font-mono-tech text-[var(--sorouh-line-strong)]"
                style={{ fontSize: 11.5 }}
              >
                0{index}
              </span>
            )}
          </div>
          {heading && (
            <h3
              className="font-display mt-3 max-w-lg text-[var(--sorouh-ivory)]"
              style={{
                fontSize: "clamp(29px,3.2vw,40px)",
                fontWeight: 700,
                lineHeight: 1.3,
              }}
            >
              {heading}
            </h3>
          )}
          <div className="mt-4 max-w-[40rem]">{children}</div>
        </FadeUp>
      </div>
    </div>
  );
}

/* ============================================================
   TIMELINE BLUEPRINT — the side opposite the spine's prose fills with a
   line-art sedan that assembles itself, part by part, over the FULL
   length of the spine (1989 down through Inside the Center) — not just
   the three history nodes. It shares the exact scrollYProgress already
   driving the bronze spine-line fill, so the car's completion and the
   line's completion land together: reach the end of the story, the car
   is finished. Seven build stages, evenly spaced across that progress —
   foundation, body shell, wheels, glass/mirrors, lighting/grille, bronze
   trim/badge, gloss finish — each still using the `pathLength` draw-in
   technique from Warranty & Trust's ring, but continuous rather than a
   one-shot whileInView, so it plays forward and back with the reader.
   ============================================================ */

const CAR_BODY_PATH =
  "M60,195 L60,172 C60,156 74,159 90,159 C106,133 140,78 195,69 C224,64 280,64 310,69 C360,78 388,128 408,159 C424,159 440,156 440,172 L440,195 Z";

const wheelSpokes = (cx: number, cy: number, r: number) =>
  Array.from({ length: 5 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    return { x2: cx + r * Math.cos(angle), y2: cy + r * Math.sin(angle) };
  });

function TimelineBlueprint({
  scrollYProgress,
  reduceMotion,
}: {
  scrollYProgress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const foundation = useTransform(scrollYProgress, [0.02, 0.13], [0, 1]);
  const body = useTransform(scrollYProgress, [0.15, 0.28], [0, 1]);
  const wheels = useTransform(scrollYProgress, [0.3, 0.43], [0, 1]);
  const glass = useTransform(scrollYProgress, [0.45, 0.57], [0, 1]);
  const lighting = useTransform(scrollYProgress, [0.59, 0.71], [0, 1]);
  const trim = useTransform(scrollYProgress, [0.73, 0.84], [0, 1]);
  const finish = useTransform(scrollYProgress, [0.86, 0.97], [0, 1]);
  const strokeColor = useTransform(
    scrollYProgress,
    [0.71, 0.9],
    ["var(--sorouh-line-strong)", "var(--sorouh-bronze)"],
  );
  const shadowOpacity = useTransform(finish, [0, 1], [0.04, 0.16]);

  const staticProps = { pathLength: 1 };
  const p = (v: MotionValue<number>) =>
    reduceMotion ? staticProps : { pathLength: v };
  const o = (v: MotionValue<number>) =>
    reduceMotion ? { opacity: 1 } : { opacity: v };

  const frontHub = wheelSpokes(155, 195, 13);
  const rearHub = wheelSpokes(345, 195, 13);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden min-[1440px]:block"
    >
      <div
        className="absolute top-0 bottom-0"
        style={{ insetInlineEnd: 0, width: "clamp(460px,38vw,760px)" }}
      >
        <div className="min-[1440px]:sticky min-[1440px]:top-32">
          <svg
            viewBox="0 0 480 220"
            width="100%"
            style={{ overflow: "visible" }}
          >
            <defs>
              <linearGradient
                id="aboutGloss"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor="var(--sorouh-bronze)"
                  stopOpacity="0.4"
                />
                <stop
                  offset="100%"
                  stopColor="var(--sorouh-bronze)"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            {/* stage 1 — foundation */}
            <motion.line
              x1="20"
              y1="205"
              x2="460"
              y2="205"
              stroke="var(--sorouh-line)"
              strokeWidth="1"
              style={p(foundation)}
            />
            <motion.line
              x1="60"
              y1="195"
              x2="60"
              y2="205"
              stroke="var(--sorouh-line-strong)"
              strokeWidth="1.25"
              style={p(foundation)}
            />
            <motion.line
              x1="440"
              y1="195"
              x2="440"
              y2="205"
              stroke="var(--sorouh-line-strong)"
              strokeWidth="1.25"
              style={p(foundation)}
            />

            {/* stage 2 — body shell */}
            <motion.path
              d={CAR_BODY_PATH}
              fill="none"
              stroke={reduceMotion ? "var(--sorouh-bronze)" : strokeColor}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={p(body)}
            />

            {/* stage 3 — wheels */}
            <motion.circle
              cx="155"
              cy="195"
              r="32"
              fill="none"
              stroke="var(--sorouh-line-strong)"
              strokeWidth="1.5"
              style={p(wheels)}
            />
            <motion.circle
              cx="155"
              cy="195"
              r="13"
              fill="none"
              stroke="var(--sorouh-line-strong)"
              strokeWidth="1.1"
              style={p(wheels)}
            />
            {frontHub.map((s, i) => (
              <motion.line
                key={`fh${i}`}
                x1="155"
                y1="195"
                x2={s.x2}
                y2={s.y2}
                stroke="var(--sorouh-line-strong)"
                strokeWidth="1"
                style={p(wheels)}
              />
            ))}
            <motion.circle
              cx="345"
              cy="195"
              r="32"
              fill="none"
              stroke="var(--sorouh-line-strong)"
              strokeWidth="1.5"
              style={p(wheels)}
            />
            <motion.circle
              cx="345"
              cy="195"
              r="13"
              fill="none"
              stroke="var(--sorouh-line-strong)"
              strokeWidth="1.1"
              style={p(wheels)}
            />
            {rearHub.map((s, i) => (
              <motion.line
                key={`rh${i}`}
                x1="345"
                y1="195"
                x2={s.x2}
                y2={s.y2}
                stroke="var(--sorouh-line-strong)"
                strokeWidth="1"
                style={p(wheels)}
              />
            ))}

            {/* stage 4 — glass, pillars, mirror */}
            <motion.line
              x1="100"
              y1="159"
              x2="400"
              y2="159"
              stroke="var(--sorouh-line-strong)"
              strokeWidth="1"
              style={p(glass)}
            />
            <motion.line
              x1="252"
              y1="69"
              x2="252"
              y2="159"
              stroke="var(--sorouh-line-strong)"
              strokeWidth="1.1"
              style={p(glass)}
            />
            <motion.path
              d="M140,138 L155,130 L156,140 Z"
              fill="var(--sorouh-line-strong)"
              style={o(glass)}
            />
            <motion.line
              x1="252"
              y1="159"
              x2="252"
              y2="185"
              stroke="var(--sorouh-line-strong)"
              strokeWidth="1"
              style={p(glass)}
            />
            <motion.line
              x1="290"
              y1="170"
              x2="306"
              y2="170"
              stroke="var(--sorouh-line-strong)"
              strokeWidth="1.1"
              style={p(glass)}
            />

            {/* stage 5 — lighting + grille */}
            <motion.ellipse
              cx="82"
              cy="175"
              rx="10"
              ry="6"
              fill="none"
              stroke="var(--sorouh-line-strong)"
              strokeWidth="1.1"
              style={p(lighting)}
            />
            <motion.ellipse
              cx="418"
              cy="175"
              rx="10"
              ry="6"
              fill="none"
              stroke="var(--sorouh-line-strong)"
              strokeWidth="1.1"
              style={p(lighting)}
            />
            <motion.line
              x1="75"
              y1="178"
              x2="75"
              y2="192"
              stroke="var(--sorouh-line-strong)"
              strokeWidth="1"
              style={p(lighting)}
            />
            <motion.line
              x1="82"
              y1="178"
              x2="82"
              y2="192"
              stroke="var(--sorouh-line-strong)"
              strokeWidth="1"
              style={p(lighting)}
            />
            <motion.line
              x1="89"
              y1="178"
              x2="89"
              y2="192"
              stroke="var(--sorouh-line-strong)"
              strokeWidth="1"
              style={p(lighting)}
            />

            {/* stage 6 — bronze trim + badge */}
            <motion.line
              x1="100"
              y1="148"
              x2="400"
              y2="148"
              stroke="var(--sorouh-bronze)"
              strokeWidth="1.25"
              style={{ ...p(trim), ...o(trim) }}
            />
            <motion.circle
              cx="110"
              cy="163"
              r="4"
              fill="var(--sorouh-bronze)"
              style={o(trim)}
            />

            {/* stage 7 — gloss finish */}
            <motion.polygon
              points="195,69 310,69 298,102 178,102"
              fill="url(#aboutGloss)"
              style={o(finish)}
            />
            <motion.ellipse
              cx="250"
              cy="212"
              rx="215"
              ry="5"
              fill="var(--sorouh-bronze)"
              style={{ opacity: reduceMotion ? 0.16 : shadowOpacity }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Spine() {
  const ref = useRef<HTMLDivElement>(null);
  const { t, isAr } = useLang();
  const aboutImages = useStaticImages("about-us");
  const legacyImage = mediaUrl(aboutImages?.main_image);
  const galleryImages = [
    aboutImages?.center_image_first,
    aboutImages?.center_image_second,
    aboutImages?.center_image_third,
    aboutImages?.center_image_fourth,
  ];
  const reduceMotion = !!useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end 0.4"],
  });
  const lineScale = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [1, 1] : [0, 1],
  );
  const story = isAr ? storyParagraphs.ar : storyParagraphs.en;

  return (
    <section className="page-gutter pb-8">
      {/*
      i dont need this 
      <FadeUp>
        <Eyebrow>{t('القصة', 'The Story')}</Eyebrow>
        <h2
          className="font-display mt-5 max-w-xl text-[var(--sorouh-ivory)]"
          style={{ fontSize: 'clamp(30px,3.6vw,50px)', fontWeight: 700, lineHeight: 1.2 }}
        >
          {t('من بغداد إلى منظومة متكاملة', 'From Baghdad to a Complete System')}
        </h2>
      </FadeUp> */}
      <FadeUp
        delay={0.08}
        className="mt-10 border-t border-[var(--sorouh-line)] pt-8"
      >
        <FieldLabel isAr={isAr}>
          {t("محطات على طريق التطوير", "Milestones on the Path of Development")}
        </FieldLabel>
      </FadeUp>

      <div ref={ref} className="relative mt-6">
        <div
          className="absolute w-px bg-[var(--sorouh-line)]"
          style={{ insetInlineStart: 9.5, top: 8, bottom: 8 }}
        />
        <motion.div
          className="absolute w-px bg-[var(--sorouh-bronze)]"
          style={{
            insetInlineStart: 9.5,
            top: 8,
            bottom: 8,
            scaleY: lineScale,
            transformOrigin: "top",
          }}
        />

        <TimelineBlueprint
          scrollYProgress={scrollYProgress}
          reduceMotion={reduceMotion}
        />

        <SpineNode
          index={1}
          kicker={isAr ? timeline[0].yearAr : timeline[0].yearEn}
          kickerIsYear
          heading={isAr ? timeline[0].ar : timeline[0].en}
        >
          <p
            className="text-[var(--sorouh-steel)]"
            style={{ fontSize: 18.5, lineHeight: 1.65, fontWeight: 500 }}
          >
            {isAr ? timeline[0].arDetail : timeline[0].enDetail}
          </p>
          <p
            className="mt-4 text-[var(--sorouh-steel)]"
            style={{ fontSize: 18.5, lineHeight: 1.65, fontWeight: 500 }}
          >
            {story[0]}
          </p>
        </SpineNode>

        <SpineNode
          index={2}
          kicker={isAr ? timeline[1].yearAr : timeline[1].yearEn}
          kickerIsYear
          heading={isAr ? timeline[1].ar : timeline[1].en}
        >
          <p
            className="text-[var(--sorouh-steel)]"
            style={{ fontSize: 18.5, lineHeight: 1.65, fontWeight: 500 }}
          >
            {isAr ? timeline[1].arDetail : timeline[1].enDetail}
          </p>
          <p
            className="mt-4 text-[var(--sorouh-steel)]"
            style={{ fontSize: 18.5, lineHeight: 1.65, fontWeight: 500 }}
          >
            {story[1]}
          </p>
        </SpineNode>

        <SpineNode
          index={3}
          kicker={isAr ? timeline[2].yearAr : timeline[2].yearEn}
          kickerIsYear
          heading={isAr ? timeline[2].ar : timeline[2].en}
        >
          <p
            className="text-[var(--sorouh-steel)]"
            style={{ fontSize: 18.5, lineHeight: 1.65, fontWeight: 500 }}
          >
            {isAr ? timeline[2].arDetail : timeline[2].enDetail}
          </p>
          <p
            className="mt-4 text-[var(--sorouh-steel)]"
            style={{ fontSize: 18.5, lineHeight: 1.65, fontWeight: 500 }}
          >
            {story[2]}
          </p>
        </SpineNode>

        <SpineNode
          index={4}
          kicker={t("الإرث والهوية", "Legacy & Identity")}
          kickerIsYear={false}
          heading={t(
            "من مرسيدس بنز إلى خدمات متكاملة",
            "From Mercedes-Benz to Complete Services",
          )}
        >
          <div className="grid gap-6 sm:grid-cols-[190px_1fr] sm:items-start">
            <div
              className="relative overflow-hidden border border-[var(--sorouh-line)]"
              style={{ aspectRatio: "1/1" }}
            >
              {legacyImage && (
                <img
                  src={legacyImage}
                  sizes="190px"
                  alt={t("فريق ركن الصروح", "The Al-Sorouh team")}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                  style={{ filter: "brightness(0.82)" }}
                />
              )}
            </div>
            <div
              className="space-y-4 text-[var(--sorouh-steel)]"
              style={{ fontSize: 18.5, lineHeight: 1.65, fontWeight: 500 }}
            >
              <p>
                {t(
                  "أرسى المرحوم حسين الشربه قواعد النشاط التجاري في الثمانينيات بروح العمل الدقيق والأمانة في التعامل، وهي قيم لا تزال تشكّل هوية ركن الصروح حتى اليوم.",
                  "The late Hussein Al-Sharba established the commercial activity foundations in the eighties with a spirit of precise work and honest dealings — values that continue to shape Al-Sorouh's identity today.",
                )}
              </p>
              <p>
                {t(
                  "واصل مصطفى شربه هذا الإرث وطوّره، بانياً عليه رؤية معاصرة تجمع الخبرة التراكمية مع المعايير التقنية الحديثة في صناعة خدمات المركبات.",
                  "Mustafa Sharba continued and developed this legacy, building upon it a contemporary vision that combines accumulated expertise with modern technical standards in the vehicle services industry.",
                )}
              </p>
            </div>
          </div>
        </SpineNode>

        <SpineNode
          index={5}
          kicker={t("رؤيتنا ورسالتنا", "Vision & Mission")}
          kickerIsYear={false}
        >
          <div className="space-y-7">
            <div>
              <div className="flex items-center gap-2.5">
                <Compass
                  size={16}
                  strokeWidth={1.5}
                  className="text-[var(--sorouh-bronze)]"
                />
                <FieldLabel isAr={isAr}>{t("الرؤية", "Vision")}</FieldLabel>
              </div>
              <p
                className="mt-3 text-[var(--sorouh-ivory)]"
                style={{ fontSize: 18.5, lineHeight: 1.7, fontWeight: 500 }}
              >
                {t(
                  "أن تكون ركن الصروح مؤسسة عراقية رائدة في قطاع خدمات المركبات، تقدم تجربة متكاملة بجودة عالية ونظام إداري وفني واضح.",
                  "For Al-Sorouh to be a leading Iraqi institution in the vehicle services sector, delivering a complete experience with high quality and a clear administrative and technical system.",
                )}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <Target
                  size={16}
                  strokeWidth={1.5}
                  className="text-[var(--sorouh-bronze)]"
                />
                <FieldLabel isAr={isAr}>{t("الرسالة", "Mission")}</FieldLabel>
              </div>
              <p
                className="mt-3 text-[var(--sorouh-ivory)]"
                style={{ fontSize: 18.5, lineHeight: 1.7, fontWeight: 500 }}
              >
                {t(
                  "تقديم حلول شاملة وموثوقة لصيانة المركبات والعناية بها، ورفع مستوى الخدمة وتعزيز ثقة العميل بالقطاع الخاص.",
                  "Providing comprehensive and reliable vehicle maintenance and care solutions, raising service standards and enhancing client trust in the private sector.",
                )}
              </p>
            </div>
          </div>
        </SpineNode>

        <SpineNode
          index={6}
          kicker={t("قيمنا", "Our Values")}
          kickerIsYear={false}
          heading={t("ما يحكم طريقة عملنا", "What Governs How We Work")}
        >
          <div className="flex flex-wrap gap-3">
            {values.map((v, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2.5 border border-[var(--sorouh-line)] px-4 py-2.5 text-[var(--sorouh-ivory)] transition-colors duration-300 hover:border-[var(--sorouh-bronze)]/60"
                style={{ fontSize: 17, fontWeight: 500 }}
              >
                <span
                  dir="ltr"
                  className="tabular-latin font-mono-tech text-[var(--sorouh-bronze)]"
                  style={{ fontSize: 11 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {isAr ? v.ar : v.en}
              </span>
            ))}
          </div>
        </SpineNode>

        <SpineNode
          index={7}
          kicker={t("من داخل المركز", "Inside the Center")}
          kickerIsYear={false}
        >
          <div className="grid grid-cols-4 gap-3">
            {galleryImages.map((raw, i) => {
              const src = mediaUrl(raw);
              return (
                <div
                  key={i}
                  className="relative overflow-hidden border border-[var(--sorouh-line)]"
                  style={{ aspectRatio: "1/1" }}
                >
                  {src && (
                    <img
                      src={src}
                      sizes="135px"
                      alt={t("من داخل المركز", "Inside the center")}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                      style={{ filter: "brightness(0.85)" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </SpineNode>
      </div>
    </section>
  );
}

/* ============================================================
   CLOSING — a restrained sign-off marking the end of the spine, not
   another full-bleed cinematic panel.
   ============================================================ */

function ClosingCTA() {
  const { t, isAr } = useLang();
  return (
    <section className="page-gutter pb-24 pt-4 lg:pb-32">
      <div className="border-t border-[var(--sorouh-line)] pt-14 text-center lg:pt-16">
        <FadeUp>
          <h2
            className="font-display mx-auto max-w-lg text-[var(--sorouh-ivory)]"
            style={{
              fontSize: "clamp(24px,2.8vw,36px)",
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            {t(
              "هل أنت جاهز لتجربة مستوى أعلى؟",
              "Ready to Experience a Higher Standard?",
            )}
          </h2>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p
            className="mx-auto mt-4 max-w-sm text-[var(--sorouh-steel)]"
            style={{ fontSize: 15, lineHeight: 1.8 }}
          >
            {t(
              "تواصل معنا لتحديد موعدك وخدمتك.",
              "Contact us to schedule your appointment and service.",
            )}
          </p>
        </FadeUp>
        <FadeUp delay={0.18}>
          <Link
            to="/contact"
            className="group mt-8 inline-flex items-center gap-3 border border-[var(--sorouh-line-strong)] px-7 py-3.5 text-[var(--sorouh-bronze)] transition-colors duration-300 hover:bg-[var(--sorouh-bronze)] hover:text-[#060708]"
          >
            <span style={{ fontSize: 14, fontWeight: 500 }}>
              {t("تواصل معنا", "Contact Us")}
            </span>
            <ArrowUpRight
              size={16}
              className={`transition-transform duration-300 ease-out ${isAr ? "-scale-x-100 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}
            />
          </Link>
        </FadeUp>
      </div>
    </section>
  );
}

export function AboutPage() {
  return (
    <div className="inner-page">
      <TitlePage />
      <Spine />
      <ClosingCTA />
    </div>
  );
}
