"use client";

import { useEffect, useState } from "react";

/**
 * „Iskucava" tekst slovo po slovo kada `start` postane true (npr. nakon intro blica).
 * Prikazuje treptajući kursor dok kuca. Uz reduced-motion odmah ispiše cijeli tekst.
 */
export function Typewriter({
  text,
  start,
  speed = 42,
  className,
  caretClassName = "",
}: {
  text: string;
  start: boolean;
  speed?: number;
  className?: string;
  caretClassName?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setCount(text.length);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [start, text, speed]);

  const typing = count < text.length;

  return (
    <span className={className}>
      {text.slice(0, count)}
      {start && typing && <span className={`animate-pulse font-light ${caretClassName}`}>|</span>}
      {/* Nevidljivi ostatak drži konačan raspored (bez „skakanja" layouta) */}
      <span className="opacity-0" aria-hidden>
        {text.slice(count)}
      </span>
    </span>
  );
}
