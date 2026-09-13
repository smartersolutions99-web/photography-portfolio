"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ContactInfo } from "@/lib/types";

const NAV = [
  { href: "/", label: "Početna" },
  { href: "/galerija", label: "Galerija" },
  { href: "/kategorije", label: "Kategorije" },
  { href: "/o-nama", label: "O meni" },
  { href: "/kontakt", label: "Kontakt" },
];

export function Header({ siteName, contact }: { siteName: string; contact: ContactInfo }) {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 80) {
        setHidden(false);
      } else if (y > lastY.current + 4) {
        setHidden(true); // skroluje nadole -> sakrij
      } else if (y < lastY.current - 4) {
        setHidden(false); // skroluje nagore -> prikaži
      }
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[60] border-b border-cream/10 bg-ink text-cream transition-transform duration-500 ${
          hidden && !open ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-10 md:py-6">
          <Link href="/" className="display-cond text-lg tracking-widest">
            {siteName}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="group flex items-center gap-3"
            aria-label={open ? "Zatvori meni" : "Otvori meni"}
          >
            <span className="eyebrow !text-current">{open ? "Zatvori" : "Meni"}</span>
            <span className="relative block h-3 w-7">
              <span
                className={`absolute left-0 block h-px w-7 bg-current transition-all duration-300 ${
                  open ? "top-1.5 rotate-45" : "top-0 group-hover:top-0.5"
                }`}
              />
              <span
                className={`absolute left-0 block h-px w-7 bg-current transition-all duration-300 ${
                  open ? "top-1.5 -rotate-45" : "top-3 group-hover:top-2.5"
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto bg-ink"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="mx-auto flex min-h-full max-w-[1400px] flex-col px-5 pb-8 pt-24 md:px-10 md:pt-32">
              <div className="grid flex-1 items-center gap-14 md:grid-cols-[1.5fr_1fr]">
                {/* Linkovi */}
                <nav>
                  <ul>
                    {NAV.map((item, i) => {
                      const active = pathname === item.href;
                      return (
                        <li key={item.href} className="overflow-hidden">
                          <motion.div
                            initial={{ y: "110%" }}
                            animate={{ y: 0 }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 + i * 0.06 }}
                          >
                            <Link
                              href={item.href}
                              className="group flex items-baseline gap-4 py-1 md:gap-6"
                            >
                              <span className="w-6 text-xs tabular-nums text-cream/40">0{i + 1}</span>
                              <span
                                className={`display-serif text-4xl transition-all duration-500 group-hover:translate-x-3 md:text-7xl ${
                                  active ? "text-cream" : "text-cream/70 group-hover:text-cream"
                                }`}
                              >
                                {item.label}
                              </span>
                            </Link>
                          </motion.div>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Kontakt blok */}
                <motion.div
                  className="border-cream/15 md:border-l md:pl-14"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <p className="eyebrow !text-cream/40">Kontakt</p>
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="display-serif mt-4 block text-2xl text-cream/90 hover:text-cream md:text-3xl"
                    >
                      {contact.email}
                    </a>
                  )}
                  {contact.location && <p className="mt-6 text-sm text-cream/60">{contact.location}</p>}
                  {contact.phone && <p className="mt-1 text-sm text-cream/60">{contact.phone}</p>}

                  <div className="mt-8 flex gap-6">
                    {contact.instagramUrl && (
                      <a href={contact.instagramUrl} target="_blank" rel="noreferrer" className="eyebrow !text-cream/60 hover:!text-cream">
                        Instagram
                      </a>
                    )}
                    {contact.facebookUrl && (
                      <a href={contact.facebookUrl} target="_blank" rel="noreferrer" className="eyebrow !text-cream/60 hover:!text-cream">
                        Facebook
                      </a>
                    )}
                  </div>
                </motion.div>
              </div>

              <div className="mt-10 flex flex-col justify-between gap-2 border-t border-cream/15 pt-6 text-cream/40 sm:flex-row sm:items-center">
                <span className="display-cond tracking-widest">{siteName}</span>
                <span className="text-xs">{contact.tagline ?? "Fotografija koja pripovijeda"}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
