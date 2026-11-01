"use client";

import { useMessages } from "next-intl";
import Marquee from "@/components/ui/Marquee";
import {
  CLIENTS_META,
  CLIENT_LOGOS,
  CLIENT_LOGO_COLOR,
  CLIENT_LOGO_ICON_ONLY,
  CLIENT_LOGO_SIZE,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
}

/** Altezza (px) dei loghi nel marquee: uguale per tutti per coerenza visiva. */
const LOGO_H = 36;

/**
 * Riga di loghi in loop continuo con TUTTI i clienti e prodotti (OneSpec incluso).
 * Ogni voce ha una scatola di dimensioni fisse (width/height espliciti): le due
 * metà del marquee misurano identiche e il loop non ha salti.
 */
export default function LogoMarquee({
  reverse = false,
  duration = 38,
  className,
}: {
  reverse?: boolean;
  duration?: number;
  className?: string;
}) {
  const messages = useMessages();
  const projects = (messages.caseStudies as unknown as { projects: Project[] }).projects;
  const names = Object.fromEntries(projects.map((p) => [p.id, p.name]));

  const items = reverse ? [...CLIENTS_META].reverse() : CLIENTS_META;

  return (
    <Marquee reverse={reverse} duration={duration} className={className}>
      {items.map((client) => {
        const size = CLIENT_LOGO_SIZE[client.key];
        const logo = CLIENT_LOGOS[client.key];
        const w = Math.round((LOGO_H * size.w) / size.h);
        const iconOnly = CLIENT_LOGO_ICON_ONLY.has(client.key);
        return (
          <a
            key={client.key}
            href={client.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={names[client.key] ?? client.key}
            className="group flex min-h-11 shrink-0 items-center gap-3 px-8 sm:px-12"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo}
              alt=""
              width={w}
              height={LOGO_H}
              loading="eager"
              decoding="async"
              draggable={false}
              className={cn(
                "block shrink-0 object-contain opacity-70 transition duration-300 group-hover:opacity-100",
                CLIENT_LOGO_COLOR.has(client.key) &&
                  "grayscale group-hover:grayscale-0"
              )}
              style={{ width: w, height: LOGO_H }}
            />
            {iconOnly && (
              <span className="whitespace-nowrap font-display text-lg tracking-tight text-foreground-muted transition-colors duration-300 group-hover:text-foreground">
                {names[client.key] ?? client.key}
              </span>
            )}
          </a>
        );
      })}
    </Marquee>
  );
}
