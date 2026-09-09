import { useRef, ReactNode, CSSProperties } from "react";
import { motion, useInView } from "motion/react";

/* ============================================================
   MAGNETIC — element drifts toward the pointer, springs back.
   Used for primary CTAs / arrows.
   ============================================================ */

export function Magnetic({
  children,
  strength: _strength = 0,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

/* ============================================================
   MASK REVEAL — a line of type wiped up from behind a mask.
   ============================================================ */

export function MaskReveal({
  children,
  delay = 0,
  className,
  style,
  once = true,
  duration = 1.1,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  once?: boolean;
  duration?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, amount: 0.4 });
  return (
    <span ref={ref} className="mask-line">
      <motion.span
        className={className}
        style={{ display: "block", ...style }}
        initial={{ y: "110%" }}
        animate={inView ? { y: "0%" } : { y: "110%" }}
        transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/* ============================================================
   FADE UP — restrained entrance for supporting content.
   ============================================================ */

export function FadeUp({
  children,
  delay = 0,
  y = 26,
  className,
  amount = 0.35,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  amount?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
   TECH LABEL — small restrained technical caption (English).
   ============================================================ */

export function TechLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      lang="en"
      className={`font-mono-tech uppercase text-[var(--sorouh-bronze)] ${className}`}
      style={{ fontSize: 12, letterSpacing: "0.34em", fontWeight: 400 }}
    >
      {children}
    </span>
  );
}

/* ============================================================
   EYEBROW — small restrained Arabic caption (Lama Sans).
   No positive letter-spacing (Arabic shaping must stay intact).
   ============================================================ */

export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`font-body inline-flex items-center gap-2 text-[var(--sorouh-bronze)] ${className}`}
      style={{ fontSize: 13, letterSpacing: 0, fontWeight: 500 }}
    >
      <span
        aria-hidden
        className="h-px w-6 bg-[var(--sorouh-bronze)]/50"
        style={{ display: "inline-block" }}
      />
      {children}
    </span>
  );
}
