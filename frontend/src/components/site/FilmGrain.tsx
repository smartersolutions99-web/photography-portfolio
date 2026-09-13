/**
 * Suptilna filmska "grain" tekstura preko tamnih sekcija — čist CSS/SVG šum
 * (feTurbulence kao data-URI pozadina), animiran preko globals.css keyframes.
 * Jedva primetno (podrazumevano ~4% opacity), mix-blend-overlay da se stopi
 * sa pozadinom umjesto da izgleda kao zaseban sloj.
 */
export function FilmGrain({ opacity = 0.045, className }: { opacity?: number; className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute -inset-[25%] mix-blend-overlay [animation:grain-shift_1.1s_steps(8)_infinite] ${className ?? ""}`}
      style={{
        opacity,
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        backgroundSize: "160px 160px",
      }}
    />
  );
}
