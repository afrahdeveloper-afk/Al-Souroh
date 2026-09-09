import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useLang } from "../../providers/LanguageProvider";
import { img, IMG } from "../../lib/images";

/* The bird/S mark from public/alsorouh-icon.svg (viewBox 0 0 237.39 342.07),
   inlined so each path can be drawn in as a stroke before crossfading to its
   solid bronze fill. Ordered as the mark itself is built: the five feather
   strokes forming the ascending body, the connecting wing bar, then the
   large sweeping S — drawn last, like a signature stroke closing the mark. */
const LOGO_PATHS = [
  "M104.92,150.76c-26.52-22.96-52.06-48.02-66.75-80.5C28.22,48.26,25,23.83,29.97.05c-.86-.21-.58.28-.85.62-4.9,6.19-10.57,18.45-13.35,25.95-20.04,54.09,21.03,104.29,59.1,137.68,29.19,25.6,78,56.82,91.22,93.99,8.06,22.65,3.36,45.43-10.65,64.47l.49.49c24.54-18.11,39.08-46.34,32.04-77.25-8.9-39.03-54.18-70.24-83.05-95.23Z",
  "M103.77,229.48c24.79,16.5,54.34,36.44,54.97,69.66.9-.51,1.21-2.01,1.49-2.97,14.19-49.07-47.57-87.09-79.71-112.12-30.12-23.45-58.27-51.46-73.16-87.3-1.66-3.99-2.94-8.27-4.64-12.19-.25-.57-.6-1.72-1.14-1.99-3.54,19.93-1.11,40.89,7.2,59.31,17.96,39.82,60.13,64.39,94.99,87.59Z",
  "M74.04,223.89c-22.34-14.53-45.44-32.39-61.18-54.04-1.65-2.27-3.51-4.87-4.69-7.37-.85-.13-.69.14-.65.82.17,3.16,1.13,7.22,1.88,10.34,9.17,38.43,42.01,61.05,75.05,78.14,25.77,13.33,64.26,25.24,65.55,59.91,3.6-6.71,2.17-15.69-.07-22.71-10.29-32.25-49.58-48-75.88-65.1Z",
  "M76.74,261.47c-16.27-7.85-31.6-17.68-45.11-29.67,7.62,20.58,22.42,36.69,41.05,47.93,15.43,9.31,45.39,19.31,53,35.81,3.93,8.51,2.45,17.81.05,26.53,11.9-9.45,20.25-23.25,14.12-38.71-8.83-22.26-43.17-32.26-63.1-41.89Z",
  "M105.14,310.32c-8.14-3.63-17.19-5.87-24.98-10.51-.22.23,2.34,3.88,2.7,4.4,5.35,7.76,11.85,15.05,19.98,19.97,4.65,2.81,9.73,5,14.63,7.32,1.27-10.77-2.74-16.91-12.32-21.18Z",
  "M237.32,121.33v22.14c-7.36-9.47-18.46-15.68-29.54-19.29v-2.85c0-9.08-4.97-16.12-9.25-16.12H69.15c-6.77-6.53-21.12-29.54-21.12-29.54h150.49c21.38,0,38.8,20.48,38.8,45.67Z",
  "M236.82,193.66c-.33,2.21-.75,4.41-1.11,6.61-.66,4-1.49,7.97-2.46,11.9-2,8.08-4.59,16-7.67,23.73-3.13,7.86-6.75,15.52-10.81,22.95-4.02,7.36-8.47,14.49-13.33,21.33-1.95,2.74-3.97,5.44-6.05,8.08-1.03,1.3-2.07,2.59-3.13,3.87-.51.62-1.03,1.23-1.55,1.84-.42.49-1.36,1.22-1.57,1.81,3.01-8.61,6.9-17.03,9.28-25.84,2.27-8.42,2.78-17.3,1.47-25.92-1.43-9.43-5-18.63-9.68-26.9-4.99-8.8-11.45-16.72-18.73-23.72-2.81-2.7-5.74-5.26-8.76-7.7,10.06-1.41,23.02-4.46,15.37-14.1-5.02-6.36-32.93-23.65-33.93-7.06-.8-1.56-2.78-3.63-3.41-5.02-11.23-25.62,27.79-32.98,45.4-31.69,16.17,1.19,36.12,8.55,45.42,22.55.88,1.32,5.38,11.3,4.26,11.69,0,0-38.65-28.01-65.25-20.51-.63.15-1.24.34-1.85.58-.63.22-1.27.46-1.9.73,0,0,.71.1,2.05.37.32.05.68.12,1.07.22,3.48.87,6.94,1.68,10.36,2.77,5.31,1.69,10.51,3.74,15.56,6.1,6.42,3,12.61,6.51,18.47,10.49,3.71,2.52,7.28,5.24,10.71,8.14,2.66,2.25,5.28,4.61,7.8,7.02,1.56,1.49,2.99,3.18,3.78,5.19.82,2.07.9,4.36.7,6.58-.12,1.3-.29,2.6-.48,3.9Z",
];

