import Link from "next/link";
import { BlurImage } from "./BlurImage";
import { Reveal } from "./Reveal";

/**
 * Brand statement (B) — prostrana ivory sekcija: dvije male vertikalne fotografije
 * uz ivice, centralni veliki serif iskaz + kratak tekst i minimalni CTA.
 * Male fotografije se sakrivaju na mobile-u (ostaje čist centralni blok).
 */
export function IntroStatement({
  eyebrow = "Dobrodošli",
  statement,
  body,
  leftImage,
  rightImage,
  ctaHref = "/o-nama",
  ctaLabel = "Upoznajte studio",
}: {
  eyebrow?: string;
  statement: string;
  body?: string | null;
  leftImage?: string | null;
  rightImage?: string | null;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <section className="bg-cream px-5 py-24 md:px-10 md:py-36 lg:py-44">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.1fr)_minmax(0,1fr)] lg:gap-14">
        {/* Lijeva mala fotografija */}
        <Reveal className="hidden lg:block">
          {leftImage && (
            <div className="relative aspect-[3/4] w-full max-w-[240px] overflow-hidden bg-line/40">
              <BlurImage src={leftImage} alt="" fill sizes="240px" className="object-cover" />
            </div>
          )}
        </Reveal>

        {/* Centralni tekst */}
        <Reveal delay={0.1} className="text-center">
          <p className="eyebrow">{eyebrow}</p>
          <p className="display-serif mx-auto mt-6 max-w-[16ch] text-4xl leading-[1.08] text-ink md:text-6xl">
            {statement}
          </p>
          {body && <p className="prose-editorial mx-auto mt-8 text-center">{body}</p>}
          <Link href={ctaHref} className="link-underline eyebrow mt-9 inline-block !text-ink">
            {ctaLabel}
          </Link>
        </Reveal>

        {/* Desna mala fotografija */}
        <Reveal delay={0.2} className="hidden justify-self-end lg:block">
          {rightImage && (
            <div className="relative aspect-[3/4] w-full max-w-[240px] overflow-hidden bg-line/40">
              <BlurImage src={rightImage} alt="" fill sizes="240px" className="object-cover" />
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
