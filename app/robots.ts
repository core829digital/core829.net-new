import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * I deploy che non sono la produzione (preview Vercel, staging) non devono
 * mai essere indicizzati: altrimenti Google può indicizzare due copie
 * identiche del sito sotto due domini diversi.
 */
const isProduction = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === "production"
  : process.env.NODE_ENV === "production";

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
