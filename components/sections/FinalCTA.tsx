"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import RevealOnScroll from "@/components/animations/RevealOnScroll";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

/**
 * "Parliamone" — CTA finale: titolo a sinistra, scheda d'azione a destra
 * (prenotazione, pagina contatti, area clienti attivi). Versione chiara
 * con griglia blueprint di sfondo.
 */
export default function FinalCTA() {
  const t = useTranslations("finalCta");

  return (
    <section className="relative overflow-hidden border-t border-border bg-surface">
      <div
        aria-hidden
        className="grid-bg grid-fade pointer-events-none absolute inset-0"
      />

      <div className="container-core829 relative grid grid-cols-1 items-center gap-12 py-24 lg:grid-cols-12 lg:gap-16 lg:py-32">
        <RevealOnScroll className="lg:col-span-7">
          <p className="kicker">{t("kicker")}</p>
          <h2 className="mt-4 text-display-sm font-semibold lg:text-[clamp(2.5rem,4.2vw,3.75rem)] lg:leading-[1.04] lg:tracking-[-0.035em]">
            {t("title")}
          </h2>
          <p className="mt-6 max-w-xl text-lg text-foreground-muted">
            {t("subtitle")}
          </p>
        </RevealOnScroll>

        <RevealOnScroll className="lg:col-span-5">
          <div className="relative border border-border bg-background p-8 shadow-soft sm:p-10">
            <span
              aria-hidden
              className="absolute -left-1.5 -top-1.5 h-3 w-3 bg-accent"
            />
            <Button
              href="https://bookings.core829.net/book/intro-call"
              variant="primary"
              className="w-full"
            >
              {t("cta")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>

            <Link
              href="/contatti"
              className="group mt-3 flex min-h-11 items-center justify-between border border-border px-5 text-sm font-medium text-foreground transition-colors duration-300 hover:border-foreground"
            >
              {t("kicker")}
              <ArrowUpRight
                className="h-4 w-4 text-foreground-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                aria-hidden
              />
            </Link>

            <div className="mt-8 border-t border-border pt-6">
              <p className="text-sm font-semibold text-foreground">
                {t("existingClient")}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                <a
                  href="mailto:projects@core829.net"
                  className="font-medium text-foreground underline decoration-accent/50 underline-offset-4 transition-colors hover:text-accent"
                >
                  projects@core829.net
                </a>{" "}
                — {t("projectsMail")}
              </p>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
