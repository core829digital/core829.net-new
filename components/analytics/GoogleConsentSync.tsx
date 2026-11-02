"use client";

import { useEffect } from "react";
import { useCookieConsent } from "@/components/cookies/CookieConsentContext";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/** Inoltra a Google Consent Mode le scelte fatte dall'utente nel banner cookie. */
export default function GoogleConsentSync() {
  const { consent, status } = useCookieConsent();

  useEffect(() => {
    if (status !== "set") return;
    window.dataLayer = window.dataLayer || [];
    // gtag() accoda l'oggetto `arguments`, non un array: va replicato così.
    const gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    } as (...args: unknown[]) => void;
    gtag("consent", "update", {
      analytics_storage: consent.analytics ? "granted" : "denied",
      ad_storage: consent.marketing ? "granted" : "denied",
      ad_user_data: consent.marketing ? "granted" : "denied",
      ad_personalization: consent.marketing ? "granted" : "denied",
      functionality_storage: consent.preferences ? "granted" : "denied",
      personalization_storage: consent.preferences ? "granted" : "denied",
    });
  }, [consent, status]);

  return null;
}
