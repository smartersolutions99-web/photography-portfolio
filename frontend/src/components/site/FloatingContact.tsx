"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Suptilan, uvijek-dostupan kontakt link. Pojavi se tek nakon što korisnik
 * malo skroluje (da ne smeta hero sekciji), a sakriven je na samoj /kontakt
 * strani gdje bi bio suvišan. Diskretan, ali na dohvat ruke sa svake stranice.
 */
export function FloatingContact() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hidden = pathname === "/kontakt";

  return (
    <AnimatePresence>
      {show && !hidden && (
        <motion.div
          className="fixed bottom-5 right-5 z-40 md:bottom-8 md:right-8"
          initial={{ opacity: 0, y: 16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.92 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href="/kontakt"
            data-cursor="view"
            className="group flex items-center gap-2.5 rounded-full border border-ink/15 bg-cream/70 py-2.5 pl-4 pr-3.5 shadow-[0_8px_30px_rgba(20,17,14,0.08)] backdrop-blur-md transition-colors duration-500 hover:bg-ink"
            aria-label="Kontakt"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <span className="eyebrow !text-[0.6rem] !text-ink transition-colors duration-500 group-hover:!text-cream">
              Kontaktirajte nas
            </span>
            <span className="text-ink transition-all duration-500 ease-editorial group-hover:translate-x-0.5 group-hover:text-cream">
              →
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
