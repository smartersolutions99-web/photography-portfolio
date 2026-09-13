"use client";

import { useRef, useState } from "react";
import { BlurImage } from "./BlurImage";

/**
 * Prevlačiv razdelnik "sirovo vs. editovano" na istoj fotografiji. Pošto nemamo
 * poseban RAW fajl u bazi, "sirova" strana simulira neobrađen snimak preko CSS
 * filtera (niži kontrast/zasićenje, blaga sepia) — isti izvor slike, dva izgleda.
 */
export function BeforeAfterSlider({ imageUrl, alt }: { imageUrl: string; alt?: string }) {
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);
  const frameRef = useRef<HTMLDivElement>(null);

  function updateFromClientX(clientX: number) {
    const el = frameRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pct = ((clientX - r.left) / r.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updateFromClientX(e.clientX);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  }
  function onPointerUp() {
    dragging.current = false;
  }

  return (
    <div
      ref={frameRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className="relative aspect-[4/3] w-full touch-none select-none overflow-hidden bg-line/30 md:aspect-[16/9]"
    >
      {/* "Poslije" — puna, editovana slika (osnovni sloj) */}
      <BlurImage
        src={imageUrl}
        alt={alt ?? "Fotografija — editovano"}
        fill
        sizes="(max-width: 768px) 100vw, 1300px"
        className="pointer-events-none object-cover"
        draggable={false}
      />

      {/* "Prije" — simulirano sirovo, isječeno do pozicije razdelnika */}
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <div className="absolute inset-0" style={{ filter: "grayscale(0.3) saturate(0.55) contrast(0.82) brightness(0.96) sepia(0.1)" }}>
          <BlurImage
            src={imageUrl}
            alt={alt ?? "Fotografija — sirovo"}
            fill
            sizes="(max-width: 768px) 100vw, 1300px"
            className="pointer-events-none object-cover"
            draggable={false}
          />
        </div>
      </div>

      {/* Labele */}
      <span className="pointer-events-none absolute left-4 top-4 text-[0.6rem] uppercase tracking-[0.25em] text-cream/90 [text-shadow:0_1px_6px_rgba(0,0,0,0.7)] md:left-6 md:top-6">
        Sirovo
      </span>
      <span className="pointer-events-none absolute right-4 top-4 text-[0.6rem] uppercase tracking-[0.25em] text-cream/90 [text-shadow:0_1px_6px_rgba(0,0,0,0.7)] md:right-6 md:top-6">
        Editovano
      </span>

      {/* Razdelnik */}
      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 left-0 w-px -translate-x-1/2 bg-cream/90" />
        <div className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cream/90 bg-ink/50 text-cream backdrop-blur-sm">
          <span aria-hidden className="text-sm">
            ↔
          </span>
        </div>
      </div>
    </div>
  );
}
