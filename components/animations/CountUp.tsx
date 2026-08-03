"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface CountUpProps {
  value: number;
  suffix?: string;
  duration?: number;
}

/**
 * Contatore animato (count-up) al reveal. Rispetta prefers-reduced-motion.
 */
export default function CountUp({ value, suffix = "", duration = 1.6 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setDisplay(value);
        return;
      }

      const counter = { v: 0 };
      const tween = gsap.to(counter, {
        v: value,
        duration,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true,
        },
        onUpdate: () => setDisplay(Math.round(counter.v)),
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: ref }
  );

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}
