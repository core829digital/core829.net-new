import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import SmoothScrollProvider from "@/app/providers/SmoothScrollProvider";
import VisualViewportProvider from "@/app/providers/VisualViewportProvider";
import ResolvePendingHash from "@/components/ResolvePendingHash";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { CookieConsentProvider } from "@/components/cookies/CookieConsentContext";
import CookieBanner from "@/components/cookies/CookieBanner";
import TrustpilotConsentGate from "@/components/cookies/TrustpilotConsentGate";
import { buildAlternates, SITE_URL } from "@/lib/seo";
import { getSiteKeywords } from "@/lib/seoKeywords";
import { SERVICES_META } from "@/lib/constants";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const tServices = await getTranslations({ locale, namespace: "solution.services" });
  const siteUrl = SITE_URL;

  const serviceTitles = SERVICES_META.map((s, i) => ({
    key: s.key,
    title: tServices(`${i}.title`),
  }));

  return {
    title: {
      default: t("title"),
      template: "%s | CORE829",
    },
    description: t("description"),
    keywords: getSiteKeywords(locale, serviceTitles),
    metadataBase: new URL(siteUrl),
    alternates: buildAlternates(locale),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${siteUrl}/${locale}`,
      siteName: "CORE829",
      locale,
      type: "website",
      images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: "CORE829" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: [`${siteUrl}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
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
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <CookieConsentProvider>
            <TrustpilotConsentGate />
            <VisualViewportProvider />
            <SmoothScrollProvider>
              <ResolvePendingHash />
              <Navbar />
              <main>{children}</main>
              <Footer />
            </SmoothScrollProvider>
            <CookieBanner />
          </CookieConsentProvider>
        </NextIntlClientProvider>
        <JsonLd />
      </body>
    </html>
  );
}
