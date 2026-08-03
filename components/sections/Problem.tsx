"use client";

import { useTranslations, useMessages } from "next-intl";
import RevealOnScroll from "@/components/animations/RevealOnScroll";

interface ProblemItem {
  title: string;
  desc: string;
}

/**
 * "Il problema" — 3 pain point reali delle PMI digitalizzate male.
 */
export default function Problem() {
  const t = useTranslations("problem");
  const messages = useMessages();
  const items = (messages.problem as unknown as { items: ProblemItem[] }).items;

  return (
    <section className="bg-background">
      <div className="container-core829 py-24 lg:py-32">
        <RevealOnScroll>
          <div className="max-w-2xl">
            <p className="kicker">{t("kicker")}</p>
            <h2 className="mt-4 text-section-title">{t("title")}</h2>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
            {items.map((item, i) => (
              <div
                key={i}
                className="group bg-background p-8 transition-colors duration-300 hover:bg-surface lg:p-10"
              >
                <span className="font-mono text-sm tracking-widest text-accent">
                  0{i + 1}
                </span>
                <h3 className="mt-6 text-xl font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-4 leading-relaxed text-foreground-muted">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
