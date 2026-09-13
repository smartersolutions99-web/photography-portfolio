"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/types";
import { BlurImage } from "./BlurImage";
import { FilmGrain } from "./FilmGrain";

const EASE = [0.22, 1, 0.36, 1] as const;
const HOLD_MS = 650; // koliko dugo treba držati dugme da se prsten napuni i sam okine
const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Punoekranski, imerzivni "viewfinder" za najbolje radove — ista vizuelna
 * gramatika kao CameraIntro (rule-of-thirds, ugaone zagrade, HUD), ali sad
 * preko cijele širine ekrana. Drži dugme da „fokusiraš" (prsten se puni),
 * pusti (ili sačekaj da se prsten napuni) da „okineš": blic -> sljedeća slika.
 * Tastatura: razmak/enter = okini, strelice = pregledaj.
 */
export function PortfolioCamera({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0);
  const [flash, setFlash] = useState(false);
  const [charging, setCharging] = useState(false);
  const [shots, setShots] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Suptilan paralaks slike — prati kursor preko cijelog frejma.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 50, damping: 18 });
  const smy = useSpring(my, { stiffness: 50, damping: 18 });
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      if (holdTimer.current) clearTimeout(holdTimer.current);
    },
    [],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        shoot();
      } else if (e.key === "ArrowRight") {
        setIndex((i) => (i + 1) % photos.length);
      } else if (e.key === "ArrowLeft") {
        setIndex((i) => (i - 1 + photos.length) % photos.length);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos.length]);

  if (photos.length === 0) return null;
  const photo = photos[index];

  function onFrameMouseMove(e: React.MouseEvent) {
    const el = frameRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    mx.set(px * -10);
    my.set(py * -10);
  }
  function onFrameMouseLeave() {
    mx.set(0);
    my.set(0);
  }

  function shoot() {
    setFlash(true);
    setShots((s) => s + 1);
    timers.current.push(
      setTimeout(() => setIndex((i) => (i + 1) % photos.length), 110),
      setTimeout(() => setFlash(false), 170),
    );
  }

  function startCharge() {
    setCharging(true);
    holdTimer.current = setTimeout(() => {
      shoot();
      setCharging(false);
    }, HOLD_MS);
  }
  function releaseCharge(fire: boolean) {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (charging && fire) shoot();
    setCharging(false);
  }

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2">
      <div
        ref={frameRef}
        onMouseMove={onFrameMouseMove}
        onMouseLeave={onFrameMouseLeave}
        className="relative h-[70vh] w-full overflow-hidden bg-ink md:h-[85vh]"
      >
        {/* Fotografija — sa paralaksom */}
        <AnimatePresence mode="wait">
          <motion.div
            key={photo.id}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <motion.div className="absolute -inset-3" style={{ x: smx, y: smy }}>
              <BlurImage
                src={photo.url}
                alt={photo.title ?? "Fotografija iz portfolija"}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Scrim za čitljivost HUD-a */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/70 via-transparent to-ink/85" />

        <FilmGrain opacity={0.05} />

        {/* Rule-of-thirds mreža */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.15]">
          <div className="absolute left-1/3 top-0 h-full w-px bg-cream" />
          <div className="absolute left-2/3 top-0 h-full w-px bg-cream" />
          <div className="absolute left-0 top-1/3 h-px w-full bg-cream" />
          <div className="absolute left-0 top-2/3 h-px w-full bg-cream" />
        </div>

        {/* Ugaone zagrade viewfindera */}
        <ViewfinderCorners />

        {/* HUD — gornja traka */}
        <div className="pointer-events-none absolute inset-x-5 top-5 flex items-start justify-between text-cream/80 md:inset-x-10 md:top-8">
          <div className="flex items-center gap-2">
            <motion.span
              className="block h-2 w-2 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
            <span className="text-[0.6rem] uppercase tracking-[0.25em]">Live</span>
            <span className="ml-3 hidden text-[0.6rem] uppercase tracking-[0.25em] text-cream/50 sm:inline">
              Portfolio
            </span>
          </div>
          <div className="text-right text-[0.6rem] uppercase tracking-[0.22em] tabular-nums text-cream/70">
            {String(index + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
          </div>
        </div>

        {/* HUD — natpis fotografije */}
        <div className="pointer-events-none absolute inset-x-5 bottom-28 md:inset-x-10 md:bottom-36">
          <AnimatePresence mode="wait">
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              {photo.categoryName && (
                <p className="text-[0.6rem] uppercase tracking-[0.25em] text-accent">{photo.categoryName}</p>
              )}
              <p className="display-serif mt-1 text-3xl text-cream md:text-5xl">{photo.title ?? "Bez naziva"}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Broj snimaka */}
        <div className="pointer-events-none absolute bottom-8 right-5 text-[0.6rem] uppercase tracking-[0.22em] tabular-nums text-cream/40 md:right-10 md:bottom-10">
          {shots} {shots === 1 ? "snimak" : "snimaka"}
        </div>

        {/* Uputstvo prije prvog klika */}
        <div className="pointer-events-none absolute bottom-8 left-5 text-[0.6rem] uppercase tracking-[0.22em] text-cream/40 md:left-10 md:bottom-10">
          <AnimatePresence>
            {shots === 0 && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                Drži dugme da fokusiraš
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Dugme za okidanje — drži da napuniš prsten, pusti da okineš */}
        <div className="absolute inset-x-0 bottom-6 flex justify-center md:bottom-10">
          <button
            type="button"
            onMouseDown={startCharge}
            onMouseUp={() => releaseCharge(true)}
            onMouseLeave={() => releaseCharge(false)}
            onTouchStart={(e) => {
              e.preventDefault();
              startCharge();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              releaseCharge(true);
            }}
            aria-label="Drži da fokusiraš, pusti da okineš"
            className="group relative flex h-[4.5rem] w-[4.5rem] cursor-pointer items-center justify-center rounded-full border-2 border-cream/70 transition-transform duration-150 active:scale-95 md:h-20 md:w-20"
          >
            {shots === 0 && !charging && (
              <span className="absolute inset-0 animate-ping rounded-full border-2 border-cream/60" />
            )}
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80" aria-hidden>
              <motion.circle
                cx="40"
                cy="40"
                r={RADIUS}
                fill="none"
                stroke="#9A7B4F"
                strokeWidth="2.5"
                strokeDasharray={CIRCUMFERENCE}
                initial={{ strokeDashoffset: CIRCUMFERENCE }}
                animate={{ strokeDashoffset: charging ? 0 : CIRCUMFERENCE }}
                transition={{ duration: charging ? HOLD_MS / 1000 : 0.25, ease: "linear" }}
              />
            </svg>
            <motion.span
              className="h-[80%] w-[80%] rounded-full bg-cream"
              animate={{ scale: charging ? 0.82 : 1 }}
              transition={{ duration: 0.3, ease: EASE }}
            />
          </button>
        </div>

        {/* Blic */}
        <motion.div
          className="pointer-events-none absolute inset-0 bg-white"
          animate={{ opacity: flash ? 1 : 0 }}
          transition={{ duration: flash ? 0.08 : 0.35, ease: flash ? "easeOut" : "easeIn" }}
        />
      </div>
    </div>
  );
}

function ViewfinderCorners() {
  const base = "pointer-events-none absolute h-8 w-8 border-cream/70 md:h-12 md:w-12";
  return (
    <div className="pointer-events-none absolute inset-2 md:inset-3">
      <span className={`${base} left-0 top-0 border-l-2 border-t-2`} />
      <span className={`${base} right-0 top-0 border-r-2 border-t-2`} />
      <span className={`${base} bottom-0 left-0 border-b-2 border-l-2`} />
      <span className={`${base} bottom-0 right-0 border-b-2 border-r-2`} />
    </div>
  );
}
