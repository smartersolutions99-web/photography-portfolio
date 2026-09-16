import type { Metadata } from "next";
import Link from "next/link";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { BlurImage } from "@/components/site/BlurImage";
import { CategoryShowcase } from "@/components/site/CategoryShowcase";
import { ContactMasthead } from "@/components/site/ContactMasthead";
import { FeaturedWorks } from "@/components/site/FeaturedWorks";
import { FilmGrain } from "@/components/site/FilmGrain";
import { Magnetic } from "@/components/site/Interactive";
import { ParallaxImageQuote } from "@/components/site/ParallaxImageQuote";
import { PortfolioCamera } from "@/components/site/PortfolioCamera";
import { Reveal } from "@/components/site/Reveal";
import { RevealImage } from "@/components/site/RevealImage";
import { ScrollDots } from "@/components/site/ScrollDots";
import { SectionHeader } from "@/components/site/SectionHeader";
import { Starfield } from "@/components/site/Starfield";
import { getAbout, getCategories, getContact, getHome, getStories } from "@/lib/api";
import { buildTree } from "@/lib/categories";
import { CATEGORY_PALETTE } from "@/lib/categoryPalette";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHome();
  const name = home.siteName ?? SITE_NAME;
  const description =
    home.tagline || home.editorialStatement || DEFAULT_DESCRIPTION;
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
  const [home, about, categories, contact, rawStories] = await Promise.all([
    getHome(),
    getAbout(),
    getCategories(),
    getContact(),
    getStories(),
  ]);
  const nodes = buildTree(categories);
  const contactImage = home.heroUrl ?? home.featured[0]?.url ?? null;
  const quoteImage =
    home.featured[2]?.url ?? home.featured[0]?.url ?? contactImage;

  // Čisto vizuelne varijacije layout-a (visina slike, pozicija cutout panela) —
  // ciklično po indeksu, nezavisno od broja priča koje admin doda/ukloni.
  const STORY_LAYOUTS = [
    { imgHeightMd: "md:h-[90vh]", panelTop: 50 },
    { imgHeightMd: "md:h-[76vh]", panelTop: 38 },
    { imgHeightMd: "md:h-[84vh]", panelTop: 62 },
  ];
  const stories = rawStories.map((story, i) => ({
    ...story,
    image: story.imageUrl ?? home.featured[i + 2]?.url ?? home.featured[0]?.url ?? "",
    accent: story.accentColor,
    ...STORY_LAYOUTS[i % STORY_LAYOUTS.length],
  }));

  const dotSections = [
    { id: "sec-intro", label: "Početak" },
    { id: "sec-studio", label: "Studio" },
    { id: "sec-stories", label: "Priče" },
    { id: "sec-categories", label: "Kategorije" },
    { id: "sec-portfolio", label: "Portfolio" },
    { id: "sec-beforeafter", label: "Prije/Poslije" },
    { id: "sec-cta", label: "Kontakt" },
  ];

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

      <ScrollDots sections={dotSections} />

      <div id="dalje">
        <section id="sec-intro" className="bg-[rgb(252,253,230)] px-5 py-20 md:px-10 md:py-28">
          <div className="mx-auto grid max-w-[1500px] items-center gap-10 md:grid-cols-3 md:gap-10">
            {/* Slika levo */}
            <Reveal className="order-1" y={0}>
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-line/40 md:w-[75%] md:translate-x-[-15%] md:translate-y-[20%]">
                <BlurImage
                  src={home.featured[0]?.url ?? ""}
                  alt="Fotografija"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            </Reveal>

            {/* Tekst u sredini */}
            <Reveal className="order-2 text-center" delay={0.1}>
              <h2 className="display-serif text-4xl leading-snug md:text-4xl">
                Fotografija koja pamti osećaj, ne samo trenutak
              </h2>
              <span className="mx-auto mt-6 block h-px w-16 bg-ink/20" />
              <p className="mt-6 text-md leading-relaxed text-ink/70">
                Ne trčim za savršenom pozom — tražim onaj sekund kada zaboraviš da te neko snima. Svako venčanje, svaka porodica, svaka priča ima svoj ritam, i moj posao je da ga prepoznam i sačuvam. Rezultat nisu samo fotografije — to su uspomene kojima ćeš se vraćati godinama.
              </p>
              <Link
                href="/o-nama"
                className="eyebrow mt-8 inline-block border border-ink/30 px-6 py-3 transition-colors hover:bg-ink hover:text-cream"
              >
                Saznaj više
              </Link>
            </Reveal>

            {/* Slika desno */}
            <Reveal className="order-3" delay={0.2} y={0}>
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-line/40 md:ml-auto md:w-2/3 md:translate-x-[25%] md:translate-y-[-31%]">
                <BlurImage
                  src={home.featured[1]?.url ?? ""}
                  alt="Fotografija"
                  fill
                  sizes="(max-width: 568px) 100vw, 23vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* 01 — Studio / O meni */}
        <section
          id="sec-studio"
          className="relative flex flex-col justify-center overflow-hidden bg-ink px-5 py-16 md:max-h-[120vh] md:h-[120vh] md:px-10 md:py-0"
        >
          <Starfield />
          <FilmGrain />
          <div className="relative z-10 mx-auto w-full max-w-[1500px] h-[100%]">
            <div className="mb-8 flex items-baseline gap-4 border-t border-cream/15 pt-6 md:mb-10 md:gap-6">
              <span className="eyebrow pt-1 tabular-nums !text-cream/35">01</span>
              <div>
                <p className="eyebrow !text-cream/70">Upoznajmo se</p>
                <h2 className="display-serif mt-2 text-4xl text-cream md:text-6xl">
                  {about.heading ?? "Studio"}
                </h2>
              </div>
            </div>

            <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-10">
              {about.portraitUrl && (
                <Reveal className="md:w-[35%]" y={0}>
                  <div className="relative aspect-[3/4] max-h-[85vh] w-full overflow-hidden bg-cream/5 md:max-h-[85vh] rounded-[29px]">
                    <BlurImage
                      src={about.portraitUrl}
                      alt={about.heading ?? "Portret fotografa"}
                      fill
                      sizes="(max-width: 768px) 100vw, 35vw"
                      className="object-cover"
                    />
                  </div>
                </Reveal>
              )}
              <Reveal className="md:mt-10 md:w-[38%]" delay={0.15}>
                <p className="eyebrow !text-cream/50">Moja priča</p>
                <span className="mt-4 block h-px w-14 bg-accent/60" />
                <p className="mt-6 text-lg leading-loose text-cream/80">
                  {truncate(about.body, 420)}
                </p>
                <Link
                  href="/o-nama"
                  className="group mt-9 inline-flex items-center gap-3 border border-cream/30 px-6 py-3 transition-colors duration-500 hover:bg-cream"
                >
                  <span className="eyebrow !text-cream transition-colors duration-500 group-hover:!text-ink">
                    Saznaj više
                  </span>
                  <span
                    aria-hidden
                    className="text-cream transition-all duration-500 ease-editorial group-hover:translate-x-1 group-hover:text-ink"
                  >
                    →
                  </span>
                </Link>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 02 — Izabrani radovi
        <section className="bg-cream px-5 pb-24 md:px-10 md:pb-32">
          <div className="mx-auto max-w-[1500px]">
            <SectionHeader
              index="02"
              label="Izabrani radovi"
              title="Najbolje iz portfolija"
              href="/galerija"
              linkLabel="Sve fotografije"
              className="mb-16 md:mb-24"
            />
            <FeaturedWorks photos={home.featured} />
          </div>
        </section>
        */}

        {/* Parallax citat preko slike */}
        {home.pressQuote && (
          <ParallaxImageQuote
            imageUrl={quoteImage}
            quote={home.pressQuote}
            source={home.pressSource}
          />
        )}

        {/* 03 — Naše zajedničke priče */}
        <section
          id="sec-stories"
          className="relative px-5 py-16 md:px-10 md:py-20"
          style={{
            background: `linear-gradient(to bottom, ${stories[0].accent}55 0%, ${stories[0].accent}55 26%, ${stories[1].accent}55 40%, ${stories[1].accent}55 62%, ${stories[2].accent}55 76%, ${stories[2].accent}55 100%)`,
          }}
        >
          <div className="mx-auto max-w-[1500px]">
            <SectionHeader
              index="03"
              label="Naše zajedničke priče"
              title="Trenuci koje smo zabilježili"
              className="mb-6 md:mb-8"
            />
            <p className="mb-12 max-w-md text-sm leading-relaxed text-ink/50 md:mb-16 md:text-base">
              Iza svake fotografije stoji jedno poslijepodne, jedan razgovor, jedan trenutak koji se
              nikad više neće ponoviti na isti način.
            </p>

            <div className="flex flex-col gap-16 md:gap-24">
              {stories.map((story, i) => {
                const cutoutOnRight = i % 2 === 1;
                return (
                  <Reveal key={story.id} y={0}>
                    <div
                      className={`group relative mx-auto w-full max-w-[1600px] md:w-[90vw] ${
                        i % 2 === 1 ? "md:mt-16" : ""
                      }`}
                    >
                      {/* Slika — overflow-hidden je SAMO ovdje, ne obuhvata cutout panel */}
                      <div
                        className={`relative h-[70vh] w-full overflow-hidden bg-line/30 ring-1 ring-inset ring-ink/10 ${story.imgHeightMd}`}
                      >
                        <RevealImage delay={0.05}>
                          {story.image && (
                            <BlurImage
                              src={story.image}
                              alt={story.title}
                              fill
                              sizes="90vw"
                              className="object-cover grayscale-[20%] transition-all duration-[1600ms] ease-out group-hover:scale-[1.05] group-hover:grayscale-0"
                            />
                          )}
                        </RevealImage>
                        {/* Suptilni scrim za dubinu */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-ink/5" />
                        {/* Veliki, konturisani redni broj — editorijalni vodeni žig */}
                        <span
                          aria-hidden
                          className={`display-serif pointer-events-none absolute bottom-2 select-none text-[4.5rem] leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(246,243,238,0.45)] md:bottom-4 md:text-[11rem] ${
                            cutoutOnRight ? "left-4 md:left-8" : "right-4 md:right-8"
                          }`}
                        >
                          0{i + 1}
                        </span>
                      </div>

                      {/* Cutout — na mobilnom panel ide ISPOD slike (blagi preklop, foto ostaje vidljiv); na desktopu "izlazi" preko ivice slike */}
                      <div
                        style={
                          {
                            borderLeftColor: story.accent,
                            "--story-accent": story.accent,
                            "--panel-top": `${story.panelTop}%`,
                          } as React.CSSProperties
                        }
                        className={`relative z-10 -mt-10 w-[88%] max-w-sm border border-ink/10 border-l-2 bg-cream p-6 shadow-[0_20px_45px_-20px_rgba(20,17,14,0.35)] transition-all duration-700 ease-out sm:p-8 md:absolute md:top-[var(--panel-top)] md:mt-0 md:w-[380px] md:max-w-none md:-translate-y-1/2 md:p-10 md:shadow-[0_40px_90px_-25px_rgba(20,17,14,0.45)] md:group-hover:shadow-[0_50px_110px_-25px_rgba(20,17,14,0.55)] ${
                          cutoutOnRight
                            ? "ml-auto mr-3 sm:mr-6 md:right-0 md:left-auto md:mr-0 md:translate-x-[22%] md:group-hover:translate-x-[19%]"
                            : "ml-3 sm:ml-6 md:left-0 md:right-auto md:ml-0 md:-translate-x-[22%] md:group-hover:-translate-x-[19%]"
                        }`}
                      >
                        <span className="eyebrow !text-ink/40">{`Priča 0${i + 1}`}</span>
                        <span
                          className="mt-4 block h-px w-10"
                          style={{ backgroundColor: "var(--story-accent)" }}
                        />
                        <h3 className="display-serif mt-5 text-3xl leading-snug text-ink md:text-4xl">
                          {story.title}
                        </h3>
                        <p className="mt-4 text-sm leading-relaxed text-ink/70">
                          {story.text}
                        </p>
                        <Link
                          href="/galerija"
                          className="link-underline eyebrow mt-6 inline-block !text-ink/70 hover:!text-[var(--story-accent)]"
                        >
                          Pogledaj priču
                        </Link>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* 04 — Kategorije — nastavlja gradijent iz prethodne sekcije (ista maslinasta nijansa na vrhu) */}
        <section
          id="sec-categories"
          className="relative px-5 py-16 md:px-10 md:py-20"
          style={{
            background: `linear-gradient(to bottom, ${CATEGORY_PALETTE[2]}55 0%, ${CATEGORY_PALETTE[2]}55 22%, ${CATEGORY_PALETTE[3]}55 55%, ${CATEGORY_PALETTE[3]}20 85%, ${CATEGORY_PALETTE[3]}00 100%)`,
          }}
        >
          <div className="mx-auto max-w-[1500px]">
            <SectionHeader
              index="04"
              label="Istražite po temama"
              title="Kategorije"
              href="/kategorije"
              linkLabel="Sve kategorije"
              className="mb-10 md:mb-14"
            />
            <CategoryShowcase nodes={nodes} />
          </div>
        </section>

        {/* 05 — Portfolio (interaktivni viewfinder) — nastavlja gradijent iz prethodne sekcije */}
        <section
          id="sec-portfolio"
          className="relative px-5 py-16 md:px-10 md:py-20"
          style={{
            background: `linear-gradient(to bottom, ${CATEGORY_PALETTE[3]}00 0%, ${CATEGORY_PALETTE[3]}30 12%, ${CATEGORY_PALETTE[0]}30 55%, ${CATEGORY_PALETTE[1]}30 85%, ${CATEGORY_PALETTE[1]}00 100%)`,
          }}
        >
          <div className="mx-auto max-w-[1500px]">
            <SectionHeader
              index="05"
              label="Najbolje iz portfolija"
              title="Izabrani radovi"
              href="/galerija"
              linkLabel="Sve fotografije"
              className="mb-10 md:mb-14"
            />
          </div>
          <PortfolioCamera photos={home.featured} />
        </section>

        {/* 06 — Prije/Poslije */}
        <section id="sec-beforeafter" className="bg-cream px-5 py-16 md:px-10 md:py-20">
          <div className="mx-auto max-w-[1300px]">
            <SectionHeader
              index="06"
              label="Vještina obrade"
              title="Prije i poslije"
              className="mb-10 md:mb-14"
            />
            <Reveal y={0}>
              <BeforeAfterSlider
                imageUrl={home.beforeAfterUrl ?? home.featured[5]?.url ?? home.featured[0]?.url ?? ""}
                alt="Poređenje sirove i editovane fotografije"
              />
            </Reveal>
            <p className="mx-auto mt-6 max-w-md text-center text-sm text-ink/50">
              Prevuci razdelnik da vidiš razliku između sirovog snimka i finalne obrade.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section id="sec-cta" className="bg-ink px-5 py-28 text-center md:px-10 md:py-44">
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
