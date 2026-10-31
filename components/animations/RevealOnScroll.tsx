"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
  as?: "div" | "section" | "ul";
  /** Direzione/tipo di entrata (default: dal basso). */
  variant?: "up" | "left" | "right" | "scale" | "fade";
}

const FROM: Record<NonNullable<RevealOnScrollProps["variant"]>, (y: number) => gsap.TweenVars> = {
  up: (y) => ({ opacity: 0, y }),
  left: (y) => ({ opacity: 0, x: -y * 1.4 }),
  right: (y) => ({ opacity: 0, x: y * 1.4 }),
  scale: () => ({ opacity: 0, scale: 0.94, y: 16 }),
  fade: () => ({ opacity: 0 }),
};

/**
 * Reveal all'entrata nella viewport (varianti up/left/right/scale/fade),
 * con stagger sui figli diretti. Rispetta prefers-reduced-motion.
 */
export default function RevealOnScroll({
  children,
  className,
  stagger = 0.08,
  y = 40,
  as = "div",
  variant = "up",
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(el, { opacity: 1 });
        return;
      }

      const targets: Element[] =
        el.children.length > 0 ? Array.from(el.children) : [el];

      gsap.set(targets, FROM[variant](y));

      const ctx = gsap.context(() => {
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          // A fine animazione rimuove gli stili inline: altrimenti il transform
          // inline di GSAP batterebbe gli :hover in CSS (es. .card-lift).
          clearProps: "transform,opacity",
          duration: 0.9,
          ease: "power3.out",
          stagger,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            once: true,
          },
        });
      }, ref);

      return () => ctx.revert();
    },
    { scope: ref }
  );

  const Tag = as;
  return (
    <Tag ref={ref as never} className={cn(className)}>
      {children}
    </Tag>
  );
}
