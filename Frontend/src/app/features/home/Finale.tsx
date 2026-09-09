import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { mediaUrl } from "../../lib/siteContent";
import {
  MaskReveal,
  Magnetic,
  TechLabel,
} from "../../components/primitives";
import { useLang } from "../../providers/LanguageProvider";

/* FINAL MOMENT
   A luxury vehicle leaving the workshop at night — only rear lights and
   reflections. As the visitor scrolls on, the vehicle sinks into darkness. */

/** `image` is `/api/static-images/home-page/`'s `end_image` — the last
 *  photograph on the homepage — passed down by HomeExperience. */
export function Finale({ image }: { image?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { isAr } = useLang();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const carY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);
  const carOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.05]);
  const darken = useTransform(scrollYProgress, [0, 1], [0.4, 0.95]);

  return (
    <section ref={ref} className="finale-scene relative h-[180vh] bg-[#060708]">
      <div className="sticky top-0 h-screen w-full overflow-hidden cinematic-grain vignette">
        <motion.div
          className="absolute inset-0"
          style={{ y: carY, opacity: carOpacity }}
        >
          {mediaUrl(image) && (
            <img
              src={mediaUrl(image)}
              alt="مركبة فارهة تغادر صالة الصروح ليلاً"
              decoding="async"
              className="h-full w-full object-cover"
              style={{ filter: "brightness(0.7) contrast(1.25) saturate(1.1)" }}
            />
          )}
        </motion.div>
        <motion.div
          className="absolute inset-0 bg-[#060708]"
          style={{ opacity: darken }}
        />

        {/* red taillight glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(40% 30% at 50% 60%, rgba(180,30,30,0.18), transparent 70%)",
          }}
        />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <div>
            <MaskReveal>
              <span
                className="font-display block text-[var(--sorouh-ivory)]"
                style={{
                  fontSize: isAr ? "clamp(26px,5.8vw,108px)" : "clamp(28px,5.6vw,72px)",
                  fontWeight: 800,
                  lineHeight: 1.14,
                  paddingBottom: "0.08em",
                  whiteSpace: "nowrap",
                  ...(isAr ? {} : { zoom: 1, maxInlineSize: 'none' }),
                }}
              >
                السيارات الاستثنائية،
              </span>
            </MaskReveal>
            <MaskReveal delay={0.12}>
              <span
                className="font-display block text-[var(--sorouh-bronze)]"
                style={{
                  fontSize: isAr ? "clamp(26px,5.8vw,108px)" : "clamp(28px,5.6vw,72px)",
                  fontWeight: 800,
                  lineHeight: 1.14,
                  paddingBottom: "0.08em",
                  whiteSpace: "nowrap",
                  ...(isAr ? {} : { zoom: 1, maxInlineSize: 'none' }),
                }}
              >
                تستحق معاملة استثنائية.
              </span>
            </MaskReveal>
          </div>

          <p
            className="finale-tagline mt-8 text-[var(--sorouh-steel)]"
            style={{ fontSize: isAr ? 18 : 24, whiteSpace: 'nowrap' }}
          >
            ركن الصروح لخدمات المركبات الفارهة.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            {/* <Magnetic strength={0.5}>
              <a
                href="#booking"
                onMouseEnter={() => setCursor({ active: true, label: 'احجز' })}
                onMouseLeave={() => setCursor({ active: false })}
                className="group flex items-center gap-4 bg-[var(--sorouh-bronze)] px-10 py-4 text-[#060708] transition-colors duration-300 hover:bg-[var(--sorouh-bronze-soft)]"
              >
                <span style={{ fontSize: 16, fontWeight: 500 }}>احجز موعداً خاصاً</span>
                <span className="transition-transform duration-300 group-hover:-translate-x-1.5">←</span>
              </a>
            </Magnetic> */}
            <a
              href="https://wa.me/9647700000000"
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 border border-[var(--sorouh-ivory)]/20 px-9 py-4 text-[var(--sorouh-ivory)] transition-colors duration-300 hover:border-[var(--sorouh-bronze)]"
            >
              <span style={{ fontSize: 16 }}>تواصل عبر واتساب</span>
            </a>
          </div>

          <div className="absolute bottom-10">
            <TechLabel>EXCEPTIONAL CARS · EXCEPTIONAL CARE</TechLabel>
          </div>
        </div>
      </div>
    </section>
  );
}
