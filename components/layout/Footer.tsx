"use client";

import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { smoothScrollTo } from "@/lib/scrollTo";
import { serviceAnchorIds, clientAnchorIds, COMPANY } from "@/lib/constants";
import { SocialLinks } from "@/components/SocialIcons";
import { TrustpilotWidget } from "@/components/Trustpilot";

const SERVICE_ANCHORS = serviceAnchorIds;
const CLIENT_ANCHORS = clientAnchorIds;

/**
 * Footer multi-colonna: Servizi (ancore alle card), Clienti (ancore ai case study),
 * Azienda, Social. Riga finale con copyright, dati societari placeholder e legali.
 */
export default function Footer() {
  const t = useTranslations("footer");
  const tServices = useTranslations("solution.services");
  const tCaseStudies = useTranslations("caseStudies.projects");
  const year = new Date().getFullYear();

  const goTo = (hash: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    smoothScrollTo(hash);
  };

  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-core829 grid grid-cols-2 gap-12 py-16 md:grid-cols-4 lg:grid-cols-6">
        {/* Brand */}
        <div className="col-span-2">
          <p className="text-lg font-bold tracking-tight">
            <img
              src="/core829-logo/829black%20trsp.png"
              alt="CORE829"
              className="h-8 w-auto"
            />
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-foreground-muted">
            {t("tagline")}
          </p>
          <div className="mt-6 font-mono text-[11px] uppercase tracking-widest text-foreground-muted/70">
            <p>CORE829 SRL — Reg. Com. {COMPANY.regCom}</p>
            <p>CUI / CIF {COMPANY.cui}</p>
            <p>{COMPANY.address}</p>
            <p>
              <a
                href={`tel:${COMPANY.phoneRo.replace(/\s/g, "")}`}
                className="transition-colors hover:text-accent"
              >
                {COMPANY.phoneRo}
              </a>{" "}
              ·{" "}
              <a
                href={`tel:${COMPANY.phoneIt.replace(/\s/g, "")}`}
                className="transition-colors hover:text-accent"
              >
                {COMPANY.phoneIt}
              </a>
            </p>
          </div>
        </div>

        {/* Servizi */}
        <div>
          <p className="tech-label">{t("colServices")}</p>
          <ul className="mt-5 space-y-3">
            {SERVICE_ANCHORS.map((a, i) => (
              <li key={a.id}>
                <a
                  href={`#${a.id}`}
                  onClick={goTo(`#${a.id}`)}
                  className="link-ghost text-sm"
                >
                  {tServices(`${i}.title`)}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/servizi"
                className="link-ghost text-sm"
              >
                {t("colServicesAll")}
              </Link>
            </li>
            <li>
              <Link
                href="/prezzi"
                className="link-ghost text-sm"
              >
                {t("colPricing")}
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="link-ghost text-sm"
              >
                {t("colBlog")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Clienti */}
        <div>
          <p className="tech-label">{t("colClients")}</p>
          <ul className="mt-5 space-y-3">
            {CLIENT_ANCHORS.map((c, i) => (
              <li key={c.id}>
                <a
                  href={`#${c.id}`}
                  onClick={goTo(`#${c.id}`)}
                  className="link-ghost text-sm"
                >
                  {tCaseStudies(`${i}.name`)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Azienda */}
        <div>
          <p className="tech-label">{t("colCompany")}</p>
          <ul className="mt-5 space-y-3">
            <li>
              <a href="#hero" onClick={goTo("#hero")} className="link-ghost text-sm">
                {t("companyAbout")}
              </a>
            </li>
            <li>
              <a href="#metodo" onClick={goTo("#metodo")} className="link-ghost text-sm">
                {t("companyMethod")}
              </a>
            </li>
            <li>
              <a href="#contatti" onClick={goTo("#contatti")} className="link-ghost text-sm">
                {t("companyContact")}
              </a>
            </li>
            <li>
              <Link
                href="/chi-siamo"
                className="link-ghost text-sm"
              >
                {t("companyAboutFull")}
              </Link>
            </li>
            <li>
              <Link
                href="/careers"
                className="link-ghost text-sm"
              >
                {t("colCareers")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <p className="tech-label">Social</p>
          <SocialLinks className="mt-5" />
          <TrustpilotWidget className="mt-6 w-full max-w-[220px]" />
          <a
            href="mailto:hello@core829.net"
            className="mt-6 inline-flex items-center gap-1 text-sm text-foreground-muted transition-colors hover:text-accent"
          >
            hello@core829.net
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-core829 flex flex-col items-start justify-between gap-4 py-6 md:flex-row md:items-center">
          <p className="text-xs text-foreground-muted">
            {t("rights", { year })}
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy-policy"
              className="text-xs text-foreground-muted transition-colors hover:text-accent"
            >
              {t("privacy")}
            </Link>
            <Link
              href="/termini-di-servizio"
              className="text-xs text-foreground-muted transition-colors hover:text-accent"
            >
              {t("terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
