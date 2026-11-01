"use client";

import { useTranslations } from "next-intl";
import DepthStage from "@/components/tunnel/DepthStage";
import IntroSlide from "@/components/tunnel/IntroSlide";
import CasesSlide from "@/components/tunnel/CasesSlide";
import {
  CtaSlide,
  FaqSlide,
  FeaturesSlide,
  MethodSlide,
  PricingSlide,
  ProblemSlide,
  ServicesSlide,
  TrustedSlide,
} from "@/components/tunnel/MidSlides";

/**
 * Home: tutte le sezioni (tranne footer e prenotazione) attraversate come un
 * tunnel in profondità. L'ordine delle slide è anche l'ordine di scroll.
 */
export default function HomeTunnel() {
  const labels = [
    "CORE829",
    useTranslations("trustedBy")("label"),
    useTranslations("problem")("kicker"),
    useTranslations("solution")("kicker"),
    useTranslations("process")("kicker"),
    useTranslations("caseStudies")("kicker"),
    useTranslations("features")("kicker"),
    useTranslations("pricing")("kicker"),
    useTranslations("faq")("kicker"),
    useTranslations("finalCta")("kicker"),
  ];

  return (
    <DepthStage labels={labels}>
      <IntroSlide />
      <TrustedSlide />
      <ProblemSlide />
      <ServicesSlide />
      <MethodSlide />
      <CasesSlide />
      <FeaturesSlide />
      <PricingSlide />
      <FaqSlide />
      <CtaSlide />
    </DepthStage>
  );
}
