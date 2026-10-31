"use client";

import { useTranslations, useMessages } from "next-intl";
import { ArrowUpRight, Check } from "lucide-react";
import RevealOnScroll from "@/components/animations/RevealOnScroll";
import SectionHeading from "@/components/ui/SectionHeading";
import { Link } from "@/i18n/navigation";
import { SERVICES_META } from "@/lib/constants";

interface Service {
  id: string;
  title: string;
  desc: string;
  bullets: string[];
}

/**
 * "La soluzione" — griglia dei servizi CORE829 con icona in badge nero,
 * hover con bordo rosso e leggero lift. Ogni card è un link alla pagina
 * dedicata del servizio; conserva l'anchor id per il footer.
 */
export default function Solution() {
  const t = useTranslations("solution");
  const tCta = useTranslations("finalCta");
  const messages = useMessages();
  const services = (messages.solution as unknown as { services: Service[] }).services;

  const visibleCount = services.filter((_, i) => !SERVICES_META[i]?.hidden).length;

  return (
    <section id="servizi" className="bg-surface">
      <div className="container-core829 py-24 lg:py-32">
        <SectionHeading
          kicker={t("kicker")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <RevealOnScroll
          stagger={0.07}
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-16 lg:gap-6 xl:grid-cols-4"
        >
          {services
            .map((service, i) => ({ service, meta: SERVICES_META[i] }))
            .filter(({ meta }) => !meta?.hidden)
            .map(({ service, meta }, visibleIndex) => {
            const Icon = meta?.icon;
            return (
              <Link
                key={service.id ?? meta?.key}
                href={`/servizi/${meta?.key ?? service.id}`}
                id={meta?.anchorId}
                className="card-lift group flex flex-col border border-border bg-background p-8"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center bg-foreground text-white transition-colors duration-300 group-hover:bg-accent">
                    {Icon && <Icon className="h-5 w-5" aria-hidden />}
                  </span>
                  <span className="font-mono text-sm tracking-widest text-foreground-muted">
                    0{visibleIndex + 1}
                  </span>
                </div>

                <h3 className="mt-8 text-lg font-semibold tracking-tight">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                  {service.desc}
                </p>

                <ul className="mt-6 space-y-2.5 border-t border-border pt-6">
                  {service.bullets.map((bullet, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-foreground-muted">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </Link>
            );
          })}

          {/* Con un numero dispari di servizi la griglia 2/4 colonne resterebbe
              con un vuoto: lo riempie un invito a parlarne (testi già tradotti). */}
          {visibleCount % 2 === 1 && (
            <Link
              href="/contatti"
              className="card-lift group flex flex-col justify-between border border-foreground bg-foreground p-8 text-white"
            >
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-white/60">
                {tCta("kicker")}
              </p>
              <p className="mt-10 font-display text-2xl leading-tight tracking-tight lg:text-[1.65rem]">
                {tCta("title")}
              </p>
              <span className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-white">
                {tCta("cta")}
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-500 ease-out-expo group-hover:-translate-y-1 group-hover:translate-x-1"
                  aria-hidden
                />
              </span>
            </Link>
          )}
        </RevealOnScroll>
      </div>
    </section>
  );
}
