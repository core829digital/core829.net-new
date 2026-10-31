"use client";

import { useTranslations, useMessages } from "next-intl";
import RevealOnScroll from "@/components/animations/RevealOnScroll";
import SectionHeading from "@/components/ui/SectionHeading";
import { FEATURE_ICON_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FeatureItem {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

// Griglia 4 colonne × 3 righe, 6 card, senza vuoti:
// riga 1-2: A (2×2) · B · C / D (2) — riga 3: E (2) · F (2).
const SPANS = [
  "lg:col-span-2 lg:row-span-2",
  "lg:col-span-1",
  "lg:col-span-1",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
];

/**
 * Bento grid — capability tecniche trasversali di CORE829.
 */
export default function Features() {
  const t = useTranslations("features");
  const messages = useMessages();
  const items = (messages.features as unknown as { items: FeatureItem[] }).items;

  return (
    <section className="bg-surface">
      <div className="container-core829 py-24 lg:py-32">
        <SectionHeading
          kicker={t("kicker")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <RevealOnScroll
          stagger={0.08}
          variant="scale"
          className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:auto-rows-[minmax(9rem,auto)]"
        >
          {items.map((item, i) => {
            const Icon = FEATURE_ICON_MAP[item.icon];
            const large = i === 0;
            return (
              <div
                key={item.id ?? i}
                className={cn(
                  "card-lift group border border-border bg-background p-8",
                  SPANS[i]
                )}
              >
                <span className="absolute right-6 top-6 font-mono text-xs tracking-widest text-foreground-muted/60">
                  0{i + 1}
                </span>
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <span className="flex h-11 w-11 items-center justify-center bg-foreground text-white transition-colors duration-300 group-hover:bg-accent">
                      {Icon && <Icon className="h-5 w-5" aria-hidden />}
                    </span>
                    <h3
                      className={cn(
                        "mt-6 font-semibold tracking-tight",
                        large ? "text-2xl" : "text-lg"
                      )}
                    >
                      {item.title}
                    </h3>
                  </div>
                  <p
                    className={cn(
                      "mt-4 leading-relaxed text-foreground-muted",
                      large ? "max-w-md" : "text-sm"
                    )}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </RevealOnScroll>
      </div>
    </section>
  );
}
