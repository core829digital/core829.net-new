export interface ConsentState {
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
};

export const CONSENT_STORAGE_KEY = "core829-cookie-consent";
/** Bump this if the categories or their meaning change, to force re-consent. */
export const CONSENT_VERSION = 1;

interface StoredConsent {
  version: number;
  consent: ConsentState;
  updatedAt: string;
}

export function readStoredConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed.version !== CONSENT_VERSION || !parsed.consent) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredConsent(consent: ConsentState): void {
  if (typeof window === "undefined") return;
  const payload: StoredConsent = {
    version: CONSENT_VERSION,
    consent,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
}