const LOGO_DRAW_START = 0.4;
const LOGO_DRAW_STAGGER = 0.14;
const LOGO_DRAW_DURATION = 1.1;
const LOGO_FILL_DELAY = 2.3;
const WORDMARK_DELAY = 2.5;
const STATEMENT_DELAY = 3.3;

function LogoDraw({ reduced }: { reduced: boolean }) {
  return (
    <svg
      viewBox="0 0 237.39 342.07"
      className="h-full w-full"
      aria-hidden="true"
    >
      {LOGO_PATHS.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="var(--sorouh-bronze)"
          stroke="var(--sorouh-bronze)"
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={
            reduced
              ? { pathLength: 1, fillOpacity: 1, strokeOpacity: 0 }
              : { pathLength: 0, fillOpacity: 0, strokeOpacity: 1 }
          }
          animate={{ pathLength: 1, fillOpacity: 1, strokeOpacity: 0 }}
          transition={
            reduced
              ? { duration: 0 }
              : {
                  pathLength: {
                    duration: LOGO_DRAW_DURATION,
                    delay: LOGO_DRAW_START + i * LOGO_DRAW_STAGGER,
                    ease: [0.6, 0.05, 0.2, 0.95],
                  },
                  fillOpacity: { duration: 0.7, delay: LOGO_FILL_DELAY },
                  strokeOpacity: { duration: 0.7, delay: LOGO_FILL_DELAY },
                }
          }
        />
      ))}
    </svg>
  );
}

/* SIGNATURE MOMENT 01 — the approved cinematic opening sequence.
   It intentionally contains no skip control or user-dismiss interaction. */
