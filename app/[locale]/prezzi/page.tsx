import { Metadata } from "next";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = `${t("pricing")} — CORE829`;
  return {
    title,
    description: t("description"),
    alternates: buildAlternates(locale, "/prezzi"),
    openGraph: { title, description: t("description") },
    twitter: { title, description: t("description") },
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

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col rounded-xl border border-border bg-surface p-8">
            <h3 className="text-lg font-semibold tracking-tight">
              {t("projectTitle")}
            </h3>
            <p className="mt-4 flex-1 text-foreground-muted">{t("projectDesc")}</p>
            <a
              href="https://bookings.core829.net/book/intro-call"
              className={buttonClasses("primary", "mt-6")}
            >
              {t("helloCta")}
            </a>
          </div>
          <div className="flex flex-col rounded-xl border border-border bg-surface p-8">
            <h3 className="text-lg font-semibold tracking-tight">
              {t("retainerTitle")}
            </h3>
            <p className="mt-4 flex-1 text-foreground-muted">{t("retainerDesc")}</p>
            <a
              href="mailto:sales@core829.net?subject=Retainer%20%26%20large%20projects"
              className={buttonClasses("primary", "mt-6")}
            >
              {t("contactSales")}
            </a>
          </div>
          <div className="flex flex-col rounded-xl border border-border bg-surface p-8">
            <h3 className="text-lg font-semibold tracking-tight">
              {t("partnershipTitle")}
            </h3>
            <p className="mt-4 flex-1 text-foreground-muted">{t("partnershipDesc")}</p>
            <a
              href="mailto:partnerships@core829.net?subject=Partnership%20proposal"
              className={buttonClasses("secondary", "mt-6")}
            >
              {t("partnershipCta")}
            </a>
          </div>
        </div>

        <div className="mt-16 max-w-xl">
          <div className="rounded-xl border border-accent bg-surface p-8">
            <h3 className="text-lg font-semibold tracking-tight">
              {t("contactSales")}
            </h3>
            <p className="mt-4 text-foreground-muted">{t("contactSalesHint")}</p>
            <a
              href="mailto:sales@core829.net"
              className={buttonClasses("primary", "mt-6")}
            >
              {t("contactSales")} — sales@core829.net
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}