import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import PinnedSteps from "@/components/animations/PinnedSteps";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = `${t("method")} — CORE829`;
  return {
    title,
    description: t("description"),
    alternates: buildAlternates(locale, "/metodo"),
    openGraph: { title, description: t("description") },
    twitter: { title, description: t("description") },
  };
}

export default async function MetodoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "methodPage" });

  return (
    <main>
      <section className="container-core829 py-24 lg:py-32">
        <p className="kicker">{t("kicker")}</p>
        <h1 className="mt-4 text-section-title">{t("title")}</h1>
        <p className="mt-6 max-w-2xl text-lg text-foreground-muted">
          {t("subtitle")}
        </p>
      </section>

      <PinnedSteps />

      <section className="container-core829 py-24">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight">
            {t("approachTitle")}
          </h2>
          <p className="mt-4 leading-relaxed text-foreground-muted">
            {t("approach")}
          </p>
        </div>
      </section>
    </main>
  );
}