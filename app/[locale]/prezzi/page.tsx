import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/Button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: `${t("pricing")} — CORE829`,
    description: t("description"),
  };
}

export default async function PrezziPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "pricingPage" });

  return (
    <main>
      <section className="container-core829 py-24 lg:py-32">
        <p className="kicker">{t("kicker")}</p>
        <h1 className="mt-4 text-section-title">{t("title")}</h1>
        <p className="mt-6 max-w-2xl text-lg text-foreground-muted">
          {t("subtitle")}
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-8">
            <h3 className="text-lg font-semibold tracking-tight">
              {t("projectTitle")}
            </h3>
            <p className="mt-4 text-foreground-muted">{t("projectDesc")}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-8">
            <h3 className="text-lg font-semibold tracking-tight">
              {t("retainerTitle")}
            </h3>
            <p className="mt-4 text-foreground-muted">{t("retainerDesc")}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-8">
            <h3 className="text-lg font-semibold tracking-tight">
              {t("partnershipTitle")}
            </h3>
            <p className="mt-4 text-foreground-muted">{t("partnershipDesc")}</p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Button href="#contatti" variant="primary">
            {t("cta")}
          </Button>
        </div>
      </section>
    </main>
  );
}