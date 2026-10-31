import { getRequestConfig } from "next-intl/server";
import deepmerge from "deepmerge";
import type { AbstractIntlMessages } from "next-intl";
import { routing } from "./routing";

/**
 * Caricamento messaggi con fallback automatico su English:
 * ogni locale con traduzioni parziali eredita i messaggi mancanti da en.json.
 * Questo consente di abilitare nuove lingue senza dover tradurre l'intero sito.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  let requested = await requestLocale;

  if (!requested || !routing.locales.includes(requested as never)) {
    requested = routing.defaultLocale;
  }

  const [mainMessages, fallbackMessages] = await Promise.all([
    import(`../messages/${requested}.json`),
    import("../messages/en.json"),
  ]);

  const merged = deepmerge(
    fallbackMessages.default,
    mainMessages.default,
    {
      // Sostituzione, non concatenazione: gli array della lingua richiesta
      // sostituiscono quelli di fallback. In caso contrario headline, stats,
      // services, projects ecc. mostrerebbero testo in due lingue insieme.
      arrayMerge: (_target, source) => source,
    }
  ) as unknown as AbstractIntlMessages;

  // Case study: l'elenco (e l'ordine) è quello inglese; per ogni progetto si usa
  // la versione della lingua richiesta se esiste (match per id), altrimenti
  // quella inglese. Così una nuova storia compare subito in tutte le lingue.
  type Project = { id: string };
  const enProjects = (
    fallbackMessages.default as { caseStudies: { projects: Project[] } }
  ).caseStudies.projects;
  const localeProjects = (
    mainMessages.default as { caseStudies?: { projects?: Project[] } }
  ).caseStudies?.projects;
  const mergedCase = (merged as unknown as {
    caseStudies: { projects: Project[] };
  }).caseStudies;
  mergedCase.projects = enProjects.map(
    (en) => localeProjects?.find((p) => p.id === en.id) ?? en
  );

  const messages = merged;

  return {
    locale: requested,
    messages,
  };
});
