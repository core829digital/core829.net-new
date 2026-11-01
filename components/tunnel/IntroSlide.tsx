"use client";

import Image from "next/image";
import { useMessages, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { DepthItem, DepthSlide } from "@/components/tunnel/DepthStage";
import NeuralNoise from "@/components/ui/neural-noise";
import { Button } from "@/components/ui/Button";

/**
 * Intro: flusso neurale rosso a tutto schermo, loghi CORE829 e CORE829 Servers
 * bianchi al centro, una riga di claim e una sola azione. Il resto del
 * messaggio vive nelle slide successive.
 */
export default function IntroSlide({ index }: { index?: number }) {
  const t = useTranslations("hero");
  const messages = useMessages();
  const headline = (messages.hero as unknown as { headline: string[] }).headline.join(" ");

  return (
    <DepthSlide
      index={index}
      id="hero"
      dark
      flatBackground={
        <>
          <NeuralNoise />
        </>
      }
    >
      <div className="flex w-full flex-col items-center text-center">
        <DepthItem dir={[0, -1]} depth={0.8} delay={1}>
          <p className="mb-6 inline-flex max-w-full items-center gap-2 border border-white/20 bg-white/5 px-4 py-1.5 font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-white/80 backdrop-blur-sm sm:mb-8 sm:text-xs">
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {t("badge")}
          </p>
        </DepthItem>

        <div className="flex items-center justify-center gap-5 sm:gap-10">
          <DepthItem dir={[-1, 0.2]} depth={1.2}>
            <Image
              src="/core829-logo/829white.webp"
              alt="CORE829"
              width={589}
              height={400}
              priority
              className="h-[clamp(4.5rem,15vmin,10rem)] w-auto select-none"
            />
          </DepthItem>
          <span aria-hidden className="h-[clamp(3.5rem,11vmin,7rem)] w-px bg-white/30" />
          <DepthItem dir={[1, 0.2]} depth={1.2}>
            <Image
              src="/server-service/829-servers-white.webp"
              alt="CORE829 Servers"
              width={400}
              height={400}
              priority
              className="h-[clamp(4.5rem,15vmin,10rem)] w-auto select-none"
            />
          </DepthItem>
        </div>

        <DepthItem dir={[0, 1]} depth={0.8} delay={2}>
          <h1 className="mt-7 max-w-[22ch] font-display text-xl font-medium leading-tight tracking-tight text-white sm:mt-10 sm:max-w-3xl sm:text-3xl">
            {headline}
          </h1>
        </DepthItem>

        <DepthItem dir={[0, 1]} depth={0.6} delay={3}>
          <div className="mt-7 sm:mt-9">
            <Button
              href="https://bookings.core829.net/book/intro-call"
              variant="primary"
              tone="dark"
            >
              {t("ctaPrimary")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </DepthItem>
      </div>

      {/* Indicatore di scroll */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/60"
      >
        <span className="relative block h-9 w-[22px] rounded-full border border-white/40">
          <span className="absolute left-1/2 top-2 h-1.5 w-[3px] -translate-x-1/2 animate-bounce rounded-full bg-white" />
        </span>
      </div>
    </DepthSlide>
  );
}
