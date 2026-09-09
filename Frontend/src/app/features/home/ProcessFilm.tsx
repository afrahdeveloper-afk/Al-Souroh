import { useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from 'motion/react';
import { mediaUrl } from '../../lib/siteContent';
import { TechLabel } from '../../components/primitives';
import { useLang } from '../../providers/LanguageProvider';

/* PROCESS AS A FILM SEQUENCE
   Six cinematic chapters, each occupying the viewport. Scroll swaps chapters
   with a horizontal mask and a light transition — one visual, one huge number,
   one short statement, one subtle motion each. */

/* Each chapter's photograph is CMS-driven — `/api/static-images/home-page/`'s
   process_image_first ... process_image_sixth, in chapter order, handed down
   by HomeExperience. */
const CHAPTERS = [
  { n: '01', title: 'الاستقبال والتوثيق', line: 'تبدأ الرحلة بتوثيق كامل لحالة المركبة قبل لمسها.', tag: 'INTAKE' },
  { n: '02', title: 'الفحص والتشخيص', line: 'قراءة دقيقة لكل نظام، لا مكان للتخمين.', tag: 'DIAGNOSIS' },
  { n: '03', title: 'شرح الحالة والموافقة', line: 'نعرض النتائج بوضوح، ولا نبدأ إلا بموافقتك.', tag: 'APPROVAL' },
  { n: '04', title: 'التنفيذ', line: 'أيدٍ خبيرة وأدوات دقيقة تنفّذ الخطة بعناية.', tag: 'EXECUTION' },
  { n: '05', title: 'مراجعة الجودة', line: 'رقابة صارمة قبل أن تلمس المركبة الضوء مجدداً.', tag: 'QC' },
  { n: '06', title: 'التسليم والمتابعة', line: 'تبقى على اطلاع بمراحل العمل عبر واتساب، حتى لحظة التسليم.', tag: 'HANDOVER' },
];

export function ProcessFilm({ images }: { images?: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { isAr } = useLang();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = Math.min(CHAPTERS.length - 1, Math.floor(v * CHAPTERS.length));
    if (idx !== active) setActive(idx);
  });

  const c = CHAPTERS[active];
  const chapterImage = mediaUrl(images?.[active]);

  return (
    <section ref={ref} className="process-film-scene relative h-[600vh] bg-[#060708]">
      <div className="sticky top-0 h-screen w-full overflow-hidden cinematic-grain vignette">
        {/* Visual, masked swap */}
        <AnimatePresence>
          <motion.div
            key={active}
            className="absolute inset-0"
            initial={{ clipPath: 'inset(0 0 0 100%)' }}
            animate={{ clipPath: 'inset(0 0 0 0%)' }}
            exit={{ clipPath: 'inset(0 100% 0 0)' }}
            transition={{ duration: 1, ease: [0.7, 0, 0.2, 1] }}
          >
            {chapterImage && (
              <img
                src={chapterImage}
                alt={c.title}
                decoding="async"
                className="h-full w-full object-cover"
                style={{ filter: 'brightness(0.4) contrast(1.15)' }}
              />
            )}
            <div className="absolute inset-0 bg-[#060708]/50" />
          </motion.div>
        </AnimatePresence>

        {/* Giant chapter number, ghosted. Arabic keeps its original physical
            left position; English mirrors it to the right (opposite the
            statement block, which mirrors the other way) instead of both
            staying physically put and colliding. */}
        <AnimatePresence>
          <motion.div
            key={`n-${active}`}
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 select-none ${isAr ? 'left-[4%]' : 'right-[4%]'}`}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 0.14, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.8 }}
          >
            <span
              className="font-display text-[var(--sorouh-ivory)]"
              style={{ fontSize: 'clamp(180px,26vw,420px)', fontWeight: 800, lineHeight: 0.8 }}
            >
              {c.n}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Statement — Arabic's placement (hugging the reading-end side,
            opposite the giant number) is the canonical layout; English
            mirrors it via isAr rather than keeping the same physical side.
            Both sides use `self-start`, not a `self-end`/`self-start` mirror
            pair: confirmed live via getBoundingClientRect that for a column
            flex container under `dir="rtl"`, `self-end` resolves to the
            physical *left* (RTL's inline-end), not the right — so Arabic's
            "self-end" was actually anchoring the statement block against
            the same side as the number, just far enough right (via its own
            internal text-align) to not visibly collide for a short,
            one-line title. A two-line title ("الاستقبال والتوثيق") was
            wide enough that its second line's physical-left edge landed
            underneath the number. `self-start` under RTL resolves to the
            physical right — the actually-intended side — verified after
            the fix: the block's right edge sits flush against the pr-16
            gutter, clear of the number in every chapter. */}
        <div className={`absolute inset-0 flex flex-col justify-center ${isAr ? 'pr-16 pl-6 text-right' : 'pl-16 pr-6 text-left'}`}>
          <TechLabel>PROCESS · {c.tag}</TechLabel>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="mt-5 max-w-[640px] self-start"
            >
              <h3
                className="font-display text-[var(--sorouh-ivory)]"
                style={{ fontSize: 'clamp(40px,6vw,96px)', fontWeight: 800, lineHeight: 1.14, paddingBottom: '0.08em' }}
              >
                {c.title}
              </h3>
              <p
                className="mt-6 text-[var(--sorouh-steel)]"
                style={{ fontSize: 20, lineHeight: 1.85 }}
              >
                {c.line}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Chapter rail */}
        <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-3">
          {CHAPTERS.map((ch, i) => (
            <div key={ch.n} className="flex items-center gap-3">
              <span
                className="font-mono-tech transition-colors duration-300"
                style={{
                  fontSize: 11,
                  letterSpacing: '0.2em',
                  color: i === active ? 'var(--sorouh-bronze)' : 'var(--sorouh-muted)',
                }}
              >
                {ch.n}
              </span>
              {i < CHAPTERS.length - 1 && (
                <span
                  className="block h-px w-8 transition-colors duration-300"
                  style={{
                    backgroundColor: i < active ? 'var(--sorouh-bronze)' : 'rgba(237,233,224,0.14)',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
