import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import LegalDoc from "@/components/layout/LegalDoc";

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
  };
}

export default async function GdprPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalDoc locale={locale} namespace="gdpr" />;
}