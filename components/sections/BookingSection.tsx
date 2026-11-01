"use client";

import { useTranslations } from "next-intl";
import RevealOnScroll from "@/components/animations/RevealOnScroll";

/**
 * Prenotazione in tempo reale: widget incorporato, in flusso normale tra la
 * fine del tunnel e il footer (un iframe non va dentro un piano 3D).
 * Testi presi da chiavi già tradotte.
 */
export default function BookingSection() {
  const t = useTranslations();

  return (
    <section id="prenota" className="relative border-t border-border bg-surface">
      <div className="container-core829 py-16 lg:py-24">
        <RevealOnScroll>
          <p className="kicker flex items-center gap-3">
            <span aria-hidden className="h-px w-8 bg-accent" />
            {t("nav.bookCta")}
          </p>
          <h2 className="mt-4 text-section-subtitle">{t("hero.ctaPrimary")}</h2>
          <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-background">
            <iframe
              src="https://bookings.core829.net/embed/intro-call?accent=%23e11d2e&font=Inter"
              width="100%"
              height={700}
              loading="lazy"
              style={{ border: 0, display: "block" }}
              title={t("nav.bookCta")}
            />
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
