"use client";

import { useTranslations } from "next-intl";
import RevealOnScroll from "@/components/animations/RevealOnScroll";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

/**
 * "Parliamone" — CTA finale che indirizza a scriverci via email
 * o alla pagina contatti.
 */
export default function FinalCTA() {
  const t = useTranslations("finalCta");

  return (
    <section className="bg-background">
      <div className="container-core829 py-24 lg:py-32">
        <RevealOnScroll>
          <div className="max-w-2xl">
            <p className="kicker">{t("kicker")}</p>
            <h2 className="mt-4 text-section-title">{t("title")}</h2>
            <p className="mt-6 text-lg text-foreground-muted">{t("subtitle")}</p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll className="mt-14 max-w-2xl">
          <div className="flex flex-wrap items-center gap-4">
            <Button href="mailto:hello@core829.net" variant="primary">
              {t("cta")}
            </Button>
            <Link href="/contatti" className="link-ghost text-sm">
              {t("kicker")}
            </Link>
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
        </RevealOnScroll>
      </div>
    </section>
  );
}
