import Link from "next/link";
import { BlurImage } from "./BlurImage";
import { Reveal } from "./Reveal";

/**
 * O meni — preview (D). Asimetrične dvije kolone: tekst lijevo, veliki portret
 * desno uz manju fotografiju koja ga suptilno preklapa. Overlap je diskretan,
 * na mobile-u se raspada u čist vertikalni ritam (manja slika se sakriva).
 */
export function AboutPreview({
  eyebrow = "Upoznajmo se",
  heading,
  body,
  portraitUrl,
  detailUrl,
  ctaHref = "/o-nama",
  ctaLabel = "Saznaj više",
}: {
  eyebrow?: string;
  heading: string;
  body?: string | null;
  portraitUrl?: string | null;
  detailUrl?: string | null;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <section className="bg-surface px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto grid max-w-[1400px] items-center gap-14 md:grid-cols-2 md:gap-20">
        <Reveal className="order-2 md:order-1">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="display-serif mt-4 text-5xl leading-[1.02] text-ink md:text-7xl">{heading}</h2>
          {body && <p className="prose-editorial mt-7">{body}</p>}
          <Link href={ctaHref} className="link-underline eyebrow mt-9 inline-block !text-ink">
            {ctaLabel}
          </Link>
        </Reveal>

        <Reveal delay={0.15} className="order-1 md:order-2">
          <div className="relative mx-auto w-full max-w-md md:mr-0 md:pb-16 md:pl-16">
            {portraitUrl && (
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-line/40">
                <BlurImage
                  src={portraitUrl}
                  alt={heading}
                  fill
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
            )}
            {detailUrl && (
              <div className="absolute bottom-0 left-0 hidden aspect-[3/4] w-2/5 overflow-hidden border-4 border-surface bg-line/40 md:block">
                <BlurImage src={detailUrl} alt="" fill sizes="20vw" className="object-cover" />
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
