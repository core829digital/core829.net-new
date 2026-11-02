import { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL, LANDING_LOCALES, LANDING_PUBLISHED } from "@/lib/seo";
import { VISIBLE_SERVICES_META } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;
  const lastModified = new Date();
  const { locales, defaultLocale } = routing;

  const staticPaths = [
    "/",
    "/privacy-policy",
    "/termini-di-servizio",
    "/gdpr",
    "/cookie-policy",
    "/servizi",
    "/contatti",
    "/chi-siamo",
    "/metodo",
    "/careers",
    "/prezzi",
  ];

  const servicePaths = VISIBLE_SERVICES_META.map((s) => `/servizi/${s.key}`);

  const buildUrl = (locale: string, path: string) =>
    `${baseUrl}/${locale}${path === "/" ? "" : path}`;

  const buildEntry = (locale: string, path: string) => {
    const url = buildUrl(locale, path);
    const alternates: Record<string, string> = {};
    for (const l of locales) {
      alternates[l] = buildUrl(l, path);
    }
    alternates["x-default"] = buildUrl(defaultLocale, path);
    return {
      url,
      lastModified,
      changeFrequency: path === "/" ? ("monthly" as const) : ("yearly" as const),
      priority: path === "/" ? 1 : 0.3,
      alternates: { languages: alternates },
    };
  };

  const defaultEntries = staticPaths.map((path) =>
    buildEntry(defaultLocale, path)
  );

  const defaultServiceEntries = servicePaths.map((path) =>
    buildEntry(defaultLocale, path)
  );

  const localizedEntries = staticPaths.flatMap((path) =>
    locales
      .filter((locale) => locale !== defaultLocale)
      .map((locale) => buildEntry(locale, path))
  );

  const localizedServiceEntries = servicePaths.flatMap((path) =>
    locales
      .filter((locale) => locale !== defaultLocale)
      .map((locale) => buildEntry(locale, path))
  );

  // Pagine di destinazione: solo nelle lingue per cui esistono testi dedicati.
  const landingPaths = ["/software-su-misura", "/ai-per-aziende"];
  const landingEntries = (LANDING_PUBLISHED ? landingPaths : []).flatMap((path) =>
    LANDING_LOCALES.map((locale) => {
      const url = buildUrl(locale, path);
      const languages: Record<string, string> = {};
      for (const l of LANDING_LOCALES) languages[l] = buildUrl(l, path);
      languages["x-default"] = buildUrl(defaultLocale, path);
      return {
        url,
        lastModified,
        changeFrequency: "monthly" as const,
        priority: 0.7,
        alternates: { languages },
      };
    })
  );

  return [
    ...landingEntries,
    ...defaultEntries,
    ...defaultServiceEntries,
    ...localizedEntries,
    ...localizedServiceEntries,
  ];
}
