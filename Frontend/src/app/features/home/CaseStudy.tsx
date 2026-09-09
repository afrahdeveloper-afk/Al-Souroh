import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { TechLabel } from '../../components/primitives';
import { mediaUrl } from '../../lib/siteContent';
import { useLang } from '../../providers/LanguageProvider';

/* FEATURED VEHICLE TRANSFORMATION
   A full-screen case study driven entirely by scroll: the untreated vehicle →
   inspection light reveals the problem → technical markings → process →
   the finished vehicle under cinematic light. A scroll-controlled before/after,
   not a basic slider. */

const MARKERS = [
  { x: '28%', y: '44%', label: 'خدش عميق' },
  { x: '62%', y: '58%', label: 'بهتان الطلاء' },
  { x: '46%', y: '30%', label: 'انبعاج' },
];

const DATA = [
  { k: 'المركبة', v: 'BMW M8 Competition' },
  { k: 'نوع الخدمة', v: 'استعادة طلاء + حماية PPF' },
  { k: 'مدة التنفيذ', v: '6 أيام' },
  { k: 'مراحل العمل', v: 'تشخيص · تصحيح · حماية' },
  { k: 'الضمان', v: 'حتى 5 سنوات' },
];

/** Both plates are CMS-driven — `/api/static-images/home-page/`'s
 *  case_study_before_image / case_study_after_image, handed down by
 *  HomeExperience. The scroll-driven wipe, markings and glare are
 *  unchanged; only where the two photographs come from moved. */
