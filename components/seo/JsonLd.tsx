import { getTranslations } from "next-intl/server";
import { COMPANY } from "@/lib/constants";

/**
 * Dati strutturati JSON-LD: Organization per CORE829 + Service per ciascuno
 * degli 8 servizi. Rendering server-side, nessun JS aggiuntivo.
 */
export default async function JsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://core829.net";
  const tMeta = await getTranslations("metadata");
  const tServices = await getTranslations("solution.services");

  const serviceSchemas = Array.from({ length: 8 }, (_, i) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: tServices(`${i}.title`),
    description: tServices(`${i}.desc`),
    provider: {
      "@type": "Organization",
      name: "CORE829",
      url: siteUrl,
      logo: `${siteUrl}/core829-logo/829black%20trsp.png`,
    },
    areaServed: "Europe",
  }));

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CORE829",
    url: siteUrl,
    logo: `${siteUrl}/core829-logo/829black%20trsp.png`,
    email: COMPANY.email,
    description: tMeta("description"),
    legalName: COMPANY.legalName,
    areaServed: "Europe",
    telephone: [COMPANY.phoneRo, COMPANY.phoneIt],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Str. Mihai Eminescu, 10",
      addressLocality: "Roman",
      addressCountry: "RO",
    },
    vatID: COMPANY.cui,
    sameAs: [
      "https://www.trustpilot.com/review/core829.net",
    ],
    knowsAbout: [
      "Web Applications",
      "Software Development",
      "Artificial Intelligence",
      "B2B Automations",
      "SEO",
      "Digital Marketing",
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
