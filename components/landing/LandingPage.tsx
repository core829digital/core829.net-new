import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/components/ui/buttonStyles";

type Namespace = "landingSoftware" | "landingAi";

interface Item {
  t: string;
  d: string;
}
interface Faq {
  q: string;
  a: string;
}

const BOOKING_URL = "https://bookings.core829.net/book/intro-call";

/**
 * Pagina di destinazione SEO (server component, nessun JS client):
 * hero → quando ha senso → cosa realizziamo → come lavoriamo → prove → FAQ → CTA.
 * I testi vivono in messages/<locale>.json sotto il namespace indicato.
 */
export default async function LandingPage({
  locale,
  namespace,
  secondaryHref,
}: {
  locale: string;
  namespace: Namespace;
  /** Link del pulsante secondario: "#id" interno alla pagina oppure percorso del sito. */
  secondaryHref: string;
}) {
  const t = await getTranslations({ locale, namespace });
  const when = t.raw("when") as string[];
  const build = t.raw("build") as Item[];
  const how = t.raw("how") as Item[];
  const proof = t.raw("proof") as Item[];
  const faq = t.raw("faq") as Faq[];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const secondaryClass = buttonClasses("secondary");

  return (
    <div>
      <section className="container-core829 py-24 lg:py-32">
        <p className="kicker">{t("kicker")}</p>
        <h1 className="mt-4 max-w-4xl text-section-title">{t("title")}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground-muted">
          {t("intro")}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("primary")}
          >
            {t("cta")}
          </a>
          {secondaryHref.startsWith("#") ? (
            <a href={secondaryHref} className={secondaryClass}>
              {t("ctaSecondary")}
            </a>
          ) : (
            <Link href={secondaryHref} className={secondaryClass}>
              {t("ctaSecondary")}
            </Link>
          )}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="container-core829 py-20">
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight">
            {t("whenTitle")}
          </h2>
          <ul className="mt-10 grid grid-cols-1 gap-x-12 gap-y-5 md:grid-cols-2">
            {when.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-foreground-muted">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="container-core829 py-20">
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight">
            {t("buildTitle")}
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {build.map((item, i) => (
              <article key={i} className="card-lift border border-border bg-background p-8">
                <h3 className="text-xl font-semibold tracking-tight">{item.t}</h3>
                <p className="mt-3 leading-relaxed text-foreground-muted">{item.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="container-core829 py-20">
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight">
            {t("howTitle")}
          </h2>
          <ol className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {how.map((item, i) => (
              <li key={i}>
                <span className="font-mono text-xs uppercase tracking-widest text-accent">
                  0{i + 1}
                </span>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">{item.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{item.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="progetti">
        <div className="container-core829 py-20">
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight">
            {t("proofTitle")}
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {proof.map((item, i) => (
              <article key={i} className="card-lift border border-border bg-background p-8">
                <h3 className="text-lg font-semibold tracking-tight">{item.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground-muted">{item.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="container-core829 py-20">
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight">
            {t("faqTitle")}
          </h2>
          <div className="mt-10 max-w-3xl divide-y divide-border border-y border-border">
            {faq.map((f, i) => (
              <details key={i} className="group py-1">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-6 py-4 text-lg font-medium tracking-tight [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    aria-hidden
                    className="text-2xl leading-none text-accent transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="pb-5 leading-relaxed text-foreground-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container-core829 py-24 text-center">
          <h2 className="mx-auto max-w-3xl text-section-title">{t("ctaTitle")}</h2>
          <p className="mx-auto mt-4 max-w-xl text-foreground-muted">{t("ctaDesc")}</p>
          <div className="mt-8 flex justify-center">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("primary")}
            >
              {t("cta")}
            </a>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </div>
  );
}
