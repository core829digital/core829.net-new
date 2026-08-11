"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

export const TRUSTPILOT_REVIEW_URL = "https://www.trustpilot.com/review/core829.net";

const TRUSTPILOT_TEMPLATE_ID = "56278e9abfbbba0bdcd568bc";
const TRUSTPILOT_BUSINESSUNIT_ID = "69980f039111479251cb48b2";
const TRUSTPILOT_TOKEN = "7b93ff7f-fd0f-400e-8991-9d03f9ae7f5e";

/** Locale supportate da Trustpilot; le altre lingue del sito cadono su "en-US". */
const TRUSTPILOT_LOCALES: Record<string, string> = {
  en: "en-US",
  it: "it-IT",
  ro: "ro-RO",
  fr: "fr-FR",
  de: "de-DE",
  nl: "nl-NL",
  es: "es-ES",
  pt: "pt-PT",
  pl: "pl-PL",
  cs: "cs-CZ",
  sk: "sk-SK",
  hu: "hu-HU",
  ru: "ru-RU",
  sv: "sv-SE",
  da: "da-DK",
  no: "nb-NO",
  fi: "fi-FI",
  ja: "ja-JP",
  ko: "ko-KR",
  zh: "zh-CN",
};

declare global {
  interface Window {
    Trustpilot?: {
      loadFromElement: (element: Element, forceReload?: boolean) => void;
    };
  }
}

/**
 * TrustBox script — caricato dopo l'hydration (afterInteractive) così il
 * bootstrap Trustpilot non modifica il DOM del widget prima che React
 * completi l'hydration (evita l'errore di hydration #418).
 */
export function TrustpilotScript() {
  return (
    <Script
      id="trustpilot-bootstrap"
      src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
      strategy="afterInteractive"
      onLoad={() => {
        // Il consenso cookie può ritardare il caricamento di questo script
        // rispetto al mount dei widget: alla fine del caricamento,
        // inizializza esplicitamente tutti quelli già presenti nel DOM.
        document.querySelectorAll(".trustpilot-widget").forEach((el) => {
          window.Trustpilot?.loadFromElement(el, true);
        });
      }}
    />
  );
}

/**
 * TrustBox widget — Review Collector.
 * Il div .trustpilot-widget viene idratato dal bootstrap script Trustpilot,
 * che lo sostituisce con un iframe la prima volta che lo trova nel DOM.
 *
 * Cambiare lingua rimonta Navbar/Footer/Hero (il segmento [locale] cambia),
 * quindi React ricrea un div .trustpilot-widget "vergine": il bootstrap,
 * già eseguito una volta, non lo vede più e il widget resta grezzo (perde
 * grafica, mostra solo il link di fallback). loadFromElement lo re-inizializza
 * esplicitamente ad ogni mount, incluso dopo un cambio lingua.
 */
export function TrustpilotWidget({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const trustpilotLocale = TRUSTPILOT_LOCALES[locale] ?? "en-US";

  useEffect(() => {
    if (ref.current && window.Trustpilot) {
      window.Trustpilot.loadFromElement(ref.current, true);
    }
  }, [locale]);

  return (
    <div className={cn(className)}>
      <div
        ref={ref}
        className="trustpilot-widget"
        data-locale={trustpilotLocale}
        data-template-id={TRUSTPILOT_TEMPLATE_ID}
        data-businessunit-id={TRUSTPILOT_BUSINESSUNIT_ID}
        data-style-height="52px"
        data-style-width="100%"
        data-token={TRUSTPILOT_TOKEN}
      >
        <a href={TRUSTPILOT_REVIEW_URL} target="_blank" rel="noopener noreferrer">
          Trustpilot
        </a>
      </div>
    </div>
  );
}
