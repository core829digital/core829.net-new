"use client";

import { useState } from "react";
import { useImageLoop } from "@/lib/useImageLoop";
import { useMessages } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { CLIENTS_META, CLIENT_SCREENSHOTS } from "@/lib/constants";
import { useGoToSection } from "@/lib/useGoToSection";
import { cn } from "@/lib/utils";
import Parallax from "@/components/animations/Parallax";

interface Project {
  id: string;
  name: string;
  domain: string;
  sector: string;
}

interface ShowcaseItem {
  name: string;
  domain: string;
  sector: string;
  src: string;
  anchorId?: string;
}

const INTERVAL_MS = 5500;

/**
 * Vetrina dei progetti nell'hero: una sola cornice "browser" con dissolvenza
 * tra gli screenshot reali dei clienti, didascalia e indicatori.
 * - Click sulla cornice → scroll al case study corrispondente.
 * - Autoplay in pausa su hover/focus e disattivato con prefers-reduced-motion.
 * - Nessun testo hardcoded: nome, dominio e settore vengono dai messaggi i18n.
 */
export default function ClientShowcase() {
  const messages = useMessages();
  const goToSection = useGoToSection();
  const projects = (messages.caseStudies as unknown as { projects: Project[] })
    .projects;

  const items = projects
    .map((p) => ({
      name: p.name,
      domain: p.domain,
      sector: p.sector,
      src: CLIENT_SCREENSHOTS[p.domain]?.[0],
      anchorId: CLIENTS_META.find((c) => c.key === p.id)?.anchorId,
    }))
    .filter((x) => Boolean(x.src)) as ShowcaseItem[];

  const [paused, setPaused] = useState(false);
  const [active, setActive] = useImageLoop(
    items.map((i) => i.src),
    INTERVAL_MS,
    paused
  );

  if (items.length === 0) return null;
  const current = items[active];
  const total = String(items.length).padStart(2, "0");

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative">
      {/* Piano posteriore: dà profondità alla cornice */}
      <Parallax
        origin="top"
        speed={-0.14}
        aria-hidden
        className="absolute inset-0"
      >
        <div className="h-full w-full translate-x-3 translate-y-3 border border-border bg-surface sm:translate-x-4 sm:translate-y-4" />
      </Parallax>

      {/* Cornice principale */}
      <a
        href={current.anchorId ? `#${current.anchorId}` : undefined}
        onClick={(e) => {
          if (!current.anchorId) return;
          e.preventDefault();
          goToSection(`#${current.anchorId}`);
        }}
        aria-label={`${current.name} — ${current.domain}`}
        className="group relative block overflow-hidden border border-border bg-background shadow-lift"
      >
        <div
          aria-hidden
          className="flex items-center gap-3 border-b border-border bg-surface px-3 py-2.5"
        >
          <span className="flex gap-1.5">
            <span className="h-2 w-2 bg-border" />
            <span className="h-2 w-2 bg-border" />
            <span className="h-2 w-2 bg-border" />
          </span>
          <span className="truncate font-mono text-[10px] uppercase tracking-[0.2em] text-foreground-muted">
            {current.domain}
          </span>
          <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-foreground-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
        </div>

        <div className="relative aspect-[16/10] bg-surface">
          {items.map((item, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={item.domain}
              src={item.src}
              alt={i === active ? `${item.name} — ${item.domain}` : ""}
              aria-hidden={i !== active}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              className={cn(
                "absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-700 motion-reduce:transition-none",
                i === active ? "opacity-100" : "opacity-0"
              )}
            />
          ))}
        </div>
      </a>

      {/* Segni di registro agli angoli */}
      <span aria-hidden className="absolute -left-2 -top-2 h-3 w-3 border-l border-t border-accent" />
      <span aria-hidden className="absolute -right-2 -top-2 h-3 w-3 border-r border-t border-foreground/30" />
      </div>

      {/* Didascalia + indicatori */}
      <div className="relative mt-8 flex items-end justify-between gap-6 sm:mt-10">
        <div className="min-w-0">
          <p className="font-mono text-xs tracking-[0.25em] text-accent">
            {String(active + 1).padStart(2, "0")} / {total}
          </p>
          <p className="mt-2 truncate text-sm font-medium tracking-tight text-foreground">
            {current.name}
          </p>
          <p className="mt-0.5 truncate text-xs text-foreground-muted">
            {current.sector}
          </p>
        </div>

        {items.length > 1 && (
          <div className="flex shrink-0 items-center gap-1.5" role="group" aria-label={`${total}`}>
            {items.map((item, i) => (
              <button
                key={item.domain}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`${item.name}`}
                aria-current={i === active}
                className="group/dot flex min-h-11 min-w-6 items-center justify-center"
              >
                <span
                  className={cn(
                    "block h-0.5 transition-all duration-500",
                    i === active
                      ? "w-8 bg-accent"
                      : "w-5 bg-border group-hover/dot:bg-foreground-muted"
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
