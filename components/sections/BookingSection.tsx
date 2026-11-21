"use client";

import { useLocale, useTranslations } from "next-intl";
import RevealOnScroll from "@/components/animations/RevealOnScroll";
import { bookingEmbedUrl } from "@/lib/booking";

/**
 * Prenotazione in tempo reale: widget incorporato, in flusso normale tra la
 * fine del tunnel e il footer (un iframe non va dentro un piano 3D).
 * Testi presi da chiavi già tradotte.
 */
export default function BookingSection() {
  const t = useTranslations();
  const locale = useLocale();

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
              // key: al cambio lingua il widget si ricarica con la nuova lingua
              key={locale}
              src={bookingEmbedUrl(locale)}
              width="100%"
              height={720}
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
