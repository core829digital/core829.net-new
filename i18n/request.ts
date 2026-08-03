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

  const messages = deepmerge(
    fallbackMessages.default,
    mainMessages.default,
    {
      // Sostituzione, non concatenazione: gli array della lingua richiesta
      // sostituiscono quelli di fallback. In caso contrario headline, stats,
      // services, projects ecc. mostrerebbero testo in due lingue insieme.
      arrayMerge: (_target, source) => source,
    }
  ) as unknown as AbstractIntlMessages;

  return {
    locale: requested,
    messages,
  };
});
