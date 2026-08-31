"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import { useIntroReveal } from "@/lib/intro";
import { smoothScrollTo } from "@/lib/scroll";
import type { ContactInfo } from "@/lib/types";
import { BlurImage } from "./BlurImage";
import { ContactForm } from "./ContactForm";
import { Typewriter } from "./Typewriter";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Kontakt-first hero koji se, dok se skrola, pretvara u „masthead": ista
 * fotografija ostaje zakačena (sticky), kontakt forma nestaje, a preko slike
 * doplovi ime studija + citat. Zatim se sajt nastavlja kao do sada.
 */
export function ContactMasthead({
  contact,
  imageUrl,
  name,
  statement,
  location,
  specialties = [],
  targetId,
}: {
  contact: ContactInfo;
  imageUrl: string | null;
  name: string;
  statement: string | null;
  location: string | null;
  specialties?: string[];
  targetId: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const ready = useIntroReveal();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Crossfade kontakt -> masthead
  const contactOpacity = useTransform(scrollYProgress, [0, 0.16, 0.32], [1, 1, 0]);
  const contactPe = useTransform(scrollYProgress, (v) => (v < 0.22 ? "auto" : "none"));
  const mastheadOpacity = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);
  const mastheadY = useTransform(scrollYProgress, [0.3, 0.55], [60, 0]);
  const mastheadPe = useTransform(scrollYProgress, (v) => (v > 0.42 ? "auto" : "none"));
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  // Suptilni zoom fotografije i produbljenje scrima za čitljivost mastheada
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);
  const scrimExtra = useTransform(scrollYProgress, [0.1, 0.45], [0, 0.9]);

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    transition: { duration: 0.8, ease: EASE, delay },
  });

  return (
    <section ref={ref} className="relative h-[185vh] bg-ink lg:h-[195vh]">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* Fotografija (ostaje zakačena) */}
        <motion.div style={{ scale: imgScale }} className="absolute inset-0">
          {imageUrl && (
            <BlurImage src={imageUrl} alt="Fotografija iz portfolija" fill priority sizes="100vw" className="object-cover" />
          )}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/50 to-ink/25" />
        {/* Dodatni scrim za masthead — tamni desnu stranu (gdje je STUDIO+citat) radi čitljivosti */}
        <motion.div style={{ opacity: scrimExtra }} className="absolute inset-0 bg-gradient-to-l from-ink via-ink/45 to-transparent" />

        {/* Sloj A — kontakt */}
        <motion.div style={{ opacity: contactOpacity, pointerEvents: contactPe }} className="absolute inset-0">
          <div className="mx-auto grid h-full max-w-[1500px] items-center gap-8 px-5 pb-10 pt-24 md:px-10 lg:gap-12 lg:pb-0 lg:pt-0 lg:grid-cols-[1fr_minmax(360px,42%)]">
            <div className="text-cream">
              <motion.div className="flex items-center gap-2.5" {...rise(0.05)}>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                <span className="eyebrow !text-cream/70">Dostupno za nove termine</span>
              </motion.div>

              <h1 className="display-serif mt-5 text-4xl leading-[0.98] sm:text-5xl md:text-6xl lg:text-7xl">
                <Typewriter text="Zabilježimo vašu priču." start={ready} speed={55} caretClassName="text-accent" />
              </h1>

              <motion.div
                className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-cream/70"
                {...rise(1.4)}
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

            {/* Forma */}
            <motion.div
              className="border border-cream/15 bg-cream/95 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.4)] backdrop-blur-md sm:p-7 lg:p-8"
              initial={{ opacity: 0, y: 30 }}
              animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.5 }}
            >
              <p className="eyebrow">Pošaljite upit</p>
              <p className="display-serif mt-1 text-2xl text-ink md:text-3xl">Zakažite termin</p>
              <div className="mt-5">
                <ContactForm compact />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Sloj B — masthead (ime studija + citat) preko iste slike */}
        <motion.div
          style={{ opacity: mastheadOpacity, y: mastheadY, pointerEvents: mastheadPe }}
          className="absolute inset-0"
        >
          <div className="relative mx-auto h-full max-w-[1500px] px-5 md:px-10">
            {/* Desno — ime studija + citat */}
            <div className="flex h-full items-center justify-end">
              <div className="md:max-w-[42rem] md:text-right">
                <div className="flex items-center gap-3 md:justify-end">
                  <span className="h-px w-10 bg-accent" />
                  <p className="eyebrow !text-cream/70">Fotografski studio{location ? ` · ${location}` : ""}</p>
                </div>
                <h2 className="display-serif mt-5 text-6xl leading-[0.88] text-cream md:text-8xl lg:text-9xl">
                  {name.toUpperCase()}
                </h2>
                {statement && (
                  <p className="mt-7 text-xl leading-[1.35] text-cream/85 md:text-2xl">{statement}</p>
                )}
                <Link
                  href={targetId ? `#${targetId}` : "/galerija"}
                  onClick={(e) => {
                    e.preventDefault();
                    smoothScrollTo(targetId);
                  }}
                  data-cursor="view"
                  className="eyebrow mt-9 inline-flex items-center gap-3 !text-cream/80 transition-colors hover:!text-cream"
                >
                  Pogledaj radove
                  <span aria-hidden>↓</span>
                </Link>
              </div>
            </div>

            {/* Dole lijevo — specijalnosti + kontakt CTA (balansira „STUDIO", puni prazninu) */}
            <div className="absolute bottom-10 left-5 hidden text-cream md:left-10 md:block">
              {specialties.length > 0 && (
                <>
                  <p className="eyebrow !text-cream/50">Specijalnosti</p>
                  <ul className="mt-3 space-y-0.5">
                    {specialties.map((s) => (
                      <li key={s} className="display-serif text-xl leading-tight text-cream/90 lg:text-2xl">
                        {s}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <Link
                href="/kontakt"
                data-cursor="view"
                className="group mt-7 inline-flex items-center gap-3 border border-cream/40 px-7 py-4 transition-colors duration-500 hover:bg-cream"
              >
                <span className="eyebrow !text-cream transition-colors duration-500 group-hover:!text-ink">
                  Kontaktirajte nas
                </span>
                <span
                  aria-hidden
                  className="text-cream transition-all duration-500 ease-editorial group-hover:translate-x-1 group-hover:text-ink"
                >
                  →
                </span>
              </Link>

              {(contact.instagramUrl || contact.facebookUrl) && (
                <div className="mt-6 flex gap-5">
                  {contact.instagramUrl && (
                    <a
                      href={contact.instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="eyebrow !text-cream/60 hover:!text-cream"
                    >
                      Instagram
                    </a>
                  )}
                  {contact.facebookUrl && (
                    <a
                      href={contact.facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="eyebrow !text-cream/60 hover:!text-cream"
                    >
                      Facebook
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Scroll cue (vidljiv u kontakt stanju) */}
        <motion.button
          type="button"
          style={{ opacity: cueOpacity }}
          onClick={() => smoothScrollTo(targetId)}
          className="group absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-4 md:left-10 md:flex md:translate-x-0"
          aria-label="Skrolujte"
        >
          <span className="eyebrow !text-cream/70 transition-colors group-hover:!text-cream">Skrolujte</span>
          <span className="relative block h-10 w-px overflow-hidden bg-cream/25">
            <motion.span
              className="absolute inset-x-0 top-0 block h-4 w-px bg-cream"
              animate={{ y: ["-100%", "260%"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
        </motion.button>
      </div>
    </section>
  );
}
