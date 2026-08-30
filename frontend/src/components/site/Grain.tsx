/** Suptilna film-grain tekstura preko cijelog sajta (editorial osjećaj). */
export function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[55] opacity-[0.5]"
      style={{ mixBlendMode: "soft-light" }}
    >
      <svg className="h-full w-full">
        <filter id="grain-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-noise)" opacity="0.4" />
      </svg>
    </div>
  );
}
