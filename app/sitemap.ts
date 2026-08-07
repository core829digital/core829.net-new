import { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://core829.net";
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

  const serviceSlugs = [
    "server",
    "automations",
    "webdesign",
    "webapp",
    "desktop",
    "seo",
    "marketing",
  ];

  const servicePaths = serviceSlugs.map((slug) => `/servizi/${slug}`);

  const buildUrl = (locale: string, path: string) =>
    `${baseUrl}/${locale}${path === "/" ? "" : path}`;

  const buildEntry = (locale: string, path: string) => {
    const url = buildUrl(locale, path);
    const alternates: Record<string, string> = {};
    for (const l of locales) {
      alternates[l] = buildUrl(l, path);
    }
    return {
      url,
      lastModified,
      changeFrequency: path === "/" ? ("monthly" as const) : ("yearly" as const),
      priority: path === "/" ? 1 : 0.3,
      alternates,
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

  return [
    ...defaultEntries,
    ...defaultServiceEntries,
    ...localizedEntries,
    ...localizedServiceEntries,
  ];
}
