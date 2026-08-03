"use client";

import { useTranslations } from "next-intl";
import RevealOnScroll from "@/components/animations/RevealOnScroll";
import ContactForm from "@/components/sections/ContactForm";

/**
 * "Parliamone" — CTA finale con form di richiesta preventivo (id="contatti").
 */
export default function FinalCTA() {
  const t = useTranslations("finalCta");

  return (
    <section id="contatti" className="bg-background">
      <div className="container-core829 py-24 lg:py-32">
        <RevealOnScroll>
          <div className="max-w-2xl">
            <p className="kicker">{t("kicker")}</p>
            <h2 className="mt-4 text-section-title">{t("title")}</h2>
            <p className="mt-6 text-lg text-foreground-muted">{t("subtitle")}</p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="mt-14 max-w-2xl">
          <ContactForm />
        </RevealOnScroll>
      </div>
    </section>
  );
}
