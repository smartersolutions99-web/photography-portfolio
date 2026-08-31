"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useIntroReveal } from "@/lib/intro";
import { smoothScrollTo } from "@/lib/scroll";
import type { ContactInfo } from "@/lib/types";
import { BlurImage } from "./BlurImage";
import { ContactForm } from "./ContactForm";
import { Typewriter } from "./Typewriter";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Prva sekcija — „kontakt-first". Full-bleed fotografija sa poziv-tekstom lijevo i
 * kontakt formom u punom cream panelu desno (ugrađen kao kolona, ne zalijepljen).
 * Ulazne animacije čekaju da intro „otkrije" stranicu (useIntroReveal), pa se
 * elementi pojavljuju nakon blica, a naslov se iskucava.
 */
export function ContactHero({
  contact,
  imageUrl,
  targetId,
}: {
  contact: ContactInfo;
  imageUrl: string | null;
  targetId: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const ready = useIntroReveal();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  // Gated „rise" animacija — kreće tek kad je stranica otkrivena
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    transition: { duration: 0.8, ease: EASE, delay },
  });

  return (
    <section ref={ref} className="relative w-full overflow-hidden bg-ink">
      {/* Fotografija u pozadini + parallax */}
      <motion.div style={{ y, scale }} className="absolute inset-0">
        {imageUrl && (
          <BlurImage src={imageUrl} alt="Fotografija iz portfolija" fill priority sizes="100vw" className="object-cover" />
        )}
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/55 to-ink/20" />

      {/* Grid: tekst preko fotografije | cream panel sa formom */}
      <div className="relative z-10 grid lg:min-h-[100svh] lg:grid-cols-[1fr_minmax(380px,44%)]">
        {/* Lijevo — poziv preko fotografije */}
        <div className="flex min-h-[64svh] flex-col justify-center px-5 pb-20 pt-28 text-cream md:px-10 lg:min-h-0 lg:pb-16">
          <motion.div className="flex items-center gap-2.5" {...rise(0.05)}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="eyebrow !text-cream/70">Dostupno za nove termine</span>
          </motion.div>

          <h1 className="display-serif mt-6 text-5xl leading-[0.98] sm:text-6xl md:text-7xl xl:text-8xl">
            <Typewriter text="Zabilježimo vašu priču." start={ready} speed={55} caretClassName="text-accent" />
          </h1>

          <motion.p className="mt-6 max-w-md text-base leading-relaxed text-cream/80 md:text-lg" {...rise(1.35)}>
            {contact.tagline ?? "Vjenčanja, portreti i pejzaži — ispričani sa stilom i emocijom."}
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-cream/70"
            {...rise(1.55)}
          >
            {contact.email && (
              <a href={`mailto:${contact.email}`} data-cursor="view" className="link-underline !text-cream">
                {contact.email}
              </a>
            )}
            {contact.phone && <span className="text-cream/30">/</span>}
            {contact.phone && <span>{contact.phone}</span>}
          </motion.div>
        </div>

        {/* Desno — cream panel sa formom (puna visina kolone, ugrađen) */}
        <motion.aside
          className="flex flex-col justify-center border-t border-line bg-cream px-6 py-14 sm:px-10 lg:border-l lg:border-t-0 lg:px-12"
          initial={{ opacity: 0, x: 48 }}
          animate={ready ? { opacity: 1, x: 0 } : { opacity: 0, x: 48 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
        >
          <p className="eyebrow">Pošaljite upit</p>
          <p className="display-serif mt-2 text-3xl text-ink md:text-4xl">Zakažite termin</p>
          <p className="mt-3 text-sm text-muted">Odgovaram u najkraćem mogućem roku.</p>
          <div className="mt-7">
            <ContactForm compact />
          </div>
        </motion.aside>
      </div>

      {/* Scroll cue */}
      <motion.button
        type="button"
        onClick={() => smoothScrollTo(targetId)}
        className="group absolute bottom-7 left-5 z-20 hidden items-center gap-4 md:left-10 md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        aria-label="Skrolujte do radova"
      >
        <span className="eyebrow !text-cream/70 transition-colors group-hover:!text-cream">Pogledaj radove</span>
        <span className="relative block h-10 w-px overflow-hidden bg-cream/25">
          <motion.span
            className="absolute inset-x-0 top-0 block h-4 w-px bg-cream"
            animate={{ y: ["-100%", "260%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.button>
    </section>
  );
}
