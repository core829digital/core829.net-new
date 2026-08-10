"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ConsentState,
  DEFAULT_CONSENT,
  readStoredConsent,
  writeStoredConsent,
} from "@/lib/cookieConsent";

type ConsentStatus = "pending" | "unset" | "set";

interface CookieConsentContextValue {
  consent: ConsentState;
  /** "pending" until localStorage has been read client-side (avoids a flash of the banner). */
  status: ConsentStatus;
  isPreferencesOpen: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (partial: Omit<ConsentState, "necessary">) => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT);
  const [status, setStatus] = useState<ConsentStatus>("pending");
  const [isPreferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    const stored = readStoredConsent();
    if (stored) {
      setConsent(stored.consent);
      setStatus("set");
    } else {
      setStatus("unset");
    }
  }, []);

  const persist = useCallback((next: ConsentState) => {
    setConsent(next);
    setStatus("set");
    writeStoredConsent(next);
    setPreferencesOpen(false);
  }, []);

  const acceptAll = useCallback(() => {
    persist({ necessary: true, preferences: true, analytics: true, marketing: true });
  }, [persist]);

  const rejectAll = useCallback(() => {
    persist({ necessary: true, preferences: false, analytics: false, marketing: false });
  }, [persist]);

  const savePreferences = useCallback(
    (partial: Omit<ConsentState, "necessary">) => {
      persist({ necessary: true, ...partial });
    },
    [persist]
  );

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      status,
      isPreferencesOpen,
      openPreferences: () => setPreferencesOpen(true),
      closePreferences: () => setPreferencesOpen(false),
      acceptAll,
      rejectAll,
      savePreferences,
    }),
    [consent, status, isPreferencesOpen, acceptAll, rejectAll, savePreferences]
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }
  return ctx;
}
