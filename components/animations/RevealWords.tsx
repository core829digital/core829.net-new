"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Testo (titoli di sezione) che entra parola per parola con maschera, allo
 * scroll — come RevealWords di Andromedia. Le parole sono inline-block con
 * `overflow-wrap:anywhere` (una parola molto lunga non causa mai overflow).
 * Il testo completo resta per gli screen reader. Con prefers-reduced-motion
 * compare subito.
 */
export default function RevealWords({
  text,
  className,
  as: Tag = "h2",
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}) {
  const ref = useRef<HTMLElement>(null);
  const words = text.split(" ");

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const targets = el.querySelectorAll<HTMLElement>("[data-w]");
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(targets, { yPercent: 115 });
        gsap.to(targets, {
          yPercent: 0,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.05,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [text] }
  );

  const Comp = Tag as React.ElementType;
  return (
    <Comp ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="inline-block max-w-full overflow-hidden pb-[0.14em] align-bottom [overflow-wrap:anywhere]"
          style={{ marginBottom: "-0.14em" }}
        >
          <span data-w className="inline-block will-change-transform">
            {w}
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Comp>
  );
}
