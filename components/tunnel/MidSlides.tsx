"use client";

import { useState } from "react";
import { useMessages, useTranslations } from "next-intl";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { DepthItem, DepthSlide, radial } from "@/components/tunnel/DepthStage";
import { DepthCount, SlideHeading, slideCard } from "@/components/tunnel/parts";
import LogoMarquee from "@/components/ui/LogoMarquee";
import AccordionItem from "@/components/ui/AccordionItem";
import { Button } from "@/components/ui/Button";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { Link } from "@/i18n/navigation";
import { FEATURE_ICON_MAP, SERVICES_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SlideProps = { index?: number };

/* ─────────── Partner: loghi in loop + numeri ─────────── */

export function TrustedSlide({ index }: SlideProps) {
  const t = useTranslations("trustedBy");
  const messages = useMessages();
  const stats = (messages as unknown as { stats: { value: number; suffix: string; label: string }[] })
    .stats;
  const clients = (messages as unknown as { caseStudies: { projects: { id: string }[] } })
    .caseStudies.projects.length;

  return (
    <DepthSlide index={index} id="partner">
      <SlideHeading title={t("label")} />

      <DepthItem dir={[0, 0]} depth={0.7} className="w-screen max-w-none">
        <div className="space-y-3 sm:space-y-5">
          <LogoMarquee duration={42} />
          <LogoMarquee reverse duration={48} />
        </div>
      </DepthItem>

      <div className="grid w-full max-w-5xl grid-cols-3 gap-3 sm:gap-8 xl:max-w-6xl">
        {stats.map((stat, i) => (
          <DepthItem
            key={i}
            dir={radial(i, 3, 3)}
            delay={i}
            className="border-l border-border pl-3 sm:pl-6"
          >
            <p className="font-display text-3xl font-medium tracking-tight sm:text-5xl xl:text-6xl">
              <DepthCount value={i === 0 ? clients : stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-1.5 text-xs leading-snug text-foreground-muted sm:text-sm xl:text-base">
              {stat.label}
            </p>
          </DepthItem>
        ))}
      </div>
    </DepthSlide>
  );
}

/* ─────────── Problema ─────────── */

export function ProblemSlide({ index }: SlideProps) {
  const t = useTranslations("problem");
  const messages = useMessages();
  const items = (messages.problem as unknown as { items: { title: string; desc: string }[] }).items;

  return (
    <DepthSlide index={index} id="problema">
      <SlideHeading kicker={t("kicker")} title={t("title")} />
      <ul className="grid w-full max-w-6xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5 2xl:max-w-7xl">
        {items.map((item, i) => (
          <DepthItem
            as="li"
            key={i}
            dir={radial(i, items.length, items.length)}
            delay={i}
            rotate={i === 1 ? 0 : i === 0 ? -4 : 4}
            className={cn(slideCard, "p-5 sm:p-8 xl:p-12")}
          >
            <span className="font-mono text-sm tracking-widest text-accent">0{i + 1}</span>
            <p className="mt-3 font-display text-lg leading-snug tracking-tight sm:mt-6 sm:text-2xl xl:mt-10 xl:text-3xl xl:mt-10 xl:text-3xl">
              {item.title}
            </p>
            <span className="sr-only">{item.desc}</span>
          </DepthItem>
        ))}
      </ul>
    </DepthSlide>
  );
}

/* ─────────── Servizi ─────────── */

export function ServicesSlide({ index }: SlideProps) {
  const t = useTranslations("solution");
  const tCta = useTranslations("finalCta");
  const messages = useMessages();
  const services = (
    messages.solution as unknown as {
      services: { title: string; desc: string }[];
    }
  ).services;
  const visible = services
    .map((s, i) => ({ s, meta: SERVICES_META[i] }))
    .filter(({ meta }) => meta && !meta.hidden);
  const odd = visible.length % 2 === 1;
  const total = visible.length + (odd ? 1 : 0);

  return (
    <DepthSlide index={index} id="servizi">
      <SlideHeading kicker={t("kicker")} title={t("title")} />
      <ul className="grid w-full max-w-6xl grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 2xl:max-w-7xl">
        {visible.map(({ s, meta }, i) => {
          const Icon = meta.icon;
          return (
            <DepthItem
              as="li"
              key={meta.key}
              dir={radial(i, total, 4)}
              delay={i % 4}
              rotate={(i % 2 ? 1 : -1) * 3}
              className="min-h-0"
            >
              <Link
                href={`/servizi/${meta.key}`}
                id={meta.anchorId}
                className={cn(slideCard, "group flex h-full items-center gap-3 p-3 sm:flex-col sm:items-start sm:gap-5 sm:p-6 xl:gap-8 xl:p-8")}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-foreground text-white transition-colors duration-300 group-hover:bg-accent sm:h-11 sm:w-11 xl:h-14 xl:w-14 rounded-xl">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                </span>
                <span className="font-display text-[0.8rem] leading-snug tracking-tight sm:text-base xl:text-xl">
                  {s.title}
                </span>
                <span className="sr-only">{s.desc}</span>
              </Link>
            </DepthItem>
          );
        })}
        {odd && (
          <DepthItem as="li" dir={radial(visible.length, total, 4)} delay={3} rotate={3}>
            <Link
              href="/contatti"
              className="card-lift group flex h-full items-center justify-between gap-3 border border-foreground bg-foreground p-3 text-white sm:flex-col sm:items-start sm:justify-between sm:p-6 xl:p-8"
            >
              <span className="font-display text-[0.8rem] leading-snug tracking-tight sm:text-base xl:text-xl">
                {tCta("title")}
              </span>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 transition-transform duration-500 ease-out-expo group-hover:-translate-y-1 group-hover:translate-x-1 sm:h-5 sm:w-5"
                aria-hidden
              />
            </Link>
          </DepthItem>
        )}
      </ul>
    </DepthSlide>
  );
}

/* ─────────── Metodo ─────────── */

export function MethodSlide({ index }: SlideProps) {
  const t = useTranslations("process");
  const messages = useMessages();
  const steps = (messages.process as unknown as { steps: { title: string; desc: string }[] }).steps;

  return (
    <DepthSlide index={index} id="metodo">
      <SlideHeading kicker={t("kicker")} title={t("title")} />
      <ol className="relative grid w-full max-w-6xl grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-6 2xl:max-w-7xl">
        <span
          aria-hidden
          className="absolute left-0 right-0 top-[1.15rem] hidden h-px bg-border sm:block xl:top-6"
        />
        {steps.map((step, i) => (
          <DepthItem
            as="li"
            key={i}
            dir={radial(i, steps.length, steps.length)}
            delay={i}
            className="relative"
          >
            <span className="relative z-10 flex h-9 w-9 items-center justify-center bg-accent font-mono text-sm text-white xl:h-12 xl:w-12 xl:text-base rounded-xl">
              {i + 1}
            </span>
            <p className="mt-4 font-display text-lg leading-tight tracking-tight sm:mt-6 sm:text-2xl xl:text-3xl">
              {step.title}
            </p>
            <span className="sr-only">{step.desc}</span>
          </DepthItem>
        ))}
      </ol>
    </DepthSlide>
  );
}

/* ─────────── Competenze ─────────── */

export function FeaturesSlide({ index }: SlideProps) {
  const t = useTranslations("features");
  const messages = useMessages();
  const items = (
    messages.features as unknown as { items: { id: string; icon: string; title: string; desc: string }[] }
  ).items;

  return (
    <DepthSlide index={index} id="competenze">
      <SlideHeading kicker={t("kicker")} title={t("title")} />
      <ul className="grid w-full max-w-5xl grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 xl:max-w-6xl">
        {items.map((item, i) => {
          const Icon = FEATURE_ICON_MAP[item.icon];
          return (
            <DepthItem
              as="li"
              key={item.id ?? i}
              dir={radial(i, items.length, 3)}
              delay={i % 3}
              rotate={(i % 2 ? 1 : -1) * 3}
              className={cn(slideCard, "flex items-center gap-3 p-3.5 sm:p-5 xl:gap-5 xl:p-8")}
            >
              {Icon && (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-foreground text-white sm:h-11 sm:w-11 xl:h-14 xl:w-14 rounded-xl">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                </span>
              )}
              <span className="font-display text-[0.8rem] leading-snug tracking-tight sm:text-base xl:text-xl">
                {item.title}
              </span>
              <span className="sr-only">{item.desc}</span>
            </DepthItem>
          );
        })}
      </ul>
    </DepthSlide>
  );
}

/* ─────────── Modelli di collaborazione ─────────── */

export function PricingSlide({ index }: SlideProps) {
  const t = useTranslations("pricing");
  const messages = useMessages();
  const models = (messages.pricing as unknown as { models: { title: string; desc: string; points: string[] }[] })
    .models;

  return (
    <DepthSlide index={index} id="preventivo">
      <SlideHeading kicker={t("kicker")} title={t("title")} />
      <ul className="grid w-full max-w-5xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5 xl:max-w-6xl">
        {models.map((m, i) => (
          <DepthItem
            as="li"
            key={i}
            dir={radial(i, models.length, models.length)}
            delay={i}
            rotate={i === 1 ? 0 : i === 0 ? -3 : 3}
            className={cn(slideCard, "flex items-center gap-4 p-4 sm:block sm:p-8 xl:p-12")}
          >
            <span className="font-mono text-sm tracking-widest text-accent">0{i + 1}</span>
            <p className="font-display text-lg leading-snug tracking-tight sm:mt-6 sm:text-2xl xl:mt-10 xl:text-3xl">
              {m.title}
            </p>
            <span className="sr-only">
              {m.desc} {m.points.join(". ")}
            </span>
          </DepthItem>
        ))}
      </ul>
      <DepthItem dir={[0, 1]} delay={3}>
        <Button href="mailto:sales@core829.net?subject=Request%20a%20quote" variant="primary">
          {t("cta")}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </DepthItem>
    </DepthSlide>
  );
}

/* ─────────── FAQ ─────────── */

export function FaqSlide({ index }: SlideProps) {
  const t = useTranslations("faq");
  const messages = useMessages();
  const items = (messages.faq as unknown as { items: { q: string; a: string }[] }).items;
  const [open, setOpen] = useState<number | null>(null);

  return (
    <DepthSlide index={index} id="faq" className="lg:flex-row lg:items-center lg:gap-20">
      <DepthItem dir={[-1, 0]} className="lg:w-[34%] lg:shrink-0">
        <SlideHeading kicker={t("kicker")} title={t("title")} leftOnLg />
      </DepthItem>
      <DepthItem dir={[1, 0]} depth={0.8} className="w-full max-w-3xl">
        {items.map((item, i) => (
          <AccordionItem
            key={i}
            index={i}
            question={item.q}
            answer={item.a}
            open={open === i}
            onToggle={() => setOpen(open === i ? null : i)}
          />
        ))}
      </DepthItem>
    </DepthSlide>
  );
}

/* ─────────── Contatto finale ─────────── */

export function CtaSlide({ index }: SlideProps) {
  const t = useTranslations("finalCta");

  return (
    <DepthSlide index={index} id="contatti-cta">
      <SlideHeading
        kicker={t("kicker")}
        title={t("title")}
        titleClassName="text-display-sm lg:text-[clamp(2.25rem,1rem+3vw,4rem)]"
      />
      <DepthItem dir={[0, 1]} depth={0.8}>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <Button href="https://bookings.core829.net/book/intro-call" variant="primary">
            {t("cta")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
          <Link href="/contatti" className={buttonClasses("secondary")}>
            {t("kicker")}
          </Link>
        </div>
      </DepthItem>
      <DepthItem dir={[0, 1]} delay={2}>
        <p className="max-w-md text-center text-sm leading-relaxed text-foreground-muted">
          {t("existingClient")}{" "}
          <a
            href="mailto:projects@core829.net"
            className="font-medium text-foreground underline decoration-accent/50 underline-offset-4 transition-colors hover:text-accent"
          >
            projects@core829.net
          </a>
        </p>
      </DepthItem>
    </DepthSlide>
  );
}
