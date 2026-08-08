import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { COMPANY, EMAILS } from "@/lib/constants";

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
  const tEmails = await getTranslations({ locale, namespace: "contactEmails" });

  return (
    <main>
      <section className="container-core829 py-24 lg:py-32">
        <div className="max-w-xl">
          <p className="kicker">{t("kicker")}</p>
          <h1 className="mt-3 text-section-title">{t("title")}</h1>
          <p className="mt-4 text-foreground-muted">{t("subtitle")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button href="mailto:hello@core829.net?subject=Request%20a%20quote" variant="primary">
              {t("ctaButton")}
            </Button>
            <a
              href={`tel:${COMPANY.phoneIt.replace(/\s/g, "")}`}
              className="link-ghost text-sm"
            >
              {t("companyPhones")}
            </a>
          </div>
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

        <div className="mt-16 border border-border bg-surface p-8 md:max-w-3xl">
          <p className="tech-label">{COMPANY.legalName}</p>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground-muted">
                {t("companyAddress")}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                {COMPANY.address}
              </p>
              <p className="mt-2 text-xs text-foreground-muted">
                Reg. Com. {COMPANY.regCom} · CUI {COMPANY.cui}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-foreground-muted">
                {t("companyPhones")}
              </p>
              <p className="mt-2 space-y-1 text-sm leading-relaxed text-foreground">
                <a
                  href={`tel:${COMPANY.phoneRo.replace(/\s/g, "")}`}
                  className="block transition-colors hover:text-accent"
                >
                  RO {COMPANY.phoneRo}
                </a>
                <a
                  href={`tel:${COMPANY.phoneIt.replace(/\s/g, "")}`}
                  className="block transition-colors hover:text-accent"
                >
                  IT {COMPANY.phoneIt}
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 md:max-w-3xl">
          <p className="tech-label">{tEmails("heading")}</p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-foreground-muted">
            {tEmails("intro")}
          </p>
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {EMAILS.map(({ key, address }) => (
              <li key={key}>
                <a
                  href={`mailto:${address}`}
                  className="group block h-full border border-border bg-surface p-5 transition-colors duration-300 hover:border-accent"
                >
                  <span className="block text-xs font-semibold uppercase tracking-widest text-accent">
                    {tEmails(`${key}.label`)}
                  </span>
                  <span className="mt-2 block break-all text-sm font-medium text-foreground">
                    {address}
                  </span>
                  <span className="mt-2 block text-xs leading-relaxed text-foreground-muted">
                    {tEmails(`${key}.desc`)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}