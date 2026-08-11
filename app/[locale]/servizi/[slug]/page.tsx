import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { SERVICES_META, VISIBLE_SERVICES_META } from "@/lib/constants";
import ServerServicePage from "@/components/services/ServerServicePage";
import { buildAlternates } from "@/lib/seo";
import { getServiceKeywords } from "@/lib/seoKeywords";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return VISIBLE_SERVICES_META.map((service) => ({ slug: service.key }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const index = SERVICES_META.findIndex((s) => s.key === slug && !s.hidden);
  const tServices = await getTranslations({ locale, namespace: "solution.services" });

  if (index === -1) {
    return { title: `404 — CORE829`, robots: { index: false, follow: false } };
  }

  const serviceTitle = tServices(`${index}.title`);
  const title = `${serviceTitle} — CORE829`;
  const description = tServices(`${index}.desc`);

  return {
    title,
    description,
    keywords: getServiceKeywords(locale, slug, serviceTitle),
    alternates: buildAlternates(locale, `/servizi/${slug}`),
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const index = SERVICES_META.findIndex((s) => s.key === slug && !s.hidden);

  if (index === -1) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "servicesDetail" });
  const tServices = await getTranslations({ locale, namespace: "solution.services" });
  const Icon = SERVICES_META[index].icon;

  // Precedente/successivo ciclano solo tra i servizi pubblicamente visibili.
  const visiblePos = VISIBLE_SERVICES_META.findIndex((s) => s.key === slug);
  const prev =
    VISIBLE_SERVICES_META[
      (visiblePos - 1 + VISIBLE_SERVICES_META.length) % VISIBLE_SERVICES_META.length
    ];
  const next = VISIBLE_SERVICES_META[(visiblePos + 1) % VISIBLE_SERVICES_META.length];

  if (slug === "server") {
    return (
      <main>
        <ServerServicePage />
        <section className="border-t border-border bg-surface">
          <div className="container-core829 flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={`/servizi/${prev.key}`}
              className="group inline-flex items-center gap-3 text-sm text-foreground-muted transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden />
              <span>
                <span className="block text-xs uppercase tracking-widest text-foreground-muted/70">
                  {t("previous")}
                </span>
                <span className="mt-1 block font-semibold">
                  {tServices(`${prev.index}.title`)}
                </span>
              </span>
            </Link>
            <Link
              href={`/servizi/${next.key}`}
              className="group inline-flex items-center justify-end gap-3 text-right text-sm text-foreground-muted transition-colors hover:text-foreground"
            >
              <span>
                <span className="block text-xs uppercase tracking-widest text-foreground-muted/70">
                  {t("next")}
                </span>
                <span className="mt-1 block font-semibold">
                  {tServices(`${next.index}.title`)}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="container-core829 py-24 lg:py-32">
        <Link
          href="/servizi"
          className="inline-flex items-center gap-2 text-sm text-foreground-muted transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("back")}
        </Link>

        <div className="mt-10 flex items-start gap-6">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center bg-foreground text-white">
            <Icon className="h-7 w-7" aria-hidden />
          </span>
          <span className="font-mono text-sm tracking-widest text-foreground-muted">
            0{visiblePos + 1}
          </span>
        </div>

        <h1 className="mt-8 max-w-3xl text-section-title">
          {tServices(`${index}.title`)}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground-muted">
          {tServices(`${index}.desc`)}
        </p>

        <div className="mt-16 max-w-3xl border-t border-border pt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            {t("whatIncluded")}
          </h2>
          <ul className="mt-6 space-y-4">
            {tServices
              .raw(`${index}.bullets`)
              .map((bullet: string, j: number) => (
                <li
                  key={j}
                  className="flex items-start gap-3 text-foreground-muted"
                >
                  <Check className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden />
                  <span className="leading-relaxed">{bullet}</span>
                </li>
              ))}
          </ul>
        </div>

        <div className="mt-14 flex flex-wrap gap-4">
          <Button href="mailto:hello@core829.net?subject=Request%20a%20consultation" variant="primary">
            {t("cta")}
          </Button>
          <Button href="/servizi" variant="secondary">
            {t("allServices")}
          </Button>
        </div>

        <p className="mt-8 text-sm text-foreground-muted">
          <span className="font-semibold text-foreground">
            {t("existingClient")}
          </span>{" "}
          <a
            href="mailto:projects@core829.net"
            className="font-medium text-foreground underline decoration-accent/50 underline-offset-4 transition-colors hover:text-accent"
          >
            projects@core829.net
          </a>{" "}
          — {t("projectsMail")}
        </p>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="container-core829 flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/servizi/${prev.key}`}
            className="group inline-flex items-center gap-3 text-sm text-foreground-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden />
            <span>
              <span className="block text-xs uppercase tracking-widest text-foreground-muted/70">
                {t("previous")}
              </span>
              <span className="mt-1 block font-semibold">
                {tServices(`${prev.index}.title`)}
              </span>
            </span>
          </Link>
          <Link
            href={`/servizi/${next.key}`}
            className="group inline-flex items-center justify-end gap-3 text-right text-sm text-foreground-muted transition-colors hover:text-foreground"
          >
            <span>
              <span className="block text-xs uppercase tracking-widest text-foreground-muted/70">
                {t("next")}
              </span>
              <span className="mt-1 block font-semibold">
                {tServices(`${next.index}.title`)}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>
      </section>
    </main>
  );
}
