import { getMessages, getTranslations } from "next-intl/server";

interface LegalNamespace {
  title: string;
  updated: string;
  intro: string;
  sections: { title: string; body: string }[];
}

/**
 * Pagina legale condivisa (Privacy Policy / Termini di Servizio).
 * Contenuto letto da messages/{locale}.json con fallback automatico.
 */
export default async function LegalDoc({
  locale,
  namespace,
}: {
  locale: string;
  namespace: "privacy" | "terms" | "gdpr" | "cookiePolicy";
}) {
  const t = await getTranslations({ locale, namespace });
  const messages = await getMessages({ locale });
  const ns = messages[namespace] as unknown as LegalNamespace;

  const updated = t("updated", {
    date: new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date()),
  });

  return (
    <main>
      <div className="container-core829 py-24 lg:py-32">
        <div className="max-w-3xl">
          <p className="kicker">CORE829</p>
          <h1 className="mt-4 text-section-title">{t("title")}</h1>
          <p className="mt-4 text-sm text-foreground-muted">{updated}</p>
          <p className="mt-8 text-lg leading-relaxed text-foreground-muted">
            {t("intro")}
          </p>
        </div>

        <div className="mt-16 max-w-3xl space-y-12 border-t border-border pt-12">
          {ns.sections.map((section, i) => (
            <section key={i}>
              <h2 className="text-xl font-semibold tracking-tight">
                {section.title}
              </h2>
              {section.body.split("\n").map((paragraph, j) => (
                <p
                  key={j}
                  className="mt-4 leading-relaxed text-foreground-muted"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
