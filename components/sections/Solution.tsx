"use client";

import { useTranslations, useMessages } from "next-intl";
import { Check } from "lucide-react";
import RevealOnScroll from "@/components/animations/RevealOnScroll";
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
  const messages = useMessages();
  const services = (messages.solution as unknown as { services: Service[] }).services;

  return (
    <section id="servizi" className="bg-surface">
      <div className="container-core829 py-24 lg:py-32">
        <RevealOnScroll>
          <div className="max-w-2xl">
            <p className="kicker">{t("kicker")}</p>
            <h2 className="mt-4 text-section-title">{t("title")}</h2>
            <p className="mt-6 text-lg text-foreground-muted">{t("subtitle")}</p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => {
            const meta = SERVICES_META[i];
            const Icon = meta?.icon;
            return (
              <Link
                key={service.id ?? i}
                href={`/servizi/${meta?.key ?? service.id}`}
                id={meta?.anchorId}
                className="group flex flex-col border border-border bg-background p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center bg-foreground text-white transition-colors duration-300 group-hover:bg-accent">
                    {Icon && <Icon className="h-5 w-5" aria-hidden />}
                  </span>
                  <span className="font-mono text-sm tracking-widest text-foreground-muted">
                    0{i + 1}
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
        </RevealOnScroll>
      </div>
    </section>
  );
}
