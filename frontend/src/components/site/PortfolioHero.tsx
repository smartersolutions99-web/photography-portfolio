"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useIntroReveal } from "@/lib/intro";
import { smoothScrollTo } from "@/lib/scroll";
import { BlurImage } from "./BlurImage";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Početni hero — velika fotografija preko cijelog ekrana, ime studija + citat,
 * metapodaci i suptilni CTA. Ulazne animacije čekaju da intro „otkrije" stranicu.
 */
export function PortfolioHero({
  imageUrl,
  name,
  statement,
  location,
  specialties = [],
  targetId,
}: {
  imageUrl: string | null;
  name: string;
  statement: string | null;
  location: string | null;
  specialties?: string[];
  targetId: string;
}) {
  const ready = useIntroReveal();
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 22 },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 },
    transition: { duration: 0.9, ease: EASE, delay },
  });

  return (
    <section
      data-header-theme="dark"
      className="relative min-h-[100svh] w-full overflow-hidden bg-ink"
    >
      {/* Fotografija */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08 }}
        animate={{ scale: ready ? 1 : 1.08 }}
        transition={{ duration: 1.6, ease: EASE }}
        style={{ willChange: "transform" }}
      >
        {imageUrl && (
          <BlurImage src={imageUrl} alt="Fotografija iz portfolija" fill priority sizes="100vw" className="object-cover" />
        )}
      </motion.div>
      {/* Blagi overlay — samo zbog čitljivosti, fotografija ostaje glavna */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/15 to-ink/30" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1500px] flex-col items-center justify-center px-5 pb-24 pt-28 text-center text-cream md:px-10">
        <motion.p className="eyebrow !text-cream/75" {...rise(0.05)}>
          {specialties.length > 0 ? specialties.join(" · ") : "Fotografski studio"}
          {location ? ` · ${location}` : ""}
        </motion.p>

        <h1 className="mt-7 text-cream" aria-label={name}>
          <MaskReveal text={name.toUpperCase()} ready={ready} />
        </h1>

        {statement && (
          <motion.p
            className="mt-8 max-w-xl text-base font-light leading-[1.7] text-cream/85 md:text-lg"
            {...rise(0.9)}
          >
            {statement}
          </motion.p>
        )}

        <motion.div className="mt-11" {...rise(1.05)}>
          <Link
            href="/kontakt"
            data-cursor="view"
            className="eyebrow group inline-flex items-center gap-3 border border-cream/40 px-10 py-4 !text-cream transition-colors duration-500 hover:bg-cream hover:!text-ink"
          >
            Kontaktirajte nas
            <span aria-hidden className="transition-transform duration-500 ease-editorial group-hover:translate-x-1">→</span>
          </Link>
        </motion.div>
      </div>

      {/* Scroll cue — suptilno, centrirano */}
      <motion.button
        type="button"
        onClick={() => smoothScrollTo(targetId)}
        className="group absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 text-cream md:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: 0.9, delay: 1.25 }}
        aria-label="Skrolujte do radova"
      >
        <span className="eyebrow !text-[0.6rem] !text-cream/70 transition-colors group-hover:!text-cream">Skrolujte</span>
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

/** Naslov — riječi se dižu iz maske kada je stranica otkrivena. */
function MaskReveal({ text, ready }: { text: string; ready: boolean }) {
  const words = text.split(/\s+/);
  return (
    <span className="display-caps flex flex-wrap justify-center gap-x-[0.22em] text-6xl leading-[0.95] md:text-8xl lg:text-[8.5rem]">
      {words.map((w, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className="inline-block"
            initial={{ y: "115%" }}
            animate={{ y: ready ? 0 : "115%" }}
            transition={{ duration: 1, ease: EASE, delay: 0.35 + i * 0.08 }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
