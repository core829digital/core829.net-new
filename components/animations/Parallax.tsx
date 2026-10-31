"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface ParallaxProps {
  children?: React.ReactNode;
  className?: string;
  /**
   * Intensità del parallax: >0 = scorre più lentamente della pagina (sfondi),
   * <0 = più velocemente (primo piano). 0.1 ≈ 10px ogni 100px di scroll del trigger.
   */
  speed?: number;
  /** Se true, il movimento è relativo al parent invece che all'elemento stesso. */
  relativeToParent?: boolean;
  /** Se true, il movimento è anche orizzontale (valore in rapporto a speed). */
  x?: number;
  /**
   * "center" (default): l'elemento è in posizione naturale quando attraversa
   * il centro della viewport. "top": per elementi già visibili al caricamento
   * (hero) — parte da posizione naturale a scroll 0.
   */
  origin?: "center" | "top";
  "aria-hidden"?: boolean;
  style?: React.CSSProperties;
}

/**
 * Parallax allo scroll basato su GSAP ScrollTrigger (scrub), sincronizzato con
 * Lenis. Solo transform (GPU). Disattivato con prefers-reduced-motion e
 * attenuato su dispositivi touch (scroll inerziale + barre dinamiche del browser).
 */
export default function Parallax({
  children,
  className,
  speed = 0.12,
  relativeToParent = false,
  x = 0,
  origin = "center",
  style,
  ...rest
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          touch: "(pointer: coarse)",
        },
        (ctx) => {
          const { motion, touch } = ctx.conditions as { motion: boolean; touch: boolean };
          if (!motion) return;
          const k = touch ? 0.55 : 1;
          const range = 100 * speed * k; // px totali ±
          const top = origin === "top";
          gsap.fromTo(
            el,
            top ? { y: 0, x: 0 } : { y: -range, x: -range * x },
            {
              y: top ? range * 2 : range,
              x: top ? range * 2 * x : range * x,
              ease: "none",
              force3D: true,
              scrollTrigger: {
                trigger: relativeToParent ? el.parentElement ?? el : el,
                start: top ? "top top" : "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            }
          );
        }
      );
      return () => mm.revert();
    },
    { scope: ref, dependencies: [speed, x, relativeToParent, origin] }
  );

  return (
    <div
      ref={ref}
      className={cn("will-change-transform", className)}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
}
