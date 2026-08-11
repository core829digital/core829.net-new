import { getLocale, getTranslations } from "next-intl/server";
import { COMPANY, SERVICES_META } from "@/lib/constants";
import { SOCIAL_LINKS } from "@/components/SocialIcons";
import { getBrandKeywords, getServiceKeywords } from "@/lib/seoKeywords";

/**
 * Dati strutturati JSON-LD: Organization per CORE829 + Service per ciascuno
 * dei servizi (SERVICES_META). Rendering server-side, nessun JS aggiuntivo.
 */
export default async function JsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://core829.net";
  const locale = await getLocale();
  const tMeta = await getTranslations("metadata");
  const tServices = await getTranslations("solution.services");

  const serviceSchemas = SERVICES_META.map((service, i) => {
    const name = tServices(`${i}.title`);
    return {
      "@context": "https://schema.org",
      "@type": "Service",
      name,
      description: tServices(`${i}.desc`),
      keywords: getServiceKeywords(locale, service.key, name).join(", "),
      provider: {
        "@type": "Organization",
        name: "CORE829",
        url: siteUrl,
        logo: `${siteUrl}/core829-logo/829black%20trsp.webp`,
      },
      areaServed: "Europe",
    };
  });

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CORE829",
    url: siteUrl,
    logo: `${siteUrl}/core829-logo/829black%20trsp.webp`,
    email: COMPANY.email,
    description: tMeta("description"),
    legalName: COMPANY.legalName,
    areaServed: ["Europe", "Romania", "Italy"],
    telephone: [COMPANY.phoneRo, COMPANY.phoneIt],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Str. Mihai Eminescu, 10",
      addressLocality: "Roman",
      addressRegion: "Neamț",
      addressCountry: "RO",
    },
    vatID: COMPANY.cui,
    taxID: COMPANY.cui,
    sameAs: [
      "https://www.trustpilot.com/review/core829.net",
      ...SOCIAL_LINKS.map((s) => s.href),
    ],
    knowsAbout: [
      ...getBrandKeywords(locale),
      ...SERVICES_META.flatMap((service, i) =>
        getServiceKeywords(locale, service.key, tServices(`${i}.title`)).slice(0, 4)
      ),
    ],
  };

  const safeJson = (obj: unknown) =>
    JSON.stringify(obj).replace(/<\//g, "<\\/");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(serviceSchemas) }}
      />
    </>
  );
}
