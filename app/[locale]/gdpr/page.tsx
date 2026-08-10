import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import LegalDoc from "@/components/layout/LegalDoc";
import { buildAlternates } from "@/lib/seo";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gdpr" });
  return {
    title: `${t("title")} — CORE829`,
    description: t("intro"),
    alternates: buildAlternates(locale, "/gdpr"),
  };
}

export default async function GdprPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalDoc locale={locale} namespace="gdpr" />;
}