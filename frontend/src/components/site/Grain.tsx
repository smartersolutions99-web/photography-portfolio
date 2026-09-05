/**
 * Suptilna film-grain tekstura preko cijelog sajta (editorial osjećaj).
 *
 * Performanse: umjesto ŽIVOG SVG feTurbulence filtera + mix-blend-a (koji se
 * re-kompozituje svaki frame i kvari smooth skrol), koristimo statičnu noise
 * teksturu kao tiled background-image (browser je rasterizuje jednom, pa jeftino
 * ponavlja) — bez blend-a. GPU-jeftino i tokom skrola.
 */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[55] opacity-[0.07]"
      style={{ backgroundImage: NOISE, backgroundSize: "140px 140px" }}
    />
  );
}
