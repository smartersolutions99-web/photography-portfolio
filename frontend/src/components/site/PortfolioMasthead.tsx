"use client";

import { motion, type Variants } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

// Okidač je na kontejneru (koji se NE pomjera) pa staggerChildren diže slova —
// tako se izbjegava bug gdje pomjereno slovo „ispadne" iz vidnog polja i nikad se ne okine.
const nameContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } },
};
const nameLetter: Variants = {
  hidden: { y: "112%" },
  show: { y: 0, transition: { duration: 0.85, ease: EASE } },
};

/**
 * Editorial „masthead" nakon kontakt hero-a: ime studija full-width (slova se
 * kaskadno dižu), tanka metadata traka i uvodna izjava pomjerena desno.
 * Tijesna kompozicija — bez praznina, čist kontrast tamnom foto hero-u iznad.
 */
export function PortfolioMasthead({
  name,
  tagline,
  statement,
  location,
}: {
  name: string;
  tagline: string | null;
  statement: string | null;
  location: string | null;
}) {
  const letters = [...name.toUpperCase()];

  return (
    <section className="bg-cream px-5 pb-20 pt-28 md:px-10 md:pb-28 md:pt-36">
      <div className="mx-auto max-w-[1600px]">
        {/* Metadata traka */}
        <div className="grid grid-cols-2 items-center gap-3 border-t border-ink/15 pt-5 md:grid-cols-3">
          <span className="eyebrow">Fotografski studio</span>
          {tagline && <span className="eyebrow hidden !text-ink/50 md:block md:text-center">{tagline}</span>}
          <span className="eyebrow text-right !text-ink/50">{location ?? "Crna Gora"}</span>
        </div>

        {/* Ime — full width, kaskadno dizanje slova */}
        <motion.h2
          className="display-serif mt-10 flex flex-wrap leading-[0.82] tracking-[-0.035em] text-[clamp(3rem,14vw,13rem)] md:mt-14"
          variants={nameContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {letters.map((ch, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.06em]">
              <motion.span className="inline-block" variants={nameLetter}>
                {ch === " " ? " " : ch}
              </motion.span>
            </span>
          ))}
        </motion.h2>

        {/* Uvodna izjava — desna kolona, tijesno ispod imena */}
        {statement && (
          <div className="mt-10 grid md:mt-12 md:grid-cols-12">
            <motion.p
              className="display-serif text-2xl leading-[1.14] md:col-span-6 md:col-start-7 md:text-[2.4rem]"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
            >
              {statement}
            </motion.p>
          </div>
        )}
      </div>
    </section>
  );
}
