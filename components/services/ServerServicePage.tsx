"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import RevealOnScroll from "@/components/animations/RevealOnScroll";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const SERVER_IMAGES = [
  { src: "/server-service/2.webp", alt: "CORE829 custom server build" },
  { src: "/server-service/3.webp", alt: "CORE829 custom server build" },
  { src: "/server-service/4.webp", alt: "CORE829 custom server build" },
  { src: "/server-service/5.webp", alt: "CORE829 custom server build" },
  { src: "/server-service/6.webp", alt: "CORE829 custom server build" },
];

const INTEL_LOGO = "/server-service/intel_PNG1.webp";
const NVIDIA_LOGO = "/server-service/Nvidia-Logo-PNG-Picture.webp";

const SERVICE_IMG_SIZES = "(max-width: 1024px) 90vw, 48vw";

const MotionImage = motion.create(Image);

/**
 * Pagina dedicata al servizio Server Personalizzati.
 * Racconta perché lavoriamo con Intel e NVIDIA, chiarisce che non produciamo
 * ma gestiamo l'intero processo (richiesta → build → consegna), e dichiara
 * l'unico limite: spedizione solo in Europa e America.
 */
export default function ServerServicePage() {
  const t = useTranslations("serverPage");
  const tDetail = useTranslations("servicesDetail");
  const [index, setIndex] = useState(0);

  const next = useCallback(
    () => setIndex((i) => (i + 1) % SERVER_IMAGES.length),
    []
  );
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + SERVER_IMAGES.length) % SERVER_IMAGES.length),
    []
  );

  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next]);

  const steps = [
    { title: t("step1Title"), desc: t("step1Desc") },
    { title: t("step2Title"), desc: t("step2Desc") },
    { title: t("step3Title"), desc: t("step3Desc") },
    { title: t("step4Title"), desc: t("step4Desc") },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-24 h-96 w-96 rounded-full border border-border/60"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-40 h-48 w-48 rounded-full border border-accent/20"
        />

        <div className="container-core829 grid items-center gap-16 py-20 lg:grid-cols-2">
          <div>
            <RevealOnScroll>
              <p className="kicker">
                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                {t("kicker")}
              </p>
              <h1 className="mt-8 text-display font-semibold text-foreground">
                {t("title")}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-foreground-muted">
                {t("subtitle")}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button href="#contatti" variant="primary">
                  {t("ctaButton")}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
                <Button href="/servizi" variant="secondary">
                  {tDetail("allServices")}
                </Button>
              </div>
            </RevealOnScroll>
          </div>

          {/* Carousel */}
          <RevealOnScroll>
            <div className="relative">
              <div
                aria-hidden
                className="absolute -left-6 -top-6 z-20 h-3 w-3 bg-accent"
              />
              <div className="relative aspect-square overflow-hidden border border-border bg-surface">
                <AnimatePresence initial={false}>
                  <MotionImage
                    key={index}
                    src={SERVER_IMAGES[index].src}
                    alt={SERVER_IMAGES[index].alt}
                    fill
                    sizes={SERVICE_IMG_SIZES}
                    priority={index === 0}
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </AnimatePresence>

                {/* Controls */}
                <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-border bg-background/70 p-3 backdrop-blur-md">
                  <div className="flex items-center gap-1">
                    {SERVER_IMAGES.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Mostra immagine ${i + 1}`}
                        onClick={() => setIndex(i)}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300",
                          i === index
                            ? "w-6 bg-accent"
                            : "w-3 bg-foreground/20 hover:bg-foreground/40"
                        )}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={prev}
                      aria-label="Immagine precedente"
                      className="flex h-9 w-9 items-center justify-center border border-border bg-background text-foreground transition-colors hover:border-accent hover:text-accent"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={next}
                      aria-label="Immagine successiva"
                      className="flex h-9 w-9 items-center justify-center border border-border bg-background text-foreground transition-colors hover:border-accent hover:text-accent"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* COME FUNZIONA — gestiamo noi, non produciamo */}
      <section id="processo" className="border-t border-border bg-surface">
        <div className="container-core829 py-24 lg:py-32">
          <RevealOnScroll>
            <div className="max-w-2xl">
              <p className="kicker">{t("manageKicker")}</p>
              <h2 className="mt-4 text-section-title">{t("manageTitle")}</h2>
              <p className="mt-6 text-lg text-foreground-muted">{t("manageIntro")}</p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll
            stagger={0.1}
            className="mt-16 grid gap-6 md:grid-cols-2"
          >
            {steps.map((step, i) => (
              <div
                key={i}
                className="border border-border bg-background p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center bg-foreground text-white">
                    <span className="font-mono text-sm">{0}{i + 1}</span>
                  </span>
                  <span className="font-mono text-sm tracking-widest text-foreground-muted">
                    0{i + 1} / 04
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                  {step.desc}
                </p>
              </div>
            ))}
          </RevealOnScroll>
        </div>
      </section>

      {/* PERCHÉ INTEL E NVIDIA */}
      <section id="partner" className="container-core829 py-24 lg:py-32">
        <RevealOnScroll>
          <div className="max-w-3xl">
            <p className="kicker">{t("partnersTitle")}</p>
            <h2 className="mt-4 text-section-title">{t("partnersTitle")}</h2>
            <p className="mt-6 text-lg leading-relaxed text-foreground-muted">
              {t("partnersIntro")}
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll stagger={0.1} className="mt-16 grid gap-6 lg:grid-cols-2">
          {/* Intel */}
          <div className="group flex flex-col border border-border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-xl sm:p-8 md:p-10">
            <div className="flex h-16 w-16 items-center justify-center border border-border p-2">
              <Image
                src={INTEL_LOGO}
                alt="Intel"
                width={80}
                height={80}
                loading="lazy"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <h3 className="mt-8 text-xl font-semibold tracking-tight">{t("intelTitle")}</h3>
            <p className="mt-4 text-base leading-relaxed text-foreground-muted">
              {t("intelDesc")}
            </p>
          </div>

          {/* NVIDIA */}
          <div className="group flex flex-col border border-border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-xl sm:p-8 md:p-10">
            <div className="flex h-16 w-16 items-center justify-center border border-border p-2">
              <Image
                src={NVIDIA_LOGO}
                alt="NVIDIA"
                width={80}
                height={80}
                loading="lazy"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <h3 className="mt-8 text-xl font-semibold tracking-tight">{t("nvidiaTitle")}</h3>
            <p className="mt-4 text-base leading-relaxed text-foreground-muted">
              {t("nvidiaDesc")}
            </p>
          </div>
        </RevealOnScroll>

        {/* Ecosistema a 360° */}
        <RevealOnScroll className="mt-16 border border-border bg-surface p-6 sm:p-8 md:p-10">
          <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
            <span className="flex h-14 w-14 items-center justify-center bg-foreground text-white">
              <span className="font-mono text-sm">360°</span>
            </span>
            <div>
              <h3 className="text-xl font-semibold tracking-tight">{t("partner360Title")}</h3>
              <p className="mt-3 text-base leading-relaxed text-foreground-muted">
                {t("partner360Desc")}
              </p>
            </div>
          </div>
        </RevealOnScroll>

        {/* Limite di spedizione */}
        <RevealOnScroll className="mt-6 border border-border p-6 sm:p-8 md:p-10">
          <div className="grid items-start gap-6 md:grid-cols-[auto_1fr]">
            <span className="flex h-10 items-center rounded-full border border-accent px-4">
              <span className="font-mono text-sm uppercase tracking-widest text-accent">
                {t("scopeTitle")}
              </span>
            </span>
            <p className="text-base leading-relaxed text-foreground-muted">
              {t("scopeDesc")}
            </p>
          </div>
        </RevealOnScroll>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-foreground text-white">
        <div className="container-core829 py-24 lg:py-32">
          <RevealOnScroll>
            <div className="max-w-3xl">
              <p className="kicker text-white/70">{t("carouselTitle")}</p>
              <h2 className="mt-4 text-section-title">{t("ctaTitle")}</h2>
              <p className="mt-6 text-lg leading-relaxed text-white/70">
                {t("ctaDesc")}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button href="#contatti" variant="primary">
                  {t("ctaButton")}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
                <Button href="#partner" variant="secondary" className="border-white/40 text-white hover:bg-white hover:text-foreground">
                  {t("partnersTitle")}
                </Button>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* nota cliente attivo */}
      <div className="container-core829 py-10 text-center">
        <p className="text-sm text-foreground-muted">
          <span className="font-semibold text-foreground">{tDetail("existingClient")}</span>{" "}
          <a
            href="mailto:projects@core829.net"
            className="font-medium text-foreground underline decoration-accent/50 underline-offset-4 transition-colors hover:text-accent"
          >
            projects@core829.net
          </a>
          {" "}— {tDetail("projectsMail")}
        </p>
      </div>
    </>
  );
}