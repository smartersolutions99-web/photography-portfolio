import { Reveal } from "./Reveal";

/**
 * Testimonial / „riječi klijenata" (H) — koristi postojeći pressQuote/pressSource
 * sa backenda. Ne izmišlja recenzije: ako nema citata, sekcija se ne renderuje
 * (poziva se uslovno iz page.tsx). Centralno, veliki serif citat, mnogo vazduha.
 */
export function Testimonial({ quote, source }: { quote: string; source?: string | null }) {
  return (
    <section className="bg-cream px-5 py-28 md:px-10 md:py-40">
      <Reveal className="mx-auto max-w-4xl text-center">
        <p className="eyebrow">Riječi klijenata</p>
        <blockquote className="display-serif mt-8 text-3xl leading-[1.25] text-ink md:text-5xl md:leading-[1.2]">
          <span aria-hidden className="text-accent">“</span>
          {quote}
          <span aria-hidden className="text-accent">”</span>
        </blockquote>
        {source && <p className="eyebrow mt-10 !text-ink/45">{source}</p>}
      </Reveal>
    </section>
  );
}
