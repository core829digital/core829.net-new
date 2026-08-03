"use client";

import { useMessages } from "next-intl";
import { CLIENT_SCREENSHOTS } from "@/lib/constants";

interface Project {
  name: string;
  domain: string;
}

interface CarouselItem {
  name: string;
  domain: string;
  src: string;
}

/**
 * Carousel orizzontale automatico (marquee seamless, loop -50%) con gli
 * screenshot reali dei clienti. Pausa su hover e rispetto prefers-reduced-motion.
 * Mostra solo i clienti che hanno uno screenshot fornito.
 */
export default function ClientCarousel() {
  const messages = useMessages();
  const projects = (
    messages.caseStudies as unknown as { projects: Project[] }
  ).projects;

  const items: CarouselItem[] = projects
    .map((p) => ({ name: p.name, domain: p.domain, src: CLIENT_SCREENSHOTS[p.domain] }))
    .filter((x): x is CarouselItem => Boolean(x.src));

  if (items.length === 0) return null;

  return (
    <div className="relative">
      {/* Fade sui lati */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent"
      />

      <div className="group/carousel overflow-hidden">
        <div
          className="marquee-track gap-5"
          style={{ "--marquee-duration": "42s" } as React.CSSProperties}
        >
          {[0, 1].map((dup) => (
            <div
              key={dup}
              aria-hidden={dup === 1}
              className="flex shrink-0 items-stretch gap-5 pr-5"
            >
              {items.map((item) => (
                <figure
                  key={item.domain}
                  className="w-72 shrink-0 border border-border bg-surface sm:w-80"
                >
                  <div className="relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.src}
                      alt={`${item.name} — ${item.domain}`}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[16/10] w-full object-cover object-top"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-foreground/10"
                    />
                  </div>
                  <figcaption className="flex items-baseline justify-between gap-3 px-4 py-3">
                    <span className="text-sm font-medium tracking-tight">
                      {item.name}
                    </span>
                    <span className="font-mono text-[11px] text-foreground-muted">
                      {item.domain}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}