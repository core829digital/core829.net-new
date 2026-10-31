"use client";

import { useTranslations, useMessages } from "next-intl";
import RevealOnScroll from "@/components/animations/RevealOnScroll";
import SectionHeading from "@/components/ui/SectionHeading";

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
        <SectionHeading kicker={t("kicker")} title={t("title")} />

        <RevealOnScroll
          stagger={0.12}
          className="mt-14 grid grid-cols-1 gap-px overflow-hidden border border-border bg-border md:grid-cols-3 lg:mt-16"
        >
          {items.map((item, i) => (
            <div
              key={i}
              className="group bg-background p-8 transition-colors duration-500 hover:bg-surface lg:p-10 xl:p-12"
            >
              <span className="font-mono text-sm tracking-widest text-accent">
                0{i + 1}
              </span>
              <h3 className="mt-6 text-xl tracking-tight transition-transform duration-500 ease-out-expo group-hover:translate-x-1">
                {item.title}
              </h3>
              <p className="mt-4 leading-relaxed text-foreground-muted">
                {item.desc}
              </p>
            </div>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
