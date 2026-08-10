"use client";

import { TrustpilotScript } from "@/components/Trustpilot";
import { useCookieConsent } from "./CookieConsentContext";

/**
 * Il bootstrap Trustpilot imposta cookie di terze parti: va caricato solo
 * dopo che l'utente ha acconsentito alla categoria "marketing".
 */
export default function TrustpilotConsentGate() {
  const { consent } = useCookieConsent();
  if (!consent.marketing) return null;
  return <TrustpilotScript />;
}
