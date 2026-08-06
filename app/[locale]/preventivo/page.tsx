import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import QuoteForm from "@/components/forms/QuoteForm";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "preventivo" });
  const tMeta = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: `${t("metaTitle")} — CORE829`,
    description: t("metaDescription") ?? tMeta("description"),
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PreventivoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "preventivo" });

  return (
    <main>
      <section className="container-core829 py-24 lg:py-32">
        <p className="kicker">{t("kicker")}</p>
        <h1 className="mt-4 max-w-3xl text-section-title">{t("title")}</h1>
        <p className="mt-6 max-w-2xl text-lg text-foreground-muted">
          {t("subtitle")}
        </p>

        <div className="mt-16 max-w-xl">
          <QuoteForm />
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-sm font-semibold text-foreground">
              {t("existingClient")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
              <Link
                href="/area-clienti"
                className="font-medium text-foreground underline decoration-accent/50 underline-offset-4 transition-colors hover:text-accent"
              >
                {t("clientAreaLink")}
              </Link>{" "}
              — {t("clientAreaHint")}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
