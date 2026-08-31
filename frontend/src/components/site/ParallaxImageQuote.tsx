"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { BlurImage } from "./BlurImage";

/** Full-bleed slika sa parallaxom i elegantnim citatom preko nje. */
export function ParallaxImageQuote({
  imageUrl,
  quote,
  source,
}: {
  imageUrl: string | null;
  quote: string;
  source?: string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section ref={ref} className="relative flex h-[85svh] min-h-[500px] items-center overflow-hidden bg-ink">
      <motion.div style={{ y }} className="absolute inset-[-8%]">
        {imageUrl && <BlurImage src={imageUrl} alt="" fill sizes="100vw" className="object-cover" />}
      </motion.div>
      <div className="absolute inset-0 bg-ink/55" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        {source && (
          <motion.p
            className="eyebrow !text-cream/60"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {source}
          </motion.p>
        )}
        <motion.p
          className="display-serif mt-6 text-3xl leading-tight text-cream md:text-6xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          „{quote}”
        </motion.p>
      </div>
    </section>
  );
}
