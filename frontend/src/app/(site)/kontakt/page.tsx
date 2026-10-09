import { Playfair_Display } from "next/font/google";
import { ContactMadLibs } from "@/components/site/ContactMadLibs";
import { Reveal } from "@/components/site/Reveal";
import { getContact } from "@/lib/api";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Kontakt",
  description: "Stupi u kontakt — provjeri dostupnost termina i zatraži ponudu za tvoj događaj.",
  path: "/kontakt",
});

// Kurzivni serif SAMO za pozdravni red na ovoj stranici — namjerno drugačiji od
// ostatka sajta (display-serif), da dočara "pisano pismo" osjećaj iz inspiracije.
const script = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  style: ["italic"],
  weight: ["500", "600"],
});

export default async function ContactPage() {
  const contact = await getContact();
  const hasContactRow = contact.email || contact.phone || contact.location;
  const hasSocial = contact.instagramUrl || contact.facebookUrl;

  return (
    <section className="flex min-h-screen items-center justify-center px-5 pb-24 pt-32 md:px-10 md:pb-32 md:pt-40">
      <div className="mx-auto w-full max-w-2xl text-center">
        <Reveal>
          <h1 className={`${script.className} text-5xl italic leading-tight text-ink md:text-7xl`}>
            Ispričajte mi vašu priču,
          </h1>
        </Reveal>

        <Reveal delay={0.1} className="mt-12 md:mt-14">
          <ContactMadLibs />
        </Reveal>

        {(hasContactRow || hasSocial) && (
          <Reveal delay={0.2} className="mt-20 border-t border-line pt-8">
            {hasContactRow && (
              <div className="flex flex-col items-center gap-3 text-sm text-muted sm:flex-row sm:justify-center sm:gap-8">
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="link-underline !text-ink">
                    {contact.email}
                  </a>
                )}
                {contact.phone && <span>{contact.phone}</span>}
                {contact.location && <span>{contact.location}</span>}
              </div>
            )}
            {hasSocial && (
              <div className="mt-5 flex justify-center gap-6">
                {contact.instagramUrl && (
                  <a href={contact.instagramUrl} target="_blank" rel="noreferrer" className="eyebrow !text-ink">
                    Instagram
                  </a>
                )}
                {contact.facebookUrl && (
                  <a href={contact.facebookUrl} target="_blank" rel="noreferrer" className="eyebrow !text-ink">
                    Facebook
                  </a>
                )}
              </div>
            )}
          </Reveal>
        )}
      </div>
    </section>
  );
}
