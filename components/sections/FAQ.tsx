"use client";

import { useState } from "react";
import { useTranslations, useMessages } from "next-intl";
import AccordionItem from "@/components/ui/AccordionItem";
import RevealOnScroll from "@/components/animations/RevealOnScroll";

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
      <div className="container-core829 py-24 lg:py-32">
        <RevealOnScroll>
          <div className="max-w-2xl">
            <p className="kicker">{t("kicker")}</p>
            <h2 className="mt-4 text-section-title">{t("title")}</h2>
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="mt-14 max-w-3xl">
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
