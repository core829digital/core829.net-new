"use client";

import { useTranslations, useMessages } from "next-intl";
import { Check } from "lucide-react";
import RevealOnScroll from "@/components/animations/RevealOnScroll";
import SectionHeading from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

interface Model {
  title: string;
  desc: string;
  points: string[];
}

export default function PricingModel() {
  const t = useTranslations("pricing");
  const messages = useMessages();
  const models = (messages.pricing as unknown as { models: Model[] }).models;

  return (
    <section id="preventivo" className="bg-background">
      <div className="container-core829 py-24 lg:py-32">
        <SectionHeading
          kicker={t("kicker")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <RevealOnScroll
          stagger={0.1}
          className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 lg:mt-16"
        >
          {models.map((model, i) => (
            <div
              key={i}
              className="card-lift group flex flex-col border border-border bg-background p-6 sm:p-8 md:p-10"
            >
              <span className="font-mono text-sm tracking-widest text-accent">
                0{i + 1}
              </span>
              <h3 className="mt-6 text-xl font-semibold tracking-tight">
                {model.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
                {model.desc}
              </p>
              <ul className="mt-8 space-y-3 border-t border-border pt-8">
                {model.points.map((point, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </RevealOnScroll>

        <RevealOnScroll className="mt-14">
          <Button href="mailto:sales@core829.net?subject=Request%20a%20quote" variant="primary">
            {t("cta")}
          </Button>
        </RevealOnScroll>
      </div>
    </section>
  );
}
