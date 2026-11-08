import type { Metadata } from "next";
import { getPortalConfig } from "@/lib/portalBridge";

/**
 * Applica a una pagina la SEO scelta nel backoffice (portale): prima il testo per quella lingua, altrimenti quello
 * "per tutte le lingue". Ogni campo vuoto lascia il testo predefinito del sito.
 */
export async function withSeoOverride(base: Metadata, locale: string, page: string): Promise<Metadata> {
  const { seo } = await getPortalConfig();
  const forPage = seo.filter((s) => s.page === page);
  const own = forPage.find((s) => s.locale === locale);
  const all = forPage.find((s) => s.locale === "*");
  const title = own?.title ?? all?.title ?? null;
  const description = own?.description ?? all?.description ?? null;
  const noindex = own?.noindex === true || (own === undefined && all?.noindex === true);
  if (!title && !description && !noindex) return base;
  return {
    ...base,
    ...(title ? { title: { absolute: title } } : {}),
    ...(description ? { description } : {}),
    openGraph: { ...(base.openGraph ?? {}), ...(title ? { title } : {}), ...(description ? { description } : {}) },
    twitter: { ...(base.twitter ?? {}), ...(title ? { title } : {}), ...(description ? { description } : {}) },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
