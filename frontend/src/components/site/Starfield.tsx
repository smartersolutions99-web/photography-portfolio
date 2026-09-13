interface Star {
  top: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

function makeStars(count: number): Star[] {
  return Array.from({ length: count }, () => ({
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 1.6 + 0.6,
    delay: Math.random() * 6,
    duration: Math.random() * 3 + 2.5,
    opacity: Math.random() * 0.5 + 0.3,
  }));
}

/**
 * Suptilan sloj sitnih tačkica koje blago trepere — za tamne pozadine
 * (efekat zvjezdanog neba). Čist CSS (@keyframes twinkle u globals.css),
 * bez JS-a na klijentu.
 */
export function Starfield({ count = 90, className }: { count?: number; className?: string }) {
  const stars = makeStars(count);
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`} aria-hidden>
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-cream"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
