import { BlurImage } from "./BlurImage";
import { Reveal } from "./Reveal";

/**
 * Full-bleed atmosferska pauza (F) — velika fotografija sa jednim serif iskazom.
 * Pravi vizuelni predah i podiže premium osjećaj između sekcija.
 */
export function ImageBreak({
  imageUrl,
  eyebrow,
  title,
}: {
  imageUrl: string | null;
  eyebrow?: string;
  title: string;
}) {
  return (
    <section
      data-header-theme="dark"
      className="relative flex h-[70svh] min-h-[420px] items-center justify-center overflow-hidden bg-ink"
    >
      {imageUrl && (
        <BlurImage src={imageUrl} alt="" fill sizes="100vw" className="object-cover" />
      )}
      <div className="absolute inset-0 bg-ink/45" />
      <Reveal className="relative z-10 mx-auto max-w-3xl px-6 text-center text-cream">
        {eyebrow && <p className="eyebrow !text-cream/70">{eyebrow}</p>}
        <p className="display-serif mt-5 text-4xl leading-[1.1] md:text-6xl">{title}</p>
      </Reveal>
    </section>
  );
}
