"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;
const MONTHS = [
  "Januar", "Februar", "Mart", "April", "Maj", "Jun",
  "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar",
];
const WD = ["Po", "Ut", "Sr", "Če", "Pe", "Su", "Ne"];

function stamp(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y} · ${m} · ${day}`;
}

/**
 * „Kamera" date picker — klik otvara viewfinder koji se kružno otvara (blenda),
 * sa ugaonim zagradama i HUD-om; izabrani datum se piše kao retro date-stamp,
 * a odabir dana okine kratak blic (kao škljoc). Popover je taman (kontrast
 * cream formi), pa se uklapa u „foto" temu.
 */
export function CameraDatePicker({
  value,
  onChange,
  placeholder = "odaberi datum",
}: {
  value: Date | null;
  onChange: (d: Date) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState(false);
  const [popLeft, setPopLeft] = useState(0);
  const [view, setView] = useState<Date>(value ?? new Date());
  const ref = useRef<HTMLSpanElement>(null);

  // Otvori i pozicioniraj popover tako da NE ispadne iz ekrana (clamp u viewport).
  function openPicker() {
    const el = ref.current;
    if (el) {
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const w = Math.min(320, vw - 40);
      let vp = r.left + r.width / 2 - w / 2; // idealno centrirano ispod triggera
      vp = Math.max(12, Math.min(vp, vw - w - 12));
      setPopLeft(vp - r.left);
    }
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const year = view.getFullYear();
  const month = view.getMonth();
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7; // pon-prvi
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const sameDay = (d: number, ref2: Date | null) =>
    !!ref2 && ref2.getFullYear() === year && ref2.getMonth() === month && ref2.getDate() === d;

  function pick(d: number) {
    onChange(new Date(year, month, d));
    setFlash(true);
    setTimeout(() => {
      setFlash(false);
      setOpen(false);
    }, 240);
  }

  function shiftMonth(delta: number) {
    setView(new Date(year, month + delta, 1));
  }

  return (
    <span ref={ref} className="relative block">
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        className="group flex w-full items-center justify-center gap-2 border-b border-ink/20 pb-2 text-lg transition-colors hover:border-ink focus:outline-none focus-visible:border-accent"
      >
        <span className="text-[0.8em] text-accent">◉</span>
        {value ? (
          <span className="tabular-nums tracking-wide text-accent">{stamp(value)}</span>
        ) : (
          <span className="text-ink/25">{placeholder}</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            style={{ left: popLeft }}
            initial={{ opacity: 0, clipPath: "circle(0% at 50% 6%)" }}
            animate={{ opacity: 1, clipPath: "circle(150% at 50% 6%)" }}
            exit={{ opacity: 0, clipPath: "circle(0% at 50% 6%)" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="absolute top-full z-50 mt-3 w-[min(20rem,calc(100vw-2.5rem))] select-none overflow-hidden border border-cream/15 bg-[#14110e] p-4 text-cream shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
          >
            {/* Ugaone zagrade viewfindera */}
            <Corners />

            {/* HUD zaglavlje: mjesec/godina + navigacija */}
            <div className="relative flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="flex h-7 w-7 items-center justify-center text-cream/60 transition-colors hover:text-cream"
                aria-label="Prethodni mjesec"
              >
                ‹
              </button>
              <div className="text-center">
                <span className="eyebrow !text-accent">{MONTHS[month]}</span>
                <span className="eyebrow ml-2 tabular-nums !text-cream/50">{year}</span>
              </div>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="flex h-7 w-7 items-center justify-center text-cream/60 transition-colors hover:text-cream"
                aria-label="Sljedeći mjesec"
              >
                ›
              </button>
            </div>

            {/* Dani u nedjelji */}
            <div className="mt-4 grid grid-cols-7 gap-1 text-center">
              {WD.map((d) => (
                <span key={d} className="text-[0.58rem] uppercase tracking-[0.12em] text-cream/35">
                  {d}
                </span>
              ))}
            </div>

            {/* Dani */}
            <div className="mt-1.5 grid grid-cols-7 gap-1">
              {cells.map((d, i) =>
                d === null ? (
                  <span key={i} />
                ) : (
                  <button
                    key={i}
                    type="button"
                    onClick={() => pick(d)}
                    className={`relative flex aspect-square items-center justify-center text-sm tabular-nums transition-colors ${
                      sameDay(d, value) ? "text-ink" : "text-cream/80 hover:text-cream"
                    }`}
                  >
                    {sameDay(d, value) && (
                      <>
                        <span className="absolute inset-[3px] bg-accent" />
                        {/* fokus reticle na izabranom danu */}
                        <span className="absolute -inset-0.5 border border-accent/70" />
                      </>
                    )}
                    <span className="relative">{d}</span>
                    {sameDay(d, today) && !sameDay(d, value) && (
                      <span className="absolute bottom-1 h-1 w-1 rounded-full bg-accent" />
                    )}
                  </button>
                ),
              )}
            </div>

            {/* HUD podnožje — metapodaci kamere */}
            <div className="mt-4 flex items-center justify-between border-t border-cream/10 pt-2.5 text-[0.55rem] uppercase tracking-[0.18em] text-cream/30">
              <span>f/1.4</span>
              <span className="text-accent/70">◉ termin</span>
              <span className="tabular-nums">1/200s</span>
            </div>

            {/* Blic pri odabiru (škljoc) */}
            <motion.div
              className="pointer-events-none absolute inset-0 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: flash ? 0.9 : 0 }}
              transition={{ duration: flash ? 0.08 : 0.25 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

function Corners() {
  const c = "pointer-events-none absolute h-3.5 w-3.5 border-cream/40";
  return (
    <>
      <span className={`${c} left-1.5 top-1.5 border-l border-t`} />
      <span className={`${c} right-1.5 top-1.5 border-r border-t`} />
      <span className={`${c} bottom-1.5 left-1.5 border-b border-l`} />
      <span className={`${c} bottom-1.5 right-1.5 border-b border-r`} />
    </>
  );
}
