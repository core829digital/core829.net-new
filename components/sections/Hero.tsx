"use client";

import { useTranslations, useMessages } from "next-intl";
import { ArrowRight, Server } from "lucide-react";
import SplitWords from "@/components/animations/SplitWords";
import CountUp from "@/components/animations/CountUp";
import RevealOnScroll from "@/components/animations/RevealOnScroll";
import Badge from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import ClientCarousel from "@/components/sections/ClientCarousel";
import { TrustpilotWidget } from "@/components/Trustpilot";
import { SocialLinks } from "@/components/SocialIcons";
import { SERVICES_META } from "@/lib/constants";

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

/**
 * Hero: badge announcement, headline animata parola-per-parola,
 * carousel automatico dei clienti, CTAs e statistiche con count-up.
 */
export default function Hero() {
  const t = useTranslations("hero");
  const messages = useMessages();
  const m = messages as unknown as { stats: Stat[]; hero: { headline: string[] } };
  const stats = m.stats;
  const headline = m.hero.headline;
  const serverService = SERVICES_META.find((s) => s.key === "server");

  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-16"
    >
      {/* Sfondo tecnico: griglia blueprint sfumata */}
      <div
        aria-hidden
        className="grid-bg grid-fade pointer-events-none absolute inset-0"
      />

      <div className="container-core829 relative grid grid-cols-1 items-center gap-14 pb-12 pt-16 sm:pt-20 lg:grid-cols-2 lg:gap-16 lg:pb-16 lg:pt-24">
        <div>
          <Badge>
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            {t("badge")}
          </Badge>

          <SplitWords
            lines={headline}
            className="mt-8 text-display-sm font-semibold text-foreground lg:text-[clamp(2.75rem,3.9vw,3.75rem)] lg:leading-[1.04] lg:tracking-[-0.035em]"
          />

          <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground-muted sm:text-lg">
            {t("subtitle")}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button href="https://bookings.core829.net/book/intro-call" variant="primary">
              {t("ctaPrimary")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
            <Button href="#metodo" variant="secondary">
              {t("ctaSecondary")}
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
            <TrustpilotWidget className="min-w-0 max-w-full" />
            <SocialLinks
              className="gap-2"
              iconClassName="h-10 w-10"
            />
          </div>
        </div>

        <div className="relative">
          <div
            aria-hidden
            className="absolute -left-6 -top-6 z-20 h-3 w-3 bg-accent"
          />
          <ClientCarousel />
        </div>
      </div>

      {/* Fascia di prova: numeri + annuncio Server */}
      <div className="container-core829 relative pb-16 lg:pb-24">
        <div className="grid grid-cols-1 gap-10 border-t border-border pt-10 lg:grid-cols-12 lg:items-center">
          <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:col-span-7">
            {stats.map((stat, i) => (
              <div key={i} className="min-w-0 border-l border-border pl-4 sm:pl-6">
                <p className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 max-w-[10rem] text-sm leading-snug text-foreground-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {!serverService?.hidden && (
            <div className="lg:col-span-5 lg:justify-self-end">
              <Link
                href="/servizi/server"
                className="group inline-flex max-w-full items-center gap-4 border border-border bg-background p-4 pr-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:shadow-lift"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-foreground text-white transition-colors duration-300 group-hover:bg-accent">
                  <Server className="h-5 w-5" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    {t("serverCtaLabel")}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                  </span>
                  <span className="text-xs text-foreground-muted">
                    {t("serverCtaHint")}
                  </span>
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="container-core829 pb-20 lg:pb-32">
        <RevealOnScroll>
          <p className="kicker">Prenota una chiamata</p>
          <h2 className="mt-3 text-section-subtitle font-semibold text-foreground">
            Scegli un orario, in tempo reale
          </h2>
          <div className="mt-8 overflow-hidden border border-border bg-surface">
            <iframe
              src="https://bookings.core829.net/embed/intro-call?accent=%23e11d2e&font=Inter"
              width="100%"
              height={700}
              style={{ border: 0, display: "block" }}
              title="Prenota una chiamata con CORE829"
            />
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
