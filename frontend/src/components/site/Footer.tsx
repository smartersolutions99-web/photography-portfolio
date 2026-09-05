import Link from "next/link";
import type { ContactInfo } from "@/lib/types";
import { Reveal } from "./Reveal";

const NAV = [
  { href: "/", label: "Početna" },
  { href: "/galerija", label: "Galerija" },
  { href: "/kategorije", label: "Portfolio" },
  { href: "/o-nama", label: "O meni" },
  { href: "/kontakt", label: "Kontakt" },
];

export function Footer({ contact }: { contact: ContactInfo }) {
  const year = new Date().getFullYear();
  const siteName = contact.siteName ?? "STUDIO";

  return (
    <footer data-header-theme="dark" className="bg-deepolive text-cream">
      <div className="mx-auto max-w-[1500px] px-5 py-20 md:px-10 md:py-28">
        {/* Veliko ime studija kao vizuelni element */}
        <Reveal>
          <p className="eyebrow !text-cream/45">Fotografski studio</p>
          <p className="display-caps mt-5 text-[16vw] leading-[0.86] text-cream md:text-[10vw] lg:text-[9rem]">
            {siteName}
          </p>
        </Reveal>

        {/* Informacione kolone */}
        <div className="mt-16 grid gap-12 border-t border-cream/12 pt-14 sm:grid-cols-2 md:mt-20 md:grid-cols-4 md:gap-10">
          <div>
            <p className="eyebrow !text-cream/40">Navigacija</p>
            <ul className="mt-5 space-y-3">
              {NAV.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-underline text-sm text-cream/75 hover:text-cream">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow !text-cream/40">Kontakt</p>
            <div className="mt-5 space-y-3 text-sm text-cream/75">
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="link-underline block hover:text-cream">
                  {contact.email}
                </a>
              )}
              {contact.phone && <p>{contact.phone}</p>}
            </div>
          </div>

          <div>
            <p className="eyebrow !text-cream/40">Lokacija</p>
            <div className="mt-5 space-y-3 text-sm text-cream/75">
              {contact.location && <p>{contact.location}</p>}
              {contact.address && <p>{contact.address}</p>}
            </div>
          </div>

          <div>
            <p className="eyebrow !text-cream/40">Društvene mreže</p>
            <div className="mt-5 flex flex-col gap-3">
              {contact.instagramUrl && (
                <a href={contact.instagramUrl} target="_blank" rel="noreferrer" className="link-underline w-fit text-sm text-cream/75 hover:text-cream">
                  Instagram
                </a>
              )}
              {contact.facebookUrl && (
                <a href={contact.facebookUrl} target="_blank" rel="noreferrer" className="link-underline w-fit text-sm text-cream/75 hover:text-cream">
                  Facebook
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Donja traka */}
        <div className="mt-16 flex flex-col justify-between gap-3 border-t border-cream/12 pt-8 text-xs text-cream/40 sm:flex-row sm:items-center">
          <span>
            © {year} {siteName}. Sva prava zadržana.
          </span>
          <span>{contact.tagline ?? "Fotografija koja pripovijeda"}</span>
        </div>
      </div>
    </footer>
  );
}
