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
}

/**
 * Reveal all'entrata nella viewport: opacity 0→1, y 40→0,
 * con stagger sui figli diretti. Rispetta prefers-reduced-motion.
 */
export default function RevealOnScroll({
  children,
  className,
  stagger = 0.08,
  y = 40,
  as = "div",
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

      gsap.set(targets, { opacity: 0, y });

      const ctx = gsap.context(() => {
        gsap.to(targets, {
          opacity: 1,
          y: 0,
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
