"use client";

import { useTranslations, useMessages } from "next-intl";
import { ArrowRight, Server } from "lucide-react";
import SplitWords from "@/components/animations/SplitWords";
import CountUp from "@/components/animations/CountUp";
import Badge from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import ClientCarousel from "@/components/sections/ClientCarousel";
import { TrustpilotWidget } from "@/components/Trustpilot";
import { SocialLinks } from "@/components/SocialIcons";

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

  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-16"
    >
      {/* Elementi decorativi */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-24 h-96 w-96 rounded-full border border-border/60"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-40 h-48 w-48 rounded-full border border-accent/20"
      />

      <div className="container-core829 grid min-h-[calc(100vh-4rem)] min-h-[calc(100svh-4rem)] items-center gap-16 py-20 lg:grid-cols-2">
        <div>
          <Badge>
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            {t("badge")}
          </Badge>

          <SplitWords
            lines={headline}
            className="mt-8 text-display-sm font-semibold text-foreground lg:text-display"
          />

          <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground-muted sm:text-lg">
            {t("subtitle")}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button href="/preventivo" variant="primary">
              {t("ctaPrimary")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
            <Button href="#metodo" variant="secondary">
              {t("ctaSecondary")}
            </Button>
          </div>

          <div className="mt-8">
            <Link
              href="/servizi/server"
              className="group inline-flex max-w-full items-center gap-4 border border-border bg-surface p-4 pr-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:shadow-lg"
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

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5 border-t border-border pt-8">
            <TrustpilotWidget className="min-w-0 max-w-full" />
            <SocialLinks
              className="gap-2"
              iconClassName="h-10 w-10"
            />
          </div>

          <div className="mt-14 grid grid-cols-3 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="min-w-0">
                <p className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 max-w-[9rem] text-sm leading-snug text-foreground-muted">
                  {stat.label}
                </p>
              </div>
            ))}
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
    </section>
  );
}
