import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: `${t("about")} — CORE829`,
    description: t("description"),
  };
}

export default async function ChiSiamoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "aboutPage" });

  return (
    <main>
      <section className="container-core829 py-24 lg:py-32">
        <p className="kicker">{t("kicker")}</p>
        <h1 className="mt-4 text-section-title">{t("title")}</h1>
        <p className="mt-6 max-w-2xl text-lg text-foreground-muted">
          {t("subtitle")}
        </p>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {t("missionTitle")}
            </h2>
            <p className="mt-4 leading-relaxed text-foreground-muted">
              {t("mission")}
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {t("valuesTitle")}
            </h2>
            <ul className="mt-4 space-y-3 text-foreground-muted">
              {t.raw("values").map((v: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                  {v}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}