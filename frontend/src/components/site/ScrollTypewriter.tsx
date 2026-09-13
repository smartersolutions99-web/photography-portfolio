"use client";

import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Typewriter } from "./Typewriter";

export function ScrollTypewriter({
  text,
  speed = 35,
  delay = 0,
  className,
}: {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (!inView) return;
    if (delay === 0) {
      setStart(true);
      return;
    }
    const id = setTimeout(() => setStart(true), delay);
    return () => clearTimeout(id);
  }, [inView, delay]);

  return (
    <span ref={ref}>
      <Typewriter text={text} start={start} speed={speed} className={className} />
    </span>
  );
}
