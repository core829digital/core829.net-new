import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/sections/Hero";
import TrustedBy from "@/components/sections/TrustedBy";
import Problem from "@/components/sections/Problem";
import Solution from "@/components/sections/Solution";
import HowWeWork from "@/components/sections/HowWeWork";
import CaseStudies from "@/components/sections/CaseStudies";
import Features from "@/components/sections/Features";
import PricingModel from "@/components/sections/PricingModel";
import FAQ from "@/components/sections/FAQ";
import FinalCTA from "@/components/sections/FinalCTA";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <TrustedBy />
      <Problem />
      <Solution />
      <HowWeWork />
      <CaseStudies />
      <Features />
      <PricingModel />
      <FAQ />
      <FinalCTA />
    </>
  );
}
