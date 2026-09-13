/**
 * Suptilna filmska "grain" tekstura preko tamnih sekcija — čist CSS/SVG šum
 * (feTurbulence kao data-URI pozadina). Namjerno STATIČNA (bez animacije) —
 * animirani grain preko cijele (uvećane) sekcije je bio skup za renderovanje
 * i pravio je "kočenje" pri skrolu. Ovako i dalje daje filmsku teksturu, samo
 * bez kontinuiranog repaint-a.
 */
export function FilmGrain({ opacity = 0.045, className }: { opacity?: number; className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 mix-blend-overlay ${className ?? ""}`}
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        backgroundSize: "160px 160px",
      }}
    />
  );
}
