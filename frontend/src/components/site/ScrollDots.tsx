"use client";

import { useEffect, useRef, useState } from "react";
import { smoothScrollTo } from "@/lib/scroll";

export interface DotSection {
  id: string;
  label: string;
}

/**
 * Vertikalna traka tačaka sa strane — prati kroz koju si sekciju trenutno
 * (IntersectionObserver) i skače na klik. Namjerno BEZ mix-blend-mode (bio je
 * skup za renderovanje tokom skrola) — umjesto toga, mala polu-prozirna
 * "pilula" pozadina iza tačaka garantuje kontrast nad bilo kojom sekcijom.
 */
export function ScrollDots({ sections }: { sections: DotSection[] }) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const ratios = useRef<Record<string, number>>({});

  // Sakriveno preko hero-a (tamo se koliduje sa masthead sadržajem) — pojavi se
  // tek kad korisnik skroluje dalje, otprilike gdje hero prelazi u ostatak sajta.
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.85);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.current[entry.target.id] = entry.intersectionRatio;
        });
        let bestId: string | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of Object.entries(ratios.current)) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }
        if (bestId) {
          const idx = sections.findIndex((s) => s.id === bestId);
          if (idx !== -1) setActive(idx);
        }
      },
      { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] },
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div
      className={`fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-4 transition-opacity duration-500 md:right-6 lg:flex ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      {sections.map((s, i) => (
        <button
          key={s.id}
          type="button"
          onClick={() => smoothScrollTo(s.id)}
          aria-label={`Idi na: ${s.label}`}
          className="group flex items-center gap-2.5 py-1"
        >
          <span className="whitespace-nowrap rounded-full bg-ink px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-cream opacity-0 transition-opacity duration-300 group-hover:opacity-90">
            {s.label}
          </span>
          <span
            className={`block rounded-full bg-ink shadow-[0_0_0_1.5px_rgba(246,243,238,0.9)] transition-all duration-300 ${
              active === i ? "h-2.5 w-2.5 opacity-100" : "h-1.5 w-1.5 opacity-70 group-hover:opacity-100"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