export function Intro({ onDone }: { onDone: () => void }) {
  const { isAr } = useLang();
  const reduced = !!useReducedMotion();
  const [leaving, setLeaving] = useState(false);
  const [wordmarkIn, setWordmarkIn] = useState(false);
  const leavingRef = useRef(false);
  const completionTimer = useRef<number | null>(null);

  const finish = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    setLeaving(true);
    completionTimer.current = window.setTimeout(onDone, 900);
  }, [onDone]);

  useEffect(() => {
    const timer = window.setTimeout(finish, reduced ? 2400 : 4000);
    return () => {
      window.clearTimeout(timer);
      if (completionTimer.current !== null)
        window.clearTimeout(completionTimer.current);
    };
  }, [finish, reduced]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setWordmarkIn(true),
      reduced ? 300 : WORDMARK_DELAY * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [reduced]);

  const statement = isAr
    ? "القيمة تُعرف من طريقة التعامل معها"
    : "Value is defined by how it is treated.";

  return (
    <AnimatePresence>
      <motion.div
        dir={isAr ? "rtl" : "ltr"}
        lang={isAr ? "ar" : "en"}
        className={`fixed inset-0 z-[10000] overflow-hidden bg-[#060708] cinematic-grain ${leaving ? "pointer-events-none" : ""}`}
        animate={leaving ? { opacity: 0 } : { opacity: 1 }}
        transition={
          leaving
            ? { duration: 0.28, delay: 0.7, ease: [0.16, 1, 0.3, 1] }
            : { duration: 0 }
        }
      >
        {/* Vehicle, held almost entirely in blackness — only a faint body
            line ever surfaces, so the frame reads as near-black rather than
            as a photograph. */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1.05, opacity: 0.3 }}
          transition={{ duration: 4, ease: "easeOut" }}
        >
          {/* <img src={img(IMG.heroCar, 2000)} alt="" className="h-full w-full object-cover" style={{ filter: 'brightness(0.22) contrast(1.3) saturate(0.5)' }} /> */}
          <div className="absolute inset-0 bg-[#020203]/80" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 0%, rgba(2,3,3,0.75) 62%, #020203 100%)",
            }}
          />
        </motion.div>

        {/* Original light sweep across the vehicle body line. */}
        <motion.div
          className="absolute top-0 h-full w-[40%]"
          style={{
            background:
              "linear-gradient(105deg, transparent, rgba(255,255,255,0.1) 45%, rgba(188,172,134,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent)",
            filter: "blur(6px)",
          }}
          initial={{ left: "-45%" }}
          animate={{ left: "110%" }}
          transition={{ duration: 2.4, ease: [0.5, 0, 0.2, 1], delay: 0.2 }}
        />

        {/* Headlight activation glow, late in the sequence. */}
        {/* <motion.div
          className="absolute"
          style={{
            width: 520,
            height: 520,
            right: "18%",
            top: "42%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(220,225,255,0.35), rgba(188,172,134,0.1) 40%, transparent 70%)",
            filter: "blur(18px)",
          }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 0, 0.7], scale: [0.6, 0.6, 1] }}
          transition={{ duration: 5.2, times: [0, 0.7, 1] }}
        /> */}

        {/* Centered mark reveal — the logo draws itself in first, then the
            wordmark and headline surface with the same careful timing. */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-[var(--page-gutter)] text-center">
          <div
            className="mb-5"
            style={{ width: 56, height: 56 * (342.07 / 237.39) }}
          >
            <LogoDraw reduced={reduced} />
          </div>

          <div
            className="mb-10"
            style={{
              opacity: wordmarkIn ? 1 : 0,
              transform: wordmarkIn ? "translateY(0)" : "translateY(12px)",
              transition:
                "opacity 1.2s cubic-bezier(0.16,1,0.3,1), transform 1.2s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <div
              className="font-display text-[var(--sorouh-ivory)]"
              style={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: isAr ? 0 : "0.08em",
              }}
            >
              {isAr ? "ركن الصروح" : "Al-Sorouh"}
            </div>
            <div
              className="font-mono-tech mt-2 text-[var(--sorouh-bronze)]"
              style={{ fontSize: 10, letterSpacing: "0.5em" }}
            >
              AL·SOROUH — SINCE 1989
            </div>
          </div>

          <div className="max-w-[1100px] text-center">
            <div className="overflow-hidden px-2 py-3">
              <motion.p
                className="font-display m-0 text-[var(--sorouh-ivory)]"
                style={{
                  fontSize: "clamp(24px, 3.4vw, 38px)",
                  fontWeight: 500,
                  lineHeight: 1.3,
                  paddingBottom: "0.12em",
                }}
                initial={{ y: "120%" }}
                animate={{ y: "0%" }}
                transition={{
                  duration: 1.3,
                  delay: reduced ? 0.6 : STATEMENT_DELAY,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {statement}
              </motion.p>
            </div>
          </div>
        </div>

        {/* The original cinematic mask remains visible through the hand-off. */}
        {leaving && (
          <motion.div
            className="absolute inset-0 bg-[#060708]"
            initial={{ scaleY: 0, transformOrigin: "top" }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.8, ease: [0.7, 0, 0.2, 1] }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
