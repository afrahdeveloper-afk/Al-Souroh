import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';
import { mediaUrl } from '../../lib/siteContent';
import { useLang } from '../../providers/LanguageProvider';

/* SIGNATURE MOMENT 03 — SCROLL TRANSFORMATION
   The vehicle stays sticky while the camera pushes into abstract macro details.
   Four verbs reveal one by one, overlapping the automotive surface, closing on
   a single unifying line. One continuous move from hero into services.

   The verbs alternate right/left regardless of language (that placement is
   intentional and unchanged). Arabic reads correctly at every size; English —
   longer per word, and previously translated only through the sitewide
   dictionary rather than an explicit pair — needed its own margin/size
   treatment on the left-side (odd-index) rows so the phrase never wraps to a
   second line, hence the explicit { ar, en } pairs and isAr-aware sizing
   below instead of relying on that dictionary. */

/* Photography is CMS-driven: the four frames are
   `/api/static-images/home-page/`'s first_step_image ... fourth_step_image,
   in that order, handed down by HomeExperience. There is deliberately no
   fallback photo — until the record loads, each layer is the section's own
   black ground, exactly as it looks mid-crossfade today. */
const STEPS = [
  { ar: 'نشخّصها.', en: 'We diagnose it.', tag: 'DIAGNOSE' },
  { ar: 'نحميها.', en: 'We protect it.', tag: 'PROTECT' },
  { ar: 'نستعيدها.', en: 'We restore it.', tag: 'RESTORE' },
  { ar: 'ونعيد تعريف تفاصيلها.', en: 'We refine every detail.', tag: 'REFINE' },
];

function Layer({
  image,
  progress,
  range,
}: {
  image?: string;
  progress: MotionValue<number>;
  range: [number, number, number, number];
}) {
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const scale = useTransform(
    progress,
    [range[0], range[3]],
    [1.25, 1.05]
  );
  return (
    <motion.div className="absolute inset-0" style={{ opacity }}>
      {image && (
        <motion.img
          src={image}
          alt=""
          decoding="async"
          className="h-full w-full object-cover"
          style={{ scale, filter: 'brightness(0.5) contrast(1.2)' }}
        />
      )}
      <div className="absolute inset-0 bg-[#060708]/45" />
    </motion.div>
  );
}

export function Transformation({ images }: { images?: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const finalOpacity = useTransform(scrollYProgress, [0.82, 0.95], [0, 1]);
  const finalScale = useTransform(scrollYProgress, [0.82, 1], [1.3, 1]);

  return (
    <section ref={ref} className="relative h-[420vh] bg-[#060708]">
      <div className="sticky top-0 h-screen w-full overflow-hidden cinematic-grain">
        {/* Macro layers crossfading. The first layer is a direct hand-off
            from Hero (which is still fully visible right up to this point),
            not a crossfade from a previous layer — giving it the same 25%
            fade-in ramp as every other step left a stretch of plain black
            (both Hero's content and this layer near-invisible at once)
            before "نشخصها" ever appeared. It fades in almost immediately
            instead, so there is no dead gap at the Hero→Transformation seam. */}
        {STEPS.map((s, i) => {
          const seg = 0.82 / STEPS.length;
          const start = i * seg;
          const fadeInEnd = i === 0 ? start + seg * 0.02 : start + seg * 0.25;
          return (
            <Layer
              key={s.tag}
              image={mediaUrl(images?.[i])}
              progress={scrollYProgress}
              range={[start, fadeInEnd, start + seg * 0.75, start + seg]}
            />
          );
        })}

        {/* Verb overlays. Same immediate-appear treatment as the first
            image layer above, so "نشخصها" surfaces together with its
            photo instead of lagging behind it. */}
        {STEPS.map((s, i) => {
          const seg = 0.82 / STEPS.length;
          const start = i * seg;
          const fadeInEnd = i === 0 ? start + seg * 0.05 : start + seg * 0.28;
          return (
            <Verb
              key={s.tag}
              ar={s.ar}
              en={s.en}
              tag={s.tag}
              index={i}
              progress={scrollYProgress}
              range={[start, fadeInEnd, start + seg * 0.72, start + seg]}
            />
          );
        })}

        {/* Final unifying line */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ opacity: finalOpacity }}
        >
          <div className="absolute inset-0 bg-[#060708]/70" />
          <motion.h2
            className="font-display relative px-6 text-center text-[var(--sorouh-ivory)]"
            style={{
              fontSize: 'clamp(40px, 6.5vw, 108px)',
              fontWeight: 800,
              lineHeight: 1.15,
              paddingBottom: '0.08em',
              scale: finalScale,
            }}
          >
            كل ذلك تحت <span className="text-[var(--sorouh-bronze)]">سقف واحد.</span>
          </motion.h2>
          {/* Connecting line to Services */}
          <motion.div
            className="mt-8 h-px w-16 bg-[var(--sorouh-bronze)]"
            style={{ opacity: finalOpacity }}
          />
        </motion.div>
      </div>
    </section>
  );
}

function Verb({
  ar,
  en,
  tag,
  index,
  progress,
  range,
}: {
  ar: string;
  en: string;
  tag: string;
  index: number;
  progress: MotionValue<number>;
  range: [number, number, number, number];
}) {
  const opacity = useTransform(progress, range, [0, 1, 1, 0]);
  const y = useTransform(progress, [range[0], range[3]], [80, -80]);
  const { t } = useLang();
  const word = t(ar, en);
  const align = index % 2 === 0 ? 'items-start ps-16' : 'items-end pe-16';
  const textAlign = index % 2 === 0 ? 'text-start' : 'text-end';

  return (
    <motion.div
      className={`absolute inset-0 flex flex-col justify-center ${align}`}
      style={{ opacity }}
    >
      <motion.div style={{ y }} className={textAlign}>
        <span
          className="font-mono-tech mb-4 block text-[var(--sorouh-bronze)]"
          style={{ fontSize: 12, letterSpacing: '0.4em' }}
        >
          0{index + 1} — {tag}
        </span>
        <span
          className="font-display block text-[var(--sorouh-ivory)]"
          style={{
            fontSize: 'clamp(40px, 9vw, 160px)',
            fontWeight: 800,
            lineHeight: 1.16,
            paddingBottom: '0.1em',
            textShadow: '0 20px 60px rgba(0,0,0,0.6)',
            maxWidth: 'min(92vw, 1300px)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {word}
        </span>
      </motion.div>
    </motion.div>
  );
}
