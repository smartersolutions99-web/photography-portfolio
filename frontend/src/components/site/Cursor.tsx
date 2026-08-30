"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Custom kursor koji se pojavljuje SAMO iznad radova (elementi sa data-cursor="view")
 * kao prsten sa oznakom „Vidi". Svuda drugdje ostaje normalan nativni kursor.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 38, mass: 0.3 });
  const sy = useSpring(y, { stiffness: 500, damping: 38, mass: 0.3 });

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = e.target as HTMLElement | null;
      setActive(!!target?.closest?.('[data-cursor="view"]'));
    };
    const leave = () => setActive(false);

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[80] flex h-[92px] w-[92px] items-center justify-center rounded-full border border-white/80 mix-blend-difference"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-white">Vidi</span>
    </motion.div>
  );
}
