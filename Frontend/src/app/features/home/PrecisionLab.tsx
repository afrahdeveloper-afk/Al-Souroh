import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';
import { img, IMG } from '../../lib/images';
import { MaskReveal, TechLabel, FadeUp } from '../../components/primitives';

/* PRECISION LABORATORY
   Dark, near-monochrome. Extreme close-ups float as cinematic panels at
   different depths (parallax) — not a card grid. Restrained technical labels. */

const PANELS = [
  { image: IMG.diagnostic, label: 'ECU DIAGNOSTICS', depth: 60, cls: 'left-[6%] top-[18%] w-[22%] h-[38%]' },
  { image: IMG.paintShine, label: 'PAINT THICKNESS', depth: 130, cls: 'right-[8%] top-[10%] w-[26%] h-[32%]' },
  { image: IMG.engineBay, label: 'HYBRID · EV SYSTEMS', depth: 90, cls: 'left-[14%] bottom-[8%] w-[24%] h-[34%]' },
  { image: IMG.paintBumper, label: 'PDR TOOLING', depth: 180, cls: 'right-[6%] bottom-[12%] w-[20%] h-[30%]' },
  { image: IMG.wheel, label: 'WHEEL ALIGNMENT', depth: 40, cls: 'right-[32%] top-[46%] w-[18%] h-[26%]' },
];

function Panel({
  panel,
  progress,
}: {
  panel: (typeof PANELS)[number];
  progress: MotionValue<number>;
}) {
  const y = useTransform(progress, [0, 1], [panel.depth, -panel.depth]);
  return (
    <motion.div
      className={`absolute overflow-hidden ${panel.cls}`}
      style={{ y }}
      initial={{ opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <img
        src={img(panel.image, 800)}
        alt={panel.label}
        className="h-full w-full object-cover"
        style={{ filter: 'brightness(0.55) grayscale(0.5) contrast(1.15)' }}
      />
      <div className="absolute inset-0 ring-1 ring-inset ring-[var(--sorouh-ivory)]/10" />
      <div className="absolute bottom-2 left-2">
        <TechLabel className="!text-[var(--sorouh-steel)]">{panel.label}</TechLabel>
      </div>
    </motion.div>
  );
}

export function PrecisionLab() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  return (
    <section
      ref={ref}
      className="relative min-h-[130vh] overflow-hidden bg-[#08090b] cinematic-grain"
    >
      {/* Floating panels (desktop) */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        {PANELS.map((p) => (
          <Panel key={p.label} panel={p} progress={scrollYProgress} />
        ))}
      </div>

      {/* Centered statement */}
      <div className="relative z-10 flex min-h-[130vh] flex-col items-center justify-center px-6 text-center">
        <FadeUp>
          <TechLabel>PRECISION ENVIRONMENT</TechLabel>
        </FadeUp>
        <div className="mt-6">
          <MaskReveal>
            <span
              className="font-display block text-[var(--sorouh-ivory)]"
              style={{ fontSize: 'clamp(44px,7vw,120px)', fontWeight: 800, lineHeight: 1.14, paddingBottom: '0.08em' }}
            >
              هنا، لا مكان
            </span>
          </MaskReveal>
          <MaskReveal delay={0.12}>
            <span
              className="font-display block text-[var(--sorouh-bronze)]"
              style={{ fontSize: 'clamp(44px,7vw,120px)', fontWeight: 800, lineHeight: 1.14, paddingBottom: '0.08em' }}
            >
              للتخمين.
            </span>
          </MaskReveal>
        </div>
        <FadeUp delay={0.2}>
          <p
            className="mt-9 max-w-[560px] text-[var(--sorouh-steel)]"
            style={{ fontSize: 19, lineHeight: 1.9 }}
          >
            كل قرار يبدأ بفحص دقيق، وكل تنفيذ يمر بمراجعة واضحة قبل التسليم.
          </p>
        </FadeUp>
      </div>

      {/* Mobile fallback strip of details */}
      <div className="relative z-10 grid grid-cols-2 gap-3 px-6 pb-20 lg:hidden">
        {PANELS.slice(0, 4).map((p) => (
          <div key={p.label} className="relative h-40 overflow-hidden">
            <img
              src={img(p.image, 600)}
              alt={p.label}
              className="h-full w-full object-cover"
              style={{ filter: 'brightness(0.55) grayscale(0.5)' }}
            />
            <div className="absolute bottom-2 left-2">
              <TechLabel className="!text-[var(--sorouh-steel)]">{p.label}</TechLabel>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
