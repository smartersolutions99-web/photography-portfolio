import Link from "next/link";
import type { ContactInfo } from "@/lib/types";

export function Footer({ contact }: { contact: ContactInfo }) {
  const year = new Date().getFullYear();
  const siteName = contact.siteName ?? "STUDIO";

  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <p className="eyebrow !text-cream/50">Pišite mi</p>
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="display-serif mt-4 block text-4xl text-cream md:text-6xl"
              >
                {contact.email}
              </a>
            )}
            {contact.location && (
              <p className="mt-6 text-sm text-cream/60">{contact.location}</p>
            )}
            {contact.phone && <p className="mt-1 text-sm text-cream/60">{contact.phone}</p>}
          </div>

          <div className="flex flex-col justify-between gap-10 md:items-end">
            <nav className="flex flex-wrap gap-x-8 gap-y-2 md:justify-end">
              {[
                { href: "/", label: "Početna" },
                { href: "/galerija", label: "Galerija" },
                { href: "/kategorije", label: "Kategorije" },
                { href: "/o-nama", label: "O meni" },
                { href: "/kontakt", label: "Kontakt" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="link-underline text-sm text-cream/80">
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="flex gap-6 md:justify-end">
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
        </div>

        <div className="mt-16 flex flex-col justify-between gap-4 border-t border-cream/15 pt-8 md:flex-row md:items-center">
          <span className="display-cond text-2xl tracking-widest">{siteName}</span>
          <span className="text-xs text-cream/40">© {year} {siteName}. Sva prava zadržana.</span>
        </div>
      </div>
    </footer>
  );
}
