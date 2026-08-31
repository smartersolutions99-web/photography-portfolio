import type Lenis from "lenis";

declare global {
  // eslint-disable-next-line no-var
  var __lenis: Lenis | undefined;
}

/**
 * Gladak scroll do elementa. Koristi Lenis instancu (ako je aktivna) za isti
 * osjećaj kao ostatak sajta; u suprotnom pada na nativni `scrollIntoView`.
 * Poštuje `prefers-reduced-motion` (tada skače bez animacije).
 */
export function smoothScrollTo(target: string | HTMLElement) {
  const el = typeof target === "string" ? document.getElementById(target) : target;
  if (!el) return;

  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce) {
    el.scrollIntoView();
    return;
  }

  if (typeof window !== "undefined" && window.__lenis) {
    window.__lenis.scrollTo(el, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 3) });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}
