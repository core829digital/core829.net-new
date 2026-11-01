"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useSlideDistance, useStage } from "@/components/tunnel/DepthStage";
import { cn } from "@/lib/utils";

/** Titolo di slide: scala con la larghezza ma non supera il 5.4% dell'altezza (schermi bassi). */
export const SLIDE_TITLE =
  "text-[clamp(1.4rem,min(1rem+2.4vw,5.4svh),3.25rem)] leading-[1.1] tracking-[-0.025em]";

/** Intestazione di slide: kicker mono + titolo display (poche parole). */
export function SlideHeading({
  kicker,
  title,
  className,
  titleClassName,
  as: Tag = "h2",
  leftOnLg = false,
}: {
  kicker?: string;
  /** Da lg in su il blocco si allinea a sinistra (layout a due colonne). */
  leftOnLg?: boolean;
  title: string;
  className?: string;
  titleClassName?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("max-w-4xl text-center", leftOnLg && "lg:text-left", className)}>
      {kicker && (
        <p
          className={cn(
            "kicker mb-3 flex items-center justify-center gap-3 sm:mb-4",
            leftOnLg && "lg:justify-start"
          )}
        >
          <span aria-hidden className="h-px w-6 bg-accent sm:w-8" />
          {kicker}
          <span aria-hidden className={cn("h-px w-6 bg-accent sm:w-8", leftOnLg && "lg:hidden")} />
        </p>
      )}
      <Tag className={titleClassName ?? SLIDE_TITLE}>{title}</Tag>
    </div>
  );
}

/**
 * Numero che conta da 0 al valore quando la slide diventa quella attiva
 * (nel tunnel) o subito (modalità flat). Parte una sola volta.
 */
export function DepthCount({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const slideD = useSlideDistance();
  const fallback = useMotionValue(0);
  const d = slideD ?? fallback;
  const { mode } = useStage();
  const [n, setN] = useState(0);
  const done = useRef(false);

  const run = () => {
    if (done.current) return;
    done.current = true;
    animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setN(Math.round(v)),
    });
  };

  useMotionValueEvent(d, "change", (v) => {
    if (slideD && Math.abs(v) < 0.25) run();
  });

  useEffect(() => {
    if (mode === "flat") {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) setN(value);
      else run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, value]);

  return (
    <span className={cn("tabular-nums", className)}>
      {n}
      {suffix}
    </span>
  );
}

/** Classi comuni delle card delle slide (bordo sottile + hover rosso). */
export const slideCard =
  "card-lift border border-border bg-background/80 backdrop-blur-sm";
