import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = `${t("careers")} — CORE829`;
  return {
    title,
    description: t("description"),
    alternates: buildAlternates(locale, "/careers"),
    openGraph: { title, description: t("description") },
    twitter: { title, description: t("description") },
  };
}

export default async function CareersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "careersPage" });

  return (
    <main>
      <section className="container-core829 py-24 lg:py-32">
        <p className="kicker">{t("kicker")}</p>
        <h1 className="mt-4 text-section-title">{t("title")}</h1>
        <p className="mt-6 max-w-2xl text-lg text-foreground-muted">
          {t("subtitle")}
        </p>

        <div className="mt-16 max-w-2xl border border-border bg-surface p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-foreground-muted">
            {t("comingSoon")}
          </p>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
            {t("applyTitle")}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
            {t("applyDesc")}
          </p>
          <div className="mt-8">
            <Button
              href="mailto:hello@core829.net?subject=Spontaneous%20application"
              variant="primary"
            >
              {t("applyButton")}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}