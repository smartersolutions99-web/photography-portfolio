import type { Metadata } from "next";
import { AboutPreview } from "@/components/site/AboutPreview";
import { FeaturedEditorial } from "@/components/site/FeaturedEditorial";
import { FinalCta } from "@/components/site/FinalCta";
import { ImageBreak } from "@/components/site/ImageBreak";
import { IntroStatement } from "@/components/site/IntroStatement";
import { PortfolioHero } from "@/components/site/PortfolioHero";
import { PortfolioIndex } from "@/components/site/PortfolioIndex";
import { Reveal } from "@/components/site/Reveal";
import { SelectedGalleries } from "@/components/site/SelectedGalleries";
import { Testimonial } from "@/components/site/Testimonial";
import { getAbout, getCategories, getContact, getHome, getPhotos } from "@/lib/api";
import { buildTree } from "@/lib/categories";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import type { Photo } from "@/lib/types";

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
  const [home, about, categories, contact, photos] = await Promise.all([
    getHome(),
    getAbout(),
    getCategories(),
    getContact(),
    getPhotos(),
  ]);
  const nodes = buildTree(categories);
  const featured = home.featured ?? [];
  const heroImage = home.heroUrl ?? featured[0]?.url ?? photos[0]?.url ?? null;

  // Izbor slika za pojedine sekcije — biramo iz featured, pa iz svih fotografija.
  const pool = [...featured, ...photos];
  const pick = (i: number) => pool[i]?.url ?? null;
  const landscape = (list: Photo[]) => list.find((p) => (p.width ?? 0) > (p.height ?? 0)) ?? null;
  const breakImage = landscape(photos)?.url ?? heroImage;
  const ctaImage = pick(3) ?? heroImage;

  return (
    <>
      {/* A. HERO */}
      <PortfolioHero
        imageUrl={heroImage}
        name={home.siteName ?? SITE_NAME}
        statement={home.editorialStatement}
        location={contact.location}
        specialties={nodes.map((n) => n.name)}
        targetId="rad"
      />

      {/* B. INTRO / BRAND STATEMENT */}
      <div id="rad">
        <IntroStatement
          eyebrow="Fotografski studio"
          statement={home.editorialStatement ?? home.tagline ?? "Bezvremene fotografije koje čuvaju vaše najvažnije trenutke."}
          body={home.tagline}
          leftImage={pick(1)}
          rightImage={pick(2)}
        />
      </div>

      {/* C. IZABRANI RADOVI — editorial kompozicija */}
      {featured.length > 0 && (
        <section className="bg-cream px-5 pb-24 md:px-10 md:pb-36">
          <div className="mx-auto max-w-[1500px]">
            <Reveal className="mb-14 md:mb-20">
              <p className="eyebrow">Izabrani radovi</p>
              <h2 className="display-serif mt-4 text-5xl text-ink md:text-7xl">Iz portfolija</h2>
            </Reveal>
            <FeaturedEditorial photos={featured} />
          </div>
        </section>
      )}

      {/* D. O MENI */}
      <AboutPreview
        heading={about.heading ?? "O meni"}
        body={truncate(about.body, 220)}
        portraitUrl={about.portraitUrl}
        detailUrl={pick(0)}
      />

      {/* E. PORTFOLIO / KATEGORIJE */}
      <PortfolioIndex nodes={nodes} />

      {/* F. FULL-BLEED PAUZA */}
      <ImageBreak
        imageUrl={breakImage}
        eyebrow="Svaki kadar je priča"
        title={home.tagline ?? "Svjetlo, emocija i trenuci koji ostaju."}
      />

      {/* G. IZBOR IZ GALERIJE */}
      <SelectedGalleries photos={photos} />

      {/* H. TESTIMONIAL — samo ako postoji citat */}
      {home.pressQuote && <Testimonial quote={home.pressQuote} source={home.pressSource} />}

      {/* I. FINALNI CTA */}
      <FinalCta imageUrl={ctaImage} body={home.tagline} />
    </>
  );
}

function truncate(text: string | null, max: number): string {
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}
