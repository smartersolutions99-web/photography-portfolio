import Link from "next/link";
import { BlurImage } from "./BlurImage";
import { Reveal } from "./Reveal";

/**
 * Finalni CTA (I) — velika atmosferska fotografija sa toplim tamnim overlay-em,
 * veliki serif poziv i diskretan outlined link ka kontaktu. Bez rounded dugmadi.
 */
export function FinalCta({
  imageUrl,
  heading = "Sačuvajmo vašu priču",
  body,
  ctaHref = "/kontakt",
  ctaLabel = "Kontaktirajte nas",
}: {
  imageUrl: string | null;
  heading?: string;
  body?: string | null;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <section
      data-header-theme="dark"
      className="relative flex min-h-[75svh] items-center justify-center overflow-hidden bg-dark px-5 py-32 md:px-10"
    >
      {imageUrl && (
        <>
          <BlurImage src={imageUrl} alt="" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-dark/75" />
        </>
      )}
      <Reveal className="relative z-10 mx-auto max-w-2xl text-center text-cream">
        <p className="eyebrow !text-cream/60">Vaša priča je sljedeća</p>
        <h2 className="display-serif mt-6 text-5xl leading-[1.03] md:text-8xl">{heading}</h2>
        {body && <p className="mx-auto mt-7 max-w-md text-base font-light leading-[1.7] text-cream/80">{body}</p>}
        <Link
          href={ctaHref}
          data-cursor="view"
          className="eyebrow group mt-10 inline-flex items-center gap-3 border border-cream/40 px-10 py-4 !text-cream transition-colors duration-500 hover:bg-cream hover:!text-ink"
        >
          {ctaLabel}
          <span aria-hidden className="transition-transform duration-500 ease-editorial group-hover:translate-x-1">→</span>
        </Link>
      </Reveal>
    </section>
  );
}
