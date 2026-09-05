"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ContactInfo } from "@/lib/types";

const NAV = [
  { href: "/", label: "Početna" },
  { href: "/galerija", label: "Galerija" },
  { href: "/kategorije", label: "Portfolio" },
  { href: "/o-nama", label: "O meni" },
  { href: "/kontakt", label: "Kontakt" },
];

// Desktop: split nav oko centriranog logotipa.
const LEFT = [
  { href: "/galerija", label: "Galerija" },
  { href: "/kategorije", label: "Portfolio" },
];
const RIGHT = [
  { href: "/o-nama", label: "O meni" },
  { href: "/kontakt", label: "Kontakt" },
];

export function Header({ siteName, contact }: { siteName: string; contact: ContactInfo }) {
  const [dark, setDark] = useState(true); // hero je taman → svijetli tekst na startu
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Boja teksta prati pozadinu ispod headera: preko [data-header-theme="dark"]
  // sekcija tekst je svijetao, inače taman.
  useEffect(() => {
    const LINE = 34;
    const update = () => {
      let isDark = false;
      document.querySelectorAll('[data-header-theme="dark"]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= LINE && r.bottom > LINE) isDark = true;
      });
      setDark(isDark);
    };
    update();
    const t = setTimeout(update, 120); // nakon učitavanja / promjene rute
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const light = open || dark; // svijetli tekst kad je meni otvoren ili preko tamne sekcije
  const tone = light ? "text-cream" : "text-ink";
  const borderCls = open ? "border-transparent" : dark ? "border-cream/20" : "border-ink/10";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[60] border-b bg-transparent transition-colors duration-500 ${borderCls}`}
      >
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-5 md:grid md:grid-cols-[1fr_auto_1fr] md:px-10 md:py-6">
          {/* Lijevi nav (desktop) */}
          <nav className="hidden md:flex md:items-center md:gap-10">
            {LEFT.map((item) => (
              <NavLink key={item.href} href={item.href} active={pathname === item.href} light={light}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Logo / ime studija — centar na desktopu, lijevo na mobile */}
          <Link
            href="/"
            className={`display-cond text-base tracking-[0.24em] transition-colors md:justify-self-center md:text-xl ${tone}`}
          >
            {siteName}
          </Link>

          {/* Desni nav (desktop) */}
          <nav className="hidden md:flex md:items-center md:justify-end md:gap-10">
            {RIGHT.map((item) => (
              <NavLink key={item.href} href={item.href} active={pathname === item.href} light={light}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`group flex items-center gap-3 transition-colors md:hidden ${tone}`}
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
            className="fixed inset-0 z-50 overflow-y-auto bg-dark md:hidden"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="mx-auto flex min-h-full max-w-[1400px] flex-col px-6 pb-10 pt-24">
              <nav className="flex-1">
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
                          <Link href={item.href} className="group flex items-baseline gap-4 py-2">
                            <span className="w-6 text-xs tabular-nums text-cream/35">0{i + 1}</span>
                            <span
                              className={`display-serif text-4xl transition-all duration-500 group-hover:translate-x-2 ${
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

              <motion.div
                className="mt-10 border-t border-cream/15 pt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <p className="eyebrow !text-cream/40">Kontakt</p>
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="display-serif mt-3 block text-2xl text-cream/90 hover:text-cream"
                  >
                    {contact.email}
                  </a>
                )}
                {contact.location && <p className="mt-4 text-sm text-cream/60">{contact.location}</p>}
                <div className="mt-6 flex gap-6">
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({
  href,
  active,
  light,
  children,
}: {
  href: string;
  active: boolean;
  light: boolean;
  children: React.ReactNode;
}) {
  const color = active
    ? light
      ? "!text-cream"
      : "!text-ink"
    : light
      ? "!text-cream/70 hover:!text-cream"
      : "!text-ink/60 hover:!text-ink";
  return (
    <Link href={href} className={`eyebrow !text-[0.62rem] transition-colors duration-500 ${color}`}>
      {children}
    </Link>
  );
}
