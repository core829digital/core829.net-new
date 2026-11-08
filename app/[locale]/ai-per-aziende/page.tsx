import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import LandingPage from "@/components/landing/LandingPage";
import { withSeoOverride } from "@/lib/seoOverride";
import { buildAlternates, LANDING_LOCALES, LANDING_PUBLISHED } from "@/lib/seo";

const PATH = "/ai-per-aziende";

async function baseMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landingAi" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  const indexable = LANDING_PUBLISHED && LANDING_LOCALES.includes(locale);
  return {
    title: { absolute: title },
    description,
    alternates: buildAlternates(locale, PATH, LANDING_LOCALES),
    openGraph: { title, description },
    twitter: { title, description },
    // Bozza (LANDING_PUBLISHED) e lingue senza testi dedicati: non indicizzare.
    robots: indexable ? undefined : { index: false, follow: true },
  };
}

export async function generateMetadata(props: Parameters<typeof baseMetadata>[0]): Promise<Metadata> {
  const { locale } = await props.params;
  return withSeoOverride(await baseMetadata(props), locale, "ai-per-aziende");
}

export default async function AiPerAziendePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LandingPage locale={locale} namespace="landingAi" secondaryHref="/servizi/server" />;
}
