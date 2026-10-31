"use client";

import { useTranslations, useMessages } from "next-intl";
import { ArrowRight, Server } from "lucide-react";
import SplitWords from "@/components/animations/SplitWords";
import CountUp from "@/components/animations/CountUp";
import RevealOnScroll from "@/components/animations/RevealOnScroll";
import Parallax from "@/components/animations/Parallax";
import Badge from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import ClientShowcase from "@/components/sections/ClientShowcase";
import { TrustpilotWidget } from "@/components/Trustpilot";
import { SERVICES_META, REAL_CLIENTS_META } from "@/lib/constants";

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
  // Prima statistica = clienti seguiti: allineata ai case study dei clienti
  // reali (i prodotti propri, es. OneSpec, non contano come clienti).
  const projectCount = (
    messages as unknown as { caseStudies: { projects: { id: string }[] } }
  ).caseStudies.projects.filter((p) =>
    REAL_CLIENTS_META.some((c) => c.key === p.id)
  ).length;
  const stats = m.stats.map((stat, i) =>
    i === 0 ? { ...stat, value: projectCount } : stat
  );
  const headline = m.hero.headline;
  const serverService = SERVICES_META.find((s) => s.key === "server");

  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-[calc(4rem+env(safe-area-inset-top))]"
    >
      {/* Sfondo tecnico: griglia blueprint sfumata, con parallax lento */}
      <Parallax
        origin="top"
        speed={0.3}
        aria-hidden
        className="pointer-events-none absolute -inset-y-[12%] inset-x-0"
      >
        <div className="grid-bg grid-fade h-full w-full" />
      </Parallax>

      {/* Segni di registro agli angoli + etichette laterali (da Andromedia Web) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-3 hidden md:block lg:inset-5"
      >
        <span className="absolute left-0 top-16 h-5 w-5 border-l border-t border-foreground/30" />
        <span className="absolute right-0 top-16 h-5 w-5 border-r border-t border-foreground/30" />
        <span className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-foreground/30" />
        <span className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-foreground/30" />
        <span className="absolute left-1 top-1/2 hidden -translate-y-1/2 -rotate-90 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.4em] text-foreground-muted/70 2xl:block">
          CORE829 SRL
        </span>
        <span className="absolute right-1 top-1/2 hidden -translate-y-1/2 rotate-90 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.4em] text-foreground-muted/70 2xl:block">
          Roman · România
        </span>
      </div>

      <div className="container-core829 relative grid grid-cols-1 items-center gap-14 pb-14 pt-12 sm:pt-16 lg:grid-cols-[1.08fr_1fr] lg:gap-16 lg:pb-20 lg:pt-20 xl:gap-24">
        <div className="min-w-0">
          <Badge>
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            {t("badge")}
          </Badge>

          <SplitWords
            lines={headline}
            accentLast
            className="mt-8 text-display font-medium text-foreground"
          />

          <p className="mt-7 max-w-xl text-base leading-relaxed text-foreground-muted sm:text-lg">
            {t("subtitle")}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
            <Button href="https://bookings.core829.net/book/intro-call" variant="primary">
              {t("ctaPrimary")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
            <Button href="#metodo" variant="secondary">
              {t("ctaSecondary")}
            </Button>
          </div>

          <div className="mt-10">
            <TrustpilotWidget className="min-w-0 max-w-full" />
          </div>
        </div>

        <Parallax origin="top" speed={0.08} className="relative min-w-0">
          <ClientShowcase />
        </Parallax>
      </div>

      {/* Fascia di prova: numeri + annuncio Server */}
      <div className="container-core829 relative pb-16 lg:pb-24">
        <div className="grid grid-cols-1 gap-10 border-t border-border pt-10 lg:grid-cols-12 lg:items-center">
          <RevealOnScroll
            stagger={0.12}
            className="grid grid-cols-3 gap-4 sm:gap-6 lg:col-span-7"
          >
            {stats.map((stat, i) => (
              <div key={i} className="min-w-0 border-l border-border pl-4 sm:pl-6">
                <p className="font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl xl:text-5xl">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 max-w-[11rem] text-sm leading-snug text-foreground-muted">
                  {stat.label}
                </p>
              </div>
            ))}
          </RevealOnScroll>

          {!serverService?.hidden && (
            <RevealOnScroll variant="right" className="lg:col-span-5 lg:justify-self-end">
              <Link
                href="/servizi/server"
                className="card-lift group inline-flex max-w-full items-center gap-4 border border-border bg-background p-4 pr-6"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-foreground text-white transition-colors duration-500 group-hover:bg-accent">
                  <Server className="h-5 w-5" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    {t("serverCtaLabel")}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" aria-hidden />
                  </span>
                  <span className="text-xs text-foreground-muted">
                    {t("serverCtaHint")}
                  </span>
                </span>
              </Link>
            </RevealOnScroll>
          )}
        </div>
      </div>

      <div className="container-core829 pb-20 lg:pb-32">
        <RevealOnScroll>
          <p className="kicker">Prenota una chiamata</p>
          <h2 className="mt-3 text-section-subtitle text-foreground">
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
