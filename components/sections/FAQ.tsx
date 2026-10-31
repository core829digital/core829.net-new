"use client";

import { useState } from "react";
import { useTranslations, useMessages } from "next-intl";
import AccordionItem from "@/components/ui/AccordionItem";
import RevealOnScroll from "@/components/animations/RevealOnScroll";
import RevealWords from "@/components/animations/RevealWords";

interface FaqItem {
  q: string;
  a: string;
}

/**
 * FAQ — accordion con una sola voce aperta alla volta.
 */
export default function FAQ() {
  const t = useTranslations("faq");
  const messages = useMessages();
  const items = (messages.faq as unknown as { items: FaqItem[] }).items;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-surface">
      <div className="container-core829 grid grid-cols-1 gap-12 py-24 lg:grid-cols-12 lg:gap-16 lg:py-32">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <p className="kicker flex items-center gap-3">
              <span aria-hidden className="h-px w-8 bg-accent" />
              {t("kicker")}
            </p>
            <RevealWords text={t("title")} className="mt-5 text-section-title" />
          </div>
        </div>

        <RevealOnScroll className="lg:col-span-8">
          {items.map((item, i) => (
            <AccordionItem
              key={i}
              index={i}
              question={item.q}
              answer={item.a}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </RevealOnScroll>
      </div>
    </section>
  );
}