export function CaseStudy({
  beforeImage,
  afterImage,
}: {
  beforeImage?: string;
  afterImage?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { t, isAr } = useLang();
  const beforeSrc = mediaUrl(beforeImage);
  const afterSrc = mediaUrl(afterImage);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const lightX = useTransform(scrollYProgress, [0, 0.28], ['-30%', '120%']);
  const lightOpacity = useTransform(scrollYProgress, [0, 0.05, 0.28, 0.32], [0, 1, 1, 0]);

  const markersOpacity = useTransform(scrollYProgress, [0.28, 0.36, 0.5, 0.56], [0, 1, 1, 0]);

  const revealPct = useTransform(scrollYProgress, [0.5, 0.85], [0, 100]);
  const afterClip = useTransform(revealPct, (p) => `inset(0 0 0 ${100 - p}%)`);
  const seamLeft = useTransform(revealPct, (p) => `${100 - p}%`);
  const beforeLabelOpacity = useTransform(scrollYProgress, [0.5, 0.6], [1, 0]);
  const afterLabelOpacity = useTransform(scrollYProgress, [0.5, 0.6], [0, 1]);

  const bloom = useTransform(scrollYProgress, [0.8, 1], [0, 1]);
  const dataOpacity = useTransform(scrollYProgress, [0.86, 0.96], [0, 1]);
  const dataY = useTransform(scrollYProgress, [0.86, 0.96], [40, 0]);

  const head1 = useTransform(scrollYProgress, [0.34, 0.42, 0.52, 0.58], [0, 1, 1, 0]);
  const head2 = useTransform(scrollYProgress, [0.6, 0.68], [0, 1]);

  return (
    <section ref={ref} className="relative h-[520vh] bg-[#060708]">
      <div className="sticky top-0 h-screen w-full overflow-hidden cinematic-grain">
        {/* BEFORE — untreated, dull. */}
        <div className="absolute inset-0">
          {beforeSrc && (
            <img
              src={beforeSrc}
              alt={t('المركبة قبل المعالجة', 'Vehicle before treatment')}
              decoding="async"
              className="h-full w-full object-cover"
              style={{ filter: 'brightness(0.34) grayscale(0.7) contrast(0.95)' }}
            />
          )}
          <div className="absolute inset-0 bg-[#060708]/40" />
        </div>

        {/* AFTER — restored, cinematic, wiped in by scroll */}
        <motion.div className="absolute inset-0" style={{ clipPath: afterClip }}>
          {afterSrc && (
            <img
              src={afterSrc}
              alt="المركبة بعد المعالجة"
              decoding="async"
              className="h-full w-full object-cover"
              style={{ filter: 'brightness(0.78) contrast(1.18) saturate(1.1)' }}
            />
          )}
          <motion.div
            className="absolute inset-0"
            style={{
              opacity: bloom,
              background:
                'radial-gradient(60% 50% at 50% 35%, rgba(188,172,134,0.28), transparent 70%)',
            }}
          />
          {/* wipe seam */}
          <motion.div
            className="absolute inset-y-0 right-0 w-[2px] bg-[var(--sorouh-bronze)]"
            style={{ left: seamLeft }}
          />
        </motion.div>

        {/* Inspection light */}
        <motion.div
          className="pointer-events-none absolute inset-y-0 w-[24%]"
          style={{
            left: lightX,
            opacity: lightOpacity,
            background:
              'linear-gradient(100deg, transparent, rgba(220,225,255,0.22) 45%, rgba(188,172,134,0.3) 50%, rgba(220,225,255,0.22) 55%, transparent)',
            filter: 'blur(8px)',
          }}
        />

        {/* Technical markers */}
        <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: markersOpacity }}>
          {MARKERS.map((m) => (
            <div key={m.label} className="absolute" style={{ left: m.x, top: m.y }}>
              <span className="relative block h-3 w-3">
                <span className="absolute inset-0 rounded-full border border-[var(--sorouh-bronze)]" />
                <span className="absolute left-1/2 top-1/2 h-8 w-px -translate-x-1/2 bg-[var(--sorouh-bronze)]/60" />
              </span>
              <span
                className="absolute right-5 top-0 whitespace-nowrap text-[var(--sorouh-ivory)]"
                style={{ fontSize: 12 }}
              >
                {m.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Header eyebrow */}
        <div className="absolute right-14 top-28 z-20">
          <TechLabel>CASE STUDY · 001</TechLabel>
        </div>

        {/* Scrolling headline states */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6 text-center">
          <motion.h2
            className="font-display absolute text-[var(--sorouh-ivory)]"
            style={{ opacity: head1, fontSize: isAr ? 'clamp(30px,4.2vw,72px)' : 'clamp(38px,5.5vw,92px)', fontWeight: 800, lineHeight: 1.15, paddingBottom: '0.08em' }}
          >
            النتيجة لا تبدأ من النهاية.
          </motion.h2>
          <motion.h2
            className="font-display absolute text-[var(--sorouh-bronze)]"
            style={{ opacity: head2, fontSize: isAr ? 'clamp(30px,4.2vw,72px)' : 'clamp(38px,5.5vw,92px)', fontWeight: 800, lineHeight: 1.15, paddingBottom: '0.08em' }}
          >
            تبدأ من التشخيص الصحيح.
          </motion.h2>
        </div>

        {/* Minimal project data */}
        <motion.div
          className="absolute inset-x-0 bottom-0 z-20 border-t border-[var(--sorouh-ivory)]/10 bg-[#060708]/70 backdrop-blur-md"
          style={{ opacity: dataOpacity, y: dataY }}
        >
          <div className="grid grid-cols-2 gap-y-6 px-14 py-8 lg:grid-cols-5">
            {DATA.map((d) => (
              <div key={d.k}>
                <div className="text-[var(--sorouh-muted)]" style={{ fontSize: 12 }}>
                  {d.k}
                </div>
                <div className="mt-2 text-[var(--sorouh-ivory)]" style={{ fontSize: 16 }}>
                  {d.v}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* before/after labels — each tied to the same wipe progress as its
            image, so BEFORE only shows over the untreated photo and AFTER
            only once the restored photo has wiped in. */}
        <motion.div className="absolute bottom-40 left-10 z-20" style={{ opacity: beforeLabelOpacity }}>
          <TechLabel className="!text-[var(--sorouh-steel)]">BEFORE</TechLabel>
        </motion.div>
        <motion.div className="absolute right-10 top-1/2 z-20" style={{ opacity: afterLabelOpacity }}>
          <TechLabel>AFTER</TechLabel>
        </motion.div>
      </div>
    </section>
  );
}
