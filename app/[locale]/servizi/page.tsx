import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import ServiceCard from "@/components/ui/ServiceCard";
import { VISIBLE_SERVICES_META } from "@/lib/constants";
import { buildAlternates } from "@/lib/seo";
import { getSiteKeywords } from "@/lib/seoKeywords";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const tServices = await getTranslations({ locale, namespace: "solution.services" });
  const title = `${t("services")} — CORE829`;
  const serviceTitles = VISIBLE_SERVICES_META.map((s) => ({
    key: s.key,
    title: tServices(`${s.index}.title`),
  }));
  return {
    title,
    description: t("description"),
    keywords: getSiteKeywords(locale, serviceTitles),
    alternates: buildAlternates(locale, "/servizi"),
    openGraph: { title, description: t("description") },
    twitter: { title, description: t("description") },
  };
}

export default async function ServiziPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "servicesPage" });

  return (
    <main>
      <section className="container-core829 py-24 lg:py-32">
        <p className="kicker">{t("kicker")}</p>
        <h1 className="mt-4 text-section-title">{t("title")}</h1>
        <p className="mt-6 max-w-2xl text-lg text-foreground-muted">
          {t("subtitle")}
        </p>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {VISIBLE_SERVICES_META.map((s, visibleIndex) => (
            <ServiceCard key={s.key} index={s.index} displayNumber={visibleIndex + 1} />
          ))}
        </div>
      </section>
    </main>
  );
}