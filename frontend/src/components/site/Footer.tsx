import Link from "next/link";
import type { ContactInfo } from "@/lib/types";
import { ContactForm } from "./ContactForm";
import { Reveal } from "./Reveal";

const NAV = [
  { href: "/", label: "Početna" },
  { href: "/galerija", label: "Galerija" },
  { href: "/kategorije", label: "Kategorije" },
  { href: "/o-nama", label: "O meni" },
  { href: "/kontakt", label: "Kontakt" },
];

export function Footer({ contact }: { contact: ContactInfo }) {
  const year = new Date().getFullYear();
  const siteName = contact.siteName ?? "STUDIO";

  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-14 md:grid-cols-2 md:gap-20">
          {/* Poziv + kontakt info */}
          <div>
            <Reveal>
              <p className="eyebrow !text-cream/50">Imate projekat na umu?</p>
              <p className="display-serif mt-4 text-5xl leading-[1.05] md:text-7xl">Kontaktirajte nas</p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-10 space-y-6">
                {contact.email && (
                  <div>
                    <p className="eyebrow !text-cream/40">Email</p>
                    <a
                      href={`mailto:${contact.email}`}
                      className="link-underline mt-1 inline-block text-lg text-cream/90 hover:text-cream"
                    >
                      {contact.email}
                    </a>
                  </div>
                )}
                <div className="flex flex-wrap gap-x-10 gap-y-6">
                  {contact.phone && (
                    <div>
                      <p className="eyebrow !text-cream/40">Telefon</p>
                      <p className="mt-1 text-lg text-cream/90">{contact.phone}</p>
                    </div>
                  )}
                  {contact.location && (
                    <div>
                      <p className="eyebrow !text-cream/40">Lokacija</p>
                      <p className="mt-1 text-lg text-cream/90">{contact.location}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-6 pt-2">
                  {contact.instagramUrl && (
                    <a href={contact.instagramUrl} target="_blank" rel="noreferrer" className="eyebrow !text-cream/70 hover:!text-cream">
                      Instagram
                    </a>
                  )}
                  {contact.facebookUrl && (
                    <a href={contact.facebookUrl} target="_blank" rel="noreferrer" className="eyebrow !text-cream/70 hover:!text-cream">
                      Facebook
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          </div>

          {/* Brza forma */}
          <Reveal delay={0.15}>
            <p className="eyebrow !text-cream/50">Brzi upit</p>
            <div className="mt-6">
              <ContactForm tone="dark" compact />
            </div>
          </Reveal>
        </div>

        {/* Donja traka */}
        <div className="mt-20 flex flex-col gap-6 border-t border-cream/15 pt-8">
          <nav className="flex flex-wrap gap-x-8 gap-y-2">
            {NAV.map((l) => (
              <Link key={l.href} href={l.href} className="link-underline text-sm text-cream/70 hover:text-cream">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <span className="display-cond text-2xl">{siteName}</span>
            <span className="text-xs text-cream/40">
              © {year} {siteName}. Sva prava zadržana.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
