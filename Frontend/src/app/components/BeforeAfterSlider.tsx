import { useRef, useState, useCallback } from 'react';

interface Props {
  before: string;
  after: string;
  beforeSrcSet?: string;
  afterSrcSet?: string;
  sizes?: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export function BeforeAfterSlider({ before, after, beforeSrcSet, afterSrcSet, sizes, beforeLabel = 'قبل', afterLabel = 'بعد' }: Props) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePos = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPos((x / rect.width) * 100);
  }, []);

  const onMouseDown = () => { dragging.current = true; };
  const onMouseMove = (e: React.MouseEvent) => { if (dragging.current) updatePos(e.clientX); };
  const onMouseUp = () => { dragging.current = false; };
  const onTouchMove = (e: React.TouchEvent) => { updatePos(e.touches[0].clientX); };

  return (
    <div
      ref={containerRef}
      className="relative select-none overflow-hidden border border-[var(--sorouh-line)] cursor-ew-resize"
      style={{ aspectRatio: '16/9' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
    >
      {/* Before image */}
      <img
        src={before}
        srcSet={beforeSrcSet}
        sizes={sizes}
        alt={beforeLabel}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* After image clipped */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <img
          src={after}
          srcSet={afterSrcSet}
          sizes={sizes}
          alt={afterLabel}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-px bg-[var(--sorouh-ivory)] z-10"
        style={{ left: `${pos}%` }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-[var(--sorouh-line-strong)] bg-[#060708] flex items-center justify-center gap-0.5">
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M3 1L1 7L3 13M5 1L7 7L5 13" stroke="var(--sorouh-ivory)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-[#060708]/75 text-[var(--sorouh-ivory)] border border-[var(--sorouh-line)]" style={{ fontSize: 13, fontWeight: 500 }}>{beforeLabel}</span>
      <span className="absolute top-4 right-4 z-10 px-3 py-1 bg-[var(--sorouh-bronze)]/90 text-[#060708] border border-[var(--sorouh-line-strong)]" style={{ fontSize: 13, fontWeight: 600 }}>{afterLabel}</span>
    </div>
  );
}
