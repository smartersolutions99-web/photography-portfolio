"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { revealIntro } from "@/lib/intro";
import { BlurImage } from "./BlurImage";

type Phase = "focusing" | "locked" | "flash" | "done";
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Intro „otvaranja" — simulira snimanje profesionalnom kamerom nad baš onom
 * fotografijom koja je pozadina kontakt sekcije: viewfinder + HUD, auto-fokus
 * koji „lovi" oštrinu (slika prelazi iz mutne u oštru), pa škljoc + blic, kroz
 * koji se otkriva stranica i tek tada se pojavljuju/iskucavaju njeni elementi.
 *
 * Overlay se renderuje i na serveru (show=true po defaultu) tako da NIKAD nema
 * bljeska sadržaja prije animacije. Vođen setTimeout-om (ne rAF) pa se uvijek
 * pouzdano ukloni. Igra pri svakom učitavanju stranice. Poštuje reduced-motion.
 */
export function CameraIntro({ imageUrl }: { imageUrl?: string | null }) {
  const [show, setShow] = useState(true);
  const [phase, setPhase] = useState<Phase>("focusing");
  const [dismiss, setDismiss] = useState(false);
  const [playing, setPlaying] = useState(false); // pokreće „skidanje poklopca" (iris) tek kad intro stvarno igra

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Uvijek kreni od vrha (spriječi da ostane skrolovano nakon reload-a/introa)
    window.scrollTo(0, 0);

    // Reduced-motion: preskoči intro i brzo otkrij sadržaj (overlay je pokrio prvi paint)
    if (reduce) {
      revealIntro();
      setDismiss(true);
      const t = setTimeout(() => setShow(false), 420);
      return () => clearTimeout(t);
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setPlaying(true); // „skidanje poklopca objektiva" — viewfinder se kružno otvara iz crnog

    const timers = [
      setTimeout(() => setPhase("locked"), 2600),
      setTimeout(() => setPhase("flash"), 3500),
      setTimeout(() => {
        setPhase("done");
        revealIntro(); // sadržaj kreće da se pojavljuje dok se blic gasi
      }, 3820),
      setTimeout(() => {
        setShow(false);
        document.body.style.overflow = prevOverflow;
        // Osiguraj da sadržaj počne od vrha nakon introa
        window.scrollTo(0, 0);
        try {
          window.__lenis?.scrollTo(0, { immediate: true });
        } catch {
          /* ignore */
        }
      }, 4750),
    ];

    return () => {
      timers.forEach(clearTimeout);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const flashing = phase === "flash" || phase === "done";
  const locked = phase === "locked" || flashing;
  const fadingOut = phase === "done" || dismiss;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] overflow-hidden"
          style={{ pointerEvents: fadingOut ? "none" : "auto" }}
          initial={{ opacity: 1 }}
          animate={{ opacity: fadingOut ? 0 : 1 }}
          transition={{ duration: dismiss ? 0.35 : 0.85, ease: EASE }}
          aria-hidden
        >
          {/* Fallback pozadina (dok se slika ne učita / ako je nema) */}
          <div className="absolute inset-0 bg-[#0a0908]" />

          {!flashing && (
            <div className={`absolute inset-0 viewfinder-clip${playing ? " iris-open" : ""}`}>
              {/* Fotografija koja se „snima" — lovi fokus (mutno→oštro) */}
              {imageUrl && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ filter: "blur(22px)", scale: 1.12 }}
                  animate={
                    locked
                      ? { filter: "blur(0px)", scale: 1.04 }
                      : {
                          filter: ["blur(22px)", "blur(6px)", "blur(16px)", "blur(4px)", "blur(19px)"],
                          scale: 1.1,
                        }
                  }
                  transition={
                    locked
                      ? { duration: 0.55, ease: EASE }
                      : { duration: 2.3, ease: "easeInOut", repeat: Infinity }
                  }
                >
                  <BlurImage src={imageUrl} alt="" fill priority sizes="100vw" className="object-cover" />
                </motion.div>
              )}
              {/* Zatamnjenje za čitljivost HUD-a (jače pri vrhu/dnu) */}
              <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/35 to-ink/80" />

              {/* Rule-of-thirds mreža */}
              <div className="absolute inset-0 opacity-[0.15]">
                <div className="absolute left-1/3 top-0 h-full w-px bg-cream" />
                <div className="absolute left-2/3 top-0 h-full w-px bg-cream" />
                <div className="absolute left-0 top-1/3 h-px w-full bg-cream" />
                <div className="absolute left-0 top-2/3 h-px w-full bg-cream" />
              </div>

              {/* Ugaone zagrade viewfindera */}
              <ViewfinderCorners />

              {/* HUD tekst */}
              <div className="absolute inset-0 p-5 text-cream/80 md:p-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <motion.span
                      className="block h-2 w-2 rounded-full bg-red-500"
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-[0.6rem] font-medium uppercase tracking-[0.25em]">Rec</span>
                    <span className="ml-3 text-[0.6rem] uppercase tracking-[0.25em] text-cream/50">Studio</span>
                  </div>
                  <div className="text-right text-[0.6rem] uppercase tracking-[0.22em] tabular-nums">
                    <span className={locked ? "text-accent" : "text-cream/80"}>{locked ? "AF ●" : "AF-C"}</span>
                    <span className="ml-3">f/1.4</span>
                  </div>
                </div>

                <div className="absolute inset-x-5 bottom-5 flex items-end justify-between md:inset-x-8 md:bottom-8">
                  <div className="text-[0.6rem] uppercase tracking-[0.22em] tabular-nums text-cream/70">
                    1/200s · ISO 100 · +0.3EV
                  </div>
                  <div className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.22em] text-cream/70">
                    <span className="flex h-2.5 w-5 items-center rounded-[1px] border border-cream/50 p-[1px]">
                      <span className="h-full w-full bg-cream/70" />
                    </span>
                    100%
                  </div>
                </div>
              </div>

              {/* Centralni fokus reticle */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  className="relative"
                  animate={locked ? { scale: 1 } : { scale: [1.14, 0.97, 1.14] }}
                  transition={
                    locked
                      ? { duration: 0.3, ease: EASE }
                      : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                  }
                >
                  <FocusReticle locked={locked} />
                  {phase === "locked" && (
                    <motion.span
                      className="absolute inset-0 rounded-sm border border-accent"
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 1.6, opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  )}
                </motion.div>

                <AnimatePresence>
                  {locked && (
                    <motion.p
                      className="mt-6 text-[0.6rem] uppercase tracking-[0.3em] text-accent"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      Fokus zaključan
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Blic */}
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: flashing ? 1 : 0 }}
            transition={flashing ? { duration: 0.1, delay: 0.06, ease: "easeOut" } : { duration: 0 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ViewfinderCorners() {
  const base = "absolute h-8 w-8 border-cream/70 md:h-10 md:w-10";
  return (
    <div className="pointer-events-none absolute inset-6 md:inset-10">
      <span className={`${base} left-0 top-0 border-l-2 border-t-2`} />
      <span className={`${base} right-0 top-0 border-r-2 border-t-2`} />
      <span className={`${base} bottom-0 left-0 border-b-2 border-l-2`} />
      <span className={`${base} bottom-0 right-0 border-b-2 border-r-2`} />
    </div>
  );
}

function FocusReticle({ locked }: { locked: boolean }) {
  const color = locked ? "border-accent" : "border-cream/80";
  const corner = `absolute h-4 w-4 ${color} transition-colors duration-200`;
  return (
    <div className="relative h-28 w-28 md:h-36 md:w-36">
      <span className={`${corner} left-0 top-0 border-l-2 border-t-2`} />
      <span className={`${corner} right-0 top-0 border-r-2 border-t-2`} />
      <span className={`${corner} bottom-0 left-0 border-b-2 border-l-2`} />
      <span className={`${corner} bottom-0 right-0 border-b-2 border-r-2`} />
      <span className={`absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 ${locked ? "bg-accent" : "bg-cream/70"}`} />
      <span className={`absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 ${locked ? "bg-accent" : "bg-cream/70"}`} />
    </div>
  );
}
