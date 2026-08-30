import Image from "next/image";
import Link from "next/link";
import { CategoryGrid } from "@/components/site/CategoryGrid";
import { FeaturedWorks } from "@/components/site/FeaturedWorks";
import { Hero } from "@/components/site/Hero";
import { Magnetic } from "@/components/site/Interactive";
import { ParallaxImageQuote } from "@/components/site/ParallaxImageQuote";
import { Reveal } from "@/components/site/Reveal";
import { getAbout, getCategories, getHome } from "@/lib/api";
import { buildTree } from "@/lib/categories";

export default async function HomePage() {
  const [home, about, categories] = await Promise.all([getHome(), getAbout(), getCategories()]);
  const nodes = buildTree(categories);
  const statementLines = splitStatement(home.editorialStatement);
  // Ako hero slika nije postavljena, koristi prvi istaknuti rad
  const heroImage = home.heroUrl ?? home.featured[0]?.url ?? null;
  const quoteImage = home.featured[2]?.url ?? home.featured[0]?.url ?? heroImage;

  return (
    <>
      <Hero
        imageUrl={heroImage}
        title={home.heroTitle ?? "Vizuelne priče"}
        subtitle={home.heroSubtitle ?? ""}
      />

      {/* Uvodna izjava */}
      {statementLines.length > 0 && (
        <section className="bg-cream px-5 py-20 md:px-10 md:py-28">
          <div className="mx-auto grid max-w-[1400px] gap-8 md:grid-cols-[auto_1fr] md:gap-16">
            <Reveal>
              <p className="eyebrow whitespace-nowrap md:pt-4">— Studio</p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="space-y-1">
                {statementLines.map((line, i) => (
                  <p key={i} className="display-serif text-3xl leading-[1.12] md:text-6xl">
                    {line}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Najbolji radovi */}
      <section className="bg-cream px-5 pb-24 md:px-10 md:pb-32">
        <div className="mx-auto max-w-[1400px]">
          <Reveal className="mb-16 flex flex-col gap-4 md:mb-24 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Izabrani radovi</p>
              <h2 className="display-serif mt-3 text-4xl md:text-6xl">Najbolje iz portfolija</h2>
            </div>
            <Link href="/galerija" className="link-underline eyebrow !text-ink">
              Sve fotografije
            </Link>
          </Reveal>
          <FeaturedWorks photos={home.featured} />
        </div>
      </section>

      {/* Parallax citat preko slike */}
      {home.pressQuote && (
        <ParallaxImageQuote imageUrl={quoteImage} quote={home.pressQuote} source={home.pressSource} />
      )}

      {/* Kategorije — slikovne pločice */}
      <section className="bg-cream px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <Reveal className="mb-14 flex flex-col gap-4 md:mb-20 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Istražite po temama</p>
              <h2 className="display-serif mt-3 text-4xl md:text-6xl">Kategorije</h2>
            </div>
            <Link href="/kategorije" className="link-underline eyebrow !text-ink">
              Sve kategorije
            </Link>
          </Reveal>
          <CategoryGrid nodes={nodes} />
        </div>
      </section>

      {/* O meni */}
      <section className="border-t border-line bg-cream px-5 py-24 md:px-10 md:py-36">
        <div className="mx-auto grid max-w-[1400px] items-center gap-12 md:grid-cols-2 md:gap-20">
          <Reveal className="order-2 md:order-1">
            <p className="eyebrow">{about.heading ?? "O meni"}</p>
            <p className="display-serif mt-4 text-3xl leading-snug md:text-4xl">
              {truncate(about.body, 240)}
            </p>
            <Link href="/o-nama" className="link-underline eyebrow mt-8 inline-block !text-ink">
              Pročitaj više
            </Link>
          </Reveal>
          {about.portraitUrl && (
            <Reveal className="order-1 md:order-2" delay={0.15}>
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-line/40">
                <Image
                  src={about.portraitUrl}
                  alt={about.heading ?? "Portret"}
                  fill
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          )}
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
                  Razgovarajmo
                </span>
              </Link>
            </Magnetic>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function splitStatement(text: string | null): string[] {
  if (!text) return [];
  const words = text.trim().split(/\s+/);
  const perLine = Math.ceil(words.length / 3);
  const lines: string[] = [];
  for (let i = 0; i < words.length; i += perLine) {
    lines.push(words.slice(i, i + perLine).join(" "));
  }
  return lines;
}

function truncate(text: string | null, max: number): string {
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}
