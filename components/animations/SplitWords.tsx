"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

/**
 * Headline animata parola-per-parola all'ingresso (non on-scroll).
 * Riceve un array di righe; ogni parola è wrappata in uno span.
 */
export default function SplitWords({
  lines,
  className,
  lineClassName,
  accentLast = false,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  /** Ultima riga nel colore d'accento (rosso). */
  accentLast?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const words = el.querySelectorAll<HTMLElement>(".split-word");
      gsap.set(words, { opacity: 0, y: "0.6em", rotateX: -40 });

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(words, { opacity: 1, y: 0, rotateX: 0 });
        return;
      }

      const ctx = gsap.context(() => {
        gsap.to(words, {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.06,
          delay: 0.2,
        });
      }, ref);

      return () => ctx.revert();
    },
    { scope: ref }
  );

  return (
    <h1 ref={ref} className={className} style={{ perspective: "800px" }}>
      {lines.map((line, i) => (
        <span
          key={i}
          className={cn(
            lineClassName ?? "block overflow-hidden pb-[0.12em]",
            accentLast && i === lines.length - 1 && "text-accent"
          )}
        >
          {line.split(" ").map((word, j) => (
            <span
              key={j}
              className="split-word mr-[0.28em] inline-block [overflow-wrap:anywhere] will-change-transform last:mr-0"
            >
              {word}
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}
