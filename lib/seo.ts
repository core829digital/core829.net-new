import { routing } from "@/i18n/routing";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://core829.net";

/**
 * Costruisce canonical + hreflang (incluso x-default) per una pagina dato
 * il suo path locale-agnostico (es. "/chi-siamo", "" per la home).
 * Ogni pagina DEVE passare il proprio path: senza, Next.js eredita
 * l'alternates del layout (home), producendo canonical/hreflang errati
 * su tutte le sotto-pagine.
 */
export function buildAlternates(
  locale: string,
  path: string = "",
  onlyLocales?: readonly string[]
) {
  const normalizedPath = path === "/" ? "" : path;
  const languages: Record<string, string> = {};
  for (const l of onlyLocales ?? routing.locales) {
    languages[l] = `${SITE_URL}/${l}${normalizedPath}`;
  }
  languages["x-default"] = `${SITE_URL}/${routing.defaultLocale}${normalizedPath}`;

  return {
    canonical: `${SITE_URL}/${locale}${normalizedPath}`,
    languages,
  };
}

export function buildOpenGraphUrl(locale: string, path: string = "") {
  const normalizedPath = path === "/" ? "" : path;
  return `${SITE_URL}/${locale}${normalizedPath}`;
}

/** Lingue per cui esistono descrizioni dedicate per ogni pagina interna. */
const PAGE_DESC_LOCALES = new Set(["en", "it", "ro", "fr", "de", "es", "nl", "pl"]);

/**
 * Accorcia una meta description a max caratteri sul limite di parola
 * (i motori di ricerca troncano comunque oltre ~160 caratteri).
 */
export function clampDescription(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 60 ? lastSpace : cut.length).replace(/[\s,.;:—-]+$/, "")}…`;
}

/**
 * Meta description di una pagina interna: testo dedicato (metadata.<key>) nelle
 * lingue tradotte, altrimenti la descrizione generale del sito.
 */
export function pageDescription(
  locale: string,
  t: (key: string) => string,
  key: string
): string {
  return clampDescription(PAGE_DESC_LOCALES.has(locale) ? t(key) : t("description"));
}

/** Lingue con testi dedicati per le pagine di destinazione (software su misura, AI). */
export const LANDING_LOCALES: readonly string[] = ["it", "en"];

/**
 * Pubblicazione: se false le pagine di destinazione restano raggiungibili ma
 * noindex e fuori dalla sitemap. Impostare a true dopo la revisione dei testi.
 */
export const LANDING_PUBLISHED = true;
