import type { Metadata } from "next";
import Link from "next/link";
import { BlurImage } from "@/components/site/BlurImage";
import { CategoryGrid } from "@/components/site/CategoryGrid";
import { ContactMasthead } from "@/components/site/ContactMasthead";
import { FeaturedWorks } from "@/components/site/FeaturedWorks";
import { Magnetic } from "@/components/site/Interactive";
import { ParallaxImageQuote } from "@/components/site/ParallaxImageQuote";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeader } from "@/components/site/SectionHeader";
import { getAbout, getCategories, getContact, getHome } from "@/lib/api";
import { buildTree } from "@/lib/categories";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHome();
  const name = home.siteName ?? SITE_NAME;
  const description = home.tagline || home.editorialStatement || DEFAULT_DESCRIPTION;
  const image = home.heroUrl || home.featured[0]?.url || null;
  const ogTitle = `${name} — Fotografija`;
  return {
    description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "sr_RS",
      siteName: name,
      title: ogTitle,
      description,
      url: SITE_URL,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function HomePage() {
  const [home, about, categories, contact] = await Promise.all([
    getHome(),
    getAbout(),
    getCategories(),
    getContact(),
  ]);
  const nodes = buildTree(categories);
  const contactImage = home.heroUrl ?? home.featured[0]?.url ?? null;
  const quoteImage = home.featured[2]?.url ?? home.featured[0]?.url ?? contactImage;

  return (
    <>
      {/* Kontakt-first hero koji se, dok se skrola, pretvara u masthead (ista slika) */}
      <ContactMasthead
        contact={contact}
        imageUrl={contactImage}
        name={home.siteName ?? SITE_NAME}
        statement={home.editorialStatement}
        location={contact.location}
        specialties={nodes.map((n) => n.name)}
        targetId="dalje"
      />

      <div id="dalje">
        {/* 01 — Izabrani radovi */}
        <section className="bg-cream px-5 pb-24 md:px-10 md:pb-32">
          <div className="mx-auto max-w-[1500px]">
            <SectionHeader
              index="01"
              label="Izabrani radovi"
              title="Najbolje iz portfolija"
              href="/galerija"
              linkLabel="Sve fotografije"
              className="mb-16 md:mb-24"
            />
            <FeaturedWorks photos={home.featured} />
          </div>
        </section>

        {/* Parallax citat preko slike */}
        {home.pressQuote && (
          <ParallaxImageQuote imageUrl={quoteImage} quote={home.pressQuote} source={home.pressSource} />
        )}

        {/* 02 — Kategorije */}
        <section className="bg-cream px-5 py-24 md:px-10 md:py-32">
          <div className="mx-auto max-w-[1500px]">
            <SectionHeader
              index="02"
              label="Istražite po temama"
              title="Kategorije"
              href="/kategorije"
              linkLabel="Sve kategorije"
              className="mb-14 md:mb-20"
            />
            <CategoryGrid nodes={nodes} />
          </div>
        </section>

        {/* 03 — Studio / O meni */}
        <section className="bg-cream px-5 py-24 md:px-10 md:py-32">
          <div className="mx-auto max-w-[1500px]">
            <SectionHeader index="03" label="Upoznajmo se" title={about.heading ?? "Studio"} className="mb-14 md:mb-20" />
            <div className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
              <Reveal className="order-2 md:order-1">
                <p className="display-serif text-3xl leading-snug md:text-4xl">{truncate(about.body, 240)}</p>
                <Link href="/o-nama" className="link-underline eyebrow mt-8 inline-block !text-ink">
                  Pročitaj više
                </Link>
              </Reveal>
              {about.portraitUrl && (
                <Reveal className="order-1 md:order-2" delay={0.15}>
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-line/40">
                    <BlurImage
                      src={about.portraitUrl}
                      alt={about.heading ?? "Portret fotografa"}
                      fill
                      sizes="(max-width: 768px) 100vw, 45vw"
                      className="object-cover"
                    />
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-ink px-5 py-28 text-center md:px-10 md:py-44">
          <Reveal>
            <p className="eyebrow !text-cream/60">Vaša priča je sljedeća</p>
            <div className="mt-6 flex justify-center">
              <Magnetic>
                <Link href="/kontakt">
                  <span className="display-serif block text-5xl text-cream transition-opacity hover:opacity-70 md:text-8xl">
                    Kontaktirajte nas
                  </span>
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </section>
      </div>
    </>
  );
}

function truncate(text: string | null, max: number): string {
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}
