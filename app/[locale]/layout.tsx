import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import SmoothScrollProvider from "@/app/providers/SmoothScrollProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { TrustpilotScript } from "@/components/Trustpilot";
import JsonLd from "@/components/seo/JsonLd";
import "../globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic", "greek"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jetbrains",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://core829.net";

  const alternates: Record<string, string> = {};
  for (const l of routing.locales) {
    alternates[l] = `${siteUrl}/${l}`;
  }

  return {
    title: {
      default: t("title"),
      template: "%s | CORE829",
    },
    description: t("description"),
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: alternates,
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${siteUrl}/${locale}`,
      siteName: "CORE829",
      locale,
      type: "website",
      images: [{ url: `${siteUrl}/og-image.svg`, width: 1200, height: 630, alt: "CORE829" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [`${siteUrl}/og-image.svg`],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <TrustpilotScript />
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <SmoothScrollProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </SmoothScrollProvider>
        </NextIntlClientProvider>
        <JsonLd />
      </body>
    </html>
  );
}
