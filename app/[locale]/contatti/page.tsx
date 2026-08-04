import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import ContactForm from "@/components/sections/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return {
    title: `${t("contact")} — CORE829`,
    description: t("description"),
  };
}

export default async function ContattiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contactPage" });

  return (
    <main>
      <section className="container-core829 py-24 lg:py-32">
        <p className="kicker">{t("kicker")}</p>
        <h1 className="mt-4 text-section-title">{t("title")}</h1>
        <p className="mt-6 max-w-2xl text-lg text-foreground-muted">
          {t("subtitle")}
        </p>

        <div className="mt-16 max-w-xl">
          <ContactForm />
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-sm font-semibold text-foreground">
              {t("existingClient")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
              <a
                href="mailto:projects@core829.net"
                className="font-medium text-foreground underline decoration-accent/50 underline-offset-4 transition-colors hover:text-accent"
              >
                projects@core829.net
              </a>{" "}
              — {t("projectsMail")}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}