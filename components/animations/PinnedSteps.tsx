"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import RevealOnScroll from "./RevealOnScroll";

gsap.registerPlugin(ScrollTrigger);

const STEP_COUNT = 4;

/**
 * Sezione "Come lavoriamo":
 * - Desktop (≥1024px): sticky + scrub, gli step avanzano con lo scroll (pin replicato).
 * - Mobile: reveal sequenziale verticale semplice (niente pin).
 * - Rispetta prefers-reduced-motion (fallback a lista statica).
 */
export default function PinnedSteps() {
  const t = useTranslations("process");
  const wrapRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  const steps = Array.from({ length: STEP_COUNT }, (_, i) => ({
    title: t(`steps.${i}.title`),
    desc: t(`steps.${i}.desc`),
  }));

  useGSAP(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 1023px)").matches;
    if (reduced || mobile) return;

    const stepEls = stepsRef.current.filter(Boolean) as HTMLDivElement[];
    gsap.set(stepEls, { opacity: 0, y: 24 });

    const st = ScrollTrigger.create({
      trigger: wrap,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const idx = Math.min(
          STEP_COUNT - 1,
          Math.floor(self.progress * STEP_COUNT)
        );
        stepEls.forEach((el, i) => {
          gsap.set(el, {
            opacity: i === idx ? 1 : 0,
            y: i === idx ? 0 : 24,
          });
        });
        const bars = wrap.querySelectorAll<HTMLElement>("[data-step-bar]");
        bars.forEach((bar, i) => {
          bar.style.opacity = i <= idx ? "1" : "0.25";
        });
      },
    });

    return () => st.kill();
  }, []);

  return (
    <>
      {/* Desktop — sticky/scrub */}
      <div ref={wrapRef} className="relative hidden lg:block" style={{ height: "400vh" }}>
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div className="container-core829 grid w-full grid-cols-2 items-center gap-20">
            <div>
              <p className="kicker">{t("kicker")}</p>
              <h2 className="mt-4 text-section-title">{t("title")}</h2>
              <p className="mt-6 max-w-md text-lg text-foreground-muted">
                {t("subtitle")}
              </p>
              <div className="mt-12 space-y-3">
                {steps.map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span
                      data-step-bar
                      className="font-mono text-sm tracking-widest transition-opacity duration-300"
                      style={{ opacity: i === 0 ? 1 : 0.25 }}
                    >
                      0{i + 1}
                    </span>
                    <span
                      className="h-px w-16 bg-accent transition-opacity duration-300"
                      style={{ opacity: i === 0 ? 1 : 0.25 }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="min-h-[320px]">
                {steps.map((step, i) => (
                  <div
                    key={i}
                    ref={(el) => {
                      stepsRef.current[i] = el;
                    }}
                    className="absolute inset-0 will-change-transform"
                    style={{ opacity: 0, y: 24 }}
                  >
                    <p className="font-mono text-sm uppercase tracking-[0.25em] text-accent">
                      0{i + 1} / 0{STEP_COUNT}
                    </p>
                    <h3 className="mt-6 text-3xl font-semibold tracking-tight">
                      {step.title}
                    </h3>
                    <p className="mt-5 max-w-md text-lg leading-relaxed text-foreground-muted">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile — lista verticale */}
      <div className="lg:hidden">
        <div className="container-core829 py-24">
          <RevealOnScroll className="space-y-14">
            <div>
              <p className="kicker">{t("kicker")}</p>
              <h2 className="mt-4 text-section-title">{t("title")}</h2>
              <p className="mt-5 text-lg text-foreground-muted">{t("subtitle")}</p>
            </div>
            {steps.map((step, i) => (
              <div key={i}>
                <p className="font-mono text-sm uppercase tracking-[0.25em] text-accent">
                  0{i + 1} / 0{STEP_COUNT}
                </p>
                <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-foreground-muted">
                  {step.desc}
                </p>
              </div>
            ))}
          </RevealOnScroll>
        </div>
      </div>
    </>
  );
}
