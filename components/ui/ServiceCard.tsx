"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { SERVICES_META } from "@/lib/constants";

interface Props {
  index: number;
}

/**
 * Card singola servizio per la pagina /servizi. Riproduce lo stile della
 * griglia in Solution.tsx: badge icona nero, hover bordo rosso + lift,
 * numerazione 01-08 e bullet list.
 */
export default function ServiceCard({ index }: Props) {
  const t = useTranslations("solution.services");
  const Icon = SERVICES_META[index].icon;

  return (
    <article className="group flex flex-col border border-border bg-background p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-xl">
      <div className="flex items-start justify-between">
        <span className="flex h-12 w-12 items-center justify-center bg-foreground text-white transition-colors duration-300 group-hover:bg-accent">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <span className="font-mono text-sm tracking-widest text-foreground-muted">
          0{index + 1}
        </span>
      </div>

      <h3 className="mt-8 text-lg font-semibold tracking-tight">
        {t(`${index}.title`)}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
        {t(`${index}.desc`)}
      </p>

      <ul className="mt-6 space-y-2.5 border-t border-border pt-6">
        {t.raw(`${index}.bullets`).map((bullet: string, j: number) => (
          <li
            key={j}
            className="flex items-start gap-2.5 text-sm text-foreground-muted"
          >
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
            {bullet}
          </li>
        ))}
      </ul>
    </article>
  );
}
