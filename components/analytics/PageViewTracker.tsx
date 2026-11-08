"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useCookieConsent } from "@/components/cookies/CookieConsentContext";

/**
 * Conta le visite per il backoffice (contatori anonimi), solo con il consenso agli analytics.
 * Una pagina viene contata una volta per scheda; nessun cookie e nessun dato personale.
 */
export default function PageViewTracker() {
  const pathname = usePathname();
  const { consent, status } = useCookieConsent();
  const sent = useRef(new Set<string>());

  useEffect(() => {
    if (status !== "set" || !consent.analytics || !pathname || sent.current.has(pathname)) return;
    sent.current.add(pathname);
    try {
      navigator.sendBeacon("/api/track", new Blob([JSON.stringify({ path: pathname })], { type: "application/json" }));
    } catch {
      /* il conteggio e' facoltativo */
    }
  }, [pathname, consent.analytics, status]);

  return null;
}
