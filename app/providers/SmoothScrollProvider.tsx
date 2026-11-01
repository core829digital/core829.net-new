"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSimpleMode } from "@/lib/simpleMode";

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scroll globale: Lenis sincronizzato con il ticker GSAP.
 * Rispetta prefers-reduced-motion (fallback a scroll nativo).
 */
export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const simple = useSimpleMode();

  // Espone la scelta al CSS (es. ferma il marquee).
  useEffect(() => {
    document.documentElement.dataset.simple = simple ? "1" : "0";
  }, [simple]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Versione semplice: scroll nativo, senza inerzia.
    if (reduceMotion || simple) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
      wheelMultiplier: 1,
    });

    window.__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, [simple]);

  return <>{children}</>;
}
