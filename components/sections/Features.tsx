"use client";

import { useTranslations, useMessages } from "next-intl";
import RevealOnScroll from "@/components/animations/RevealOnScroll";
import { FEATURE_ICON_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FeatureItem {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

const SPANS = [
  "lg:col-span-2 lg:row-span-2",
  "lg:col-span-1",
  "lg:col-span-1",
  "lg:col-span-2",
  "lg:col-span-1 lg:row-span-2",
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
        <RevealOnScroll>
          <div className="max-w-2xl">
            <p className="kicker">{t("kicker")}</p>
            <h2 className="mt-4 text-section-title">{t("title")}</h2>
            <p className="mt-6 text-lg text-foreground-muted">{t("subtitle")}</p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="mt-16 grid grid-cols-1 gap-4 lg:grid-cols-4 lg:auto-rows-[minmax(9rem,auto)]">
          {items.map((item, i) => {
            const Icon = FEATURE_ICON_MAP[item.icon];
            const large = i === 0 || i === 4;
            return (
              <div
                key={item.id ?? i}
                className={cn(
                  "group relative overflow-hidden border border-border bg-background p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent",
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
