import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { mediaUrl } from "../../lib/siteContent";
import {
  MaskReveal,
  TechLabel,
  Eyebrow,
  FadeUp,
} from "../../components/primitives";

/* THE 1989 STORY
   An ivory editorial break. "1989" at massive scale, embossed into the surface
   and cropped by the viewport, moving slowly as a sticky monochrome image holds.
   The ivory gradually transitions back into black at the end. No timeline dots. */

/** `image` is `/api/static-images/home-page/`'s `story_image`, passed down
 *  by HomeExperience. No fallback photo: without it the frame stays the
 *  ivory ground it already sits on while the record loads. */
export function Story1989({ image }: { image?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const numberX = useTransform(scrollYProgress, [0, 1], ["8%", "-18%"]);
  const imgY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const toBlack = useTransform(scrollYProgress, [0.75, 1], [0, 1]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[var(--sorouh-ivory)]"
    >
      {/* Giant embossed 1989 */}
      <motion.div
        className="pointer-events-none absolute top-[6%] select-none whitespace-nowrap"
        style={{
          x: numberX,
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "clamp(96px, 34vw, 560px)",
          lineHeight: 0.8,
          color: "transparent",
          WebkitTextStroke: "0px transparent",
          background:
            "linear-gradient(180deg, #d9d2c3 0%, #e9e4d8 55%, #cfc7b5 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          textShadow:
            "1px 1px 0 rgba(255,255,255,0.7), -1px -1px 2px rgba(0,0,0,0.08)",
        }}
      >
        1989
      </motion.div>

      <div className="page-gutter relative z-10 mx-auto grid max-w-[1280px] grid-cols-1 gap-10 py-28 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:py-40">
        {/* Sticky monochrome origin image */}
        <div className="relative">
          <div className="lg:sticky lg:top-32 overflow-hidden bg-[#cfc7b5]">
            {mediaUrl(image) ? (
              <motion.img
                src={mediaUrl(image)}
                alt="من أصول ركن الصروح — عالم قطع غيار مرسيدس-بنز"
                decoding="async"
                className="h-[520px] w-full object-cover"
                style={{ y: imgY, filter: "grayscale(1) contrast(1.05)" }}
              />
            ) : (
              <div className="h-[520px] w-full" />
            )}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-[var(--sorouh-ivory)]/90 px-5 py-3 backdrop-blur">
              <TechLabel>THE ORIGIN · 1989</TechLabel>
              <span
                className="font-mono-tech text-[var(--sorouh-muted)]"
                style={{ fontSize: 10, letterSpacing: "0.3em" }}
              >
                MERCEDES-BENZ PARTS
              </span>
            </div>
          </div>
        </div>

        {/* Story text, staggered lines (not a column block) */}
        <div className="flex flex-col justify-center">
          <FadeUp>
            <Eyebrow>الحكاية</Eyebrow>
          </FadeUp>

          <div className="mt-8 max-w-[560px]">
            <MaskReveal>
              <span
                className="font-display block text-[#151719]"
                style={{
                  fontSize: "clamp(30px,3.6vw,54px)",
                  fontWeight: 800,
                  lineHeight: 1.15,
                }}
              >
                خبرة من الماضي.
              </span>
            </MaskReveal>
            <MaskReveal delay={0.12}>
              <span
                className="font-display block text-[var(--sorouh-bronze)]"
                style={{
                  fontSize: "clamp(30px,3.6vw,54px)",
                  fontWeight: 800,
                  lineHeight: 1.15,
                }}
              >
                برؤية تناسب مركبات اليوم.
              </span>
            </MaskReveal>
          </div>

          <FadeUp delay={0.15}>
            <p
              className="mt-10 max-w-[520px] text-[#3a3d40]"
              style={{ fontSize: 19, lineHeight: 2 }}
            >
              بدأت الخبرة عام 1989 من عالم قطع غيار مرسيدس-بنز، لتتطور اليوم إلى
              منظومة عراقية متكاملة للعناية بالمركبات وصيانتها واستعادتها.
            </p>
          </FadeUp>

          <FadeUp delay={0.25}>
            <div className="mt-14 flex items-center gap-10 border-t border-[#151719]/12 pt-8">
              <Stat k="35+" v="عاماً من الخبرة" />
              <span className="h-10 w-px bg-[#151719]/12" />
              <Stat k="آلاف" v="المركبات الموثّقة" />
            </div>
          </FadeUp>
        </div>
      </div>

      {/* Fade to black — hands off to the precision lab */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64"
        style={{
          opacity: toBlack,
          background: "linear-gradient(to bottom, transparent, #060708)",
        }}
      />
    </section>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div
        className="font-display text-[#151719]"
        style={{
          fontSize: 40,
          fontWeight: 800,
          lineHeight: 1.15,
          paddingBottom: "0.06em",
        }}
      >
        {k}
      </div>
      <div className="mt-1 text-[#6B7075]" style={{ fontSize: 14 }}>
        {v}
      </div>
    </div>
  );
}
