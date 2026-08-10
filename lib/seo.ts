import { routing } from "@/i18n/routing";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://core829.net";

/**
 * Costruisce canonical + hreflang (incluso x-default) per una pagina dato
 * il suo path locale-agnostico (es. "/chi-siamo", "" per la home).
 * Ogni pagina DEVE passare il proprio path: senza, Next.js eredita
 * l'alternates del layout (home), producendo canonical/hreflang errati
 * su tutte le sotto-pagine.
 */
export function buildAlternates(locale: string, path: string = "") {
  const normalizedPath = path === "/" ? "" : path;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
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
