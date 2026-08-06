import Script from "next/script";
import { cn } from "@/lib/utils";

export const TRUSTPILOT_REVIEW_URL = "https://www.trustpilot.com/review/core829.net";

const TRUSTPILOT_WIDGET_PROPS = {
  "data-locale": "en-US",
  "data-template-id": "56278e9abfbbba0bdcd568bc",
  "data-businessunit-id": "69980f039111479251cb48b2",
  "data-style-height": "52px",
  "data-style-width": "100%",
  "data-token": "7b93ff7f-fd0f-400e-8991-9d03f9ae7f5e",
};

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
    />
  );
}

/**
 * TrustBox widget — Review Collector.
 * Il div .trustpilot-widget viene idratato dal bootstrap script.
 * ClassName per controllare larghezza/contenitore.
 */
export function TrustpilotWidget({ className }: { className?: string }) {
  return (
    <div className={cn(className)}>
      <div className="trustpilot-widget" {...TRUSTPILOT_WIDGET_PROPS}>
        <a href={TRUSTPILOT_REVIEW_URL} target="_blank" rel="noopener noreferrer">
          Trustpilot
        </a>
      </div>
    </div>
  );
}