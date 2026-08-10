"use client";

import { ArrowUpRight, Building2, Phone, Mail, MapPin, Clock, UserRound, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCookieConsent } from "@/components/cookies/CookieConsentContext";
import { useGoToSection } from "@/lib/useGoToSection";
import { SERVICES_META, clientAnchorIds, COMPANY, EMAILS, FOUNDERS } from "@/lib/constants";
import { SocialLinks } from "@/components/SocialIcons";
import { TrustpilotWidget } from "@/components/Trustpilot";

const CLIENT_ANCHORS = clientAnchorIds;

/**
 * Footer multi-colonna: Servizi (link alle pagine dedicate), Clienti (ancore ai case study),
 * Azienda, Social. Riga finale con copyright, dati societari placeholder e legali.
 */
export default function Footer() {
  const t = useTranslations("footer");
  const tFounders = useTranslations("founders");
  const tServices = useTranslations("solution.services");
  const tCaseStudies = useTranslations("caseStudies.projects");
  const tCookies = useTranslations("cookieConsent");
  const { openPreferences } = useCookieConsent();
  const year = new Date().getFullYear();
  const goToSection = useGoToSection();

  const goTo = (hash: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    goToSection(hash);
  };

  const telHref = (phone: string) => `tel:${phone.replace(/\s/g, "")}`;
  const waHref = (phone: string) =>
    `https://wa.me/${phone.replace(/[^\d]/g, "")}`;

  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-core829 grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-6">
        {/* Brand */}
        <div className="sm:col-span-2">
          <div className="flex flex-wrap items-center gap-4">
            <Image
              src="/core829-logo/829black%20trsp.webp"
              alt="CORE829"
              width={160}
              height={42}
              className="h-16 w-auto"
            />
            <span className="h-10 w-px bg-border" aria-hidden />
            <Image
              src="/server-service/829%20logo%20servers%20department%20trsp.png"
              alt="CORE829 Servers"
              width={160}
              height={42}
              className="h-16 w-auto"
            />
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-foreground-muted">
            {t("tagline")}
          </p>
          <div className="mt-6 space-y-2 font-mono text-[11px] uppercase leading-relaxed tracking-widest text-foreground-muted/70">
            <p className="flex items-start gap-2">
              <Building2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
              <span>
                CORE829 SRL — Reg. Com. {COMPANY.regCom}
                <br />
                CUI / CIF {COMPANY.cui}
              </span>
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
              <span>{COMPANY.address}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
              <span className="flex flex-wrap items-center gap-x-1.5">
                <a href={telHref(COMPANY.phoneRo)} className="transition-colors hover:text-accent">
                  {COMPANY.phoneRo}
                </a>
                <span aria-hidden>·</span>
                <a href={telHref(COMPANY.phoneIt)} className="transition-colors hover:text-accent">
                  {COMPANY.phoneIt}
                </a>
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
              <a
                href={`mailto:${COMPANY.email}`}
                className="break-all lowercase transition-colors hover:text-accent"
              >
                {COMPANY.email}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
              <span>{COMPANY.hours}</span>
            </p>
          </div>

          {/* Founder / Co-founder */}
          <div className="mt-6 border-t border-border pt-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-foreground">
              {t("foundersTitle")}
            </p>
            <ul className="mt-4 space-y-5">
              {FOUNDERS.map((person) => (
                <li key={person.key}>
                  <p className="flex items-center gap-2">
                    <UserRound className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                    <span className="font-mono text-[11px] uppercase tracking-widest text-foreground">
                      {tFounders(person.key)}
                    </span>
                  </p>
                  <p className="mt-1 text-sm font-medium normal-case text-foreground">
                    {person.name}
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {person.phones.map((phone) => (
                      <li key={phone}>
                        <a
                          href={telHref(phone)}
                          className="inline-flex items-center gap-2 text-sm text-foreground-muted transition-colors hover:text-accent"
                        >
                          <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          {phone}
                        </a>
                      </li>
                    ))}
                    {person.whatsapp && (
                      <li>
                        <a
                          href={waHref(person.whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-foreground-muted transition-colors hover:text-accent"
                        >
                          <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                          WhatsApp: {person.whatsapp}
                        </a>
                      </li>
                    )}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Servizi */}
        <div>
          <p className="tech-label">{t("colServices")}</p>
          <ul className="mt-5 space-y-3">
            {SERVICES_META.map((s, i) => (
              <li key={s.key}>
                <Link
                  href={`/servizi/${s.key}`}
                  className="link-ghost text-sm"
                >
                  {tServices(`${i}.title`)}
                </Link>
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
              <Link
                href="/contatti"
                className="link-ghost text-sm"
              >
                {t("companyContact")}
              </Link>
            </li>
            <li>
              <Link
                href="/chi-siamo"
                className="link-ghost text-sm"
              >
                {t("companyAboutFull")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <p className="tech-label">Social</p>
          <SocialLinks className="mt-5" />
          <TrustpilotWidget className="mt-6 w-full max-w-[220px]" />
          <ul className="mt-6 space-y-2">
            {EMAILS.map(({ key, address }) => (
              <li key={key}>
                <a
                  href={`mailto:${address}`}
                  className="group inline-flex items-center gap-1 text-sm text-foreground-muted transition-colors hover:text-accent"
                >
                  {address}
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-core829 flex flex-col items-start justify-between gap-4 py-6 md:flex-row md:items-center">
          <p className="text-xs text-foreground-muted">
            {t("rights", { year })}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
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
            <Link
              href="/gdpr"
              className="text-xs text-foreground-muted transition-colors hover:text-accent"
            >
              {t("gdpr")}
            </Link>
            <Link
              href="/cookie-policy"
              className="text-xs text-foreground-muted transition-colors hover:text-accent"
            >
              {t("cookiePolicy")}
            </Link>
            <button
              type="button"
              onClick={openPreferences}
              className="text-xs text-foreground-muted transition-colors hover:text-accent"
            >
              {tCookies("footerManage")}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
