import { GA_ID, googleTagBootstrap } from "@/lib/googleTag";
import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from "@/lib/cookieConsent";
import GoogleConsentSync from "@/components/analytics/GoogleConsentSync";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import SmoothScrollProvider from "@/app/providers/SmoothScrollProvider";
import VisualViewportProvider from "@/app/providers/VisualViewportProvider";
import ResolvePendingHash from "@/components/ResolvePendingHash";
import ScrollProgress from "@/components/animations/ScrollProgress";
import { SimpleVersionSkipLink } from "@/components/layout/SimpleVersionToggle";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/seo/JsonLd";
import { CookieConsentProvider } from "@/components/cookies/CookieConsentContext";
import CookieBanner from "@/components/cookies/CookieBanner";
import PageViewTracker from "@/components/analytics/PageViewTracker";
import AnnouncementPill from "@/components/layout/AnnouncementPill";
import { getPortalConfig } from "@/lib/portalBridge";
import TrustpilotConsentGate from "@/components/cookies/TrustpilotConsentGate";
import { buildAlternates, clampDescription, SITE_URL } from "@/lib/seo";
import { getSiteKeywords } from "@/lib/seoKeywords";
import { VISIBLE_SERVICES_META } from "@/lib/constants";
import "../globals.css";

// Stesso stack di Andromedia Web (repo andromediaweb.it): "Saans" se installato sul dispositivo,
// altrimenti Inter self-hosted da next/font (font variabile: normale, bold e ogni peso intermedio),
// più JetBrains Mono per i dettagli tecnici. Vedi --font-sans / --font-display in globals.css.
// IMPORTANTE: le classi delle variabili dei font stanno su <html> (non su <body>): i token --font-* sono
// definiti su :root e li leggono; se le variabili stessero sul body, sul :root risulterebbero vuote e
// l'intero sito ricadrebbe su Times New Roman (era il comportamento precedente).
// Rispetto ad Andromedia (solo italiano) qui i subset sono ampliati: il sito ha 24 lingue e
// latin-ext / cirillico / greco evitano caratteri mancanti. CJK ecc. ricadono sui font di sistema.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "cyrillic", "greek"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
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
  const description = clampDescription(t("description"));

  const serviceTitles = VISIBLE_SERVICES_META.map((s) => ({
    key: s.key,
    title: tServices(`${s.index}.title`),
  }));

  return {
    title: {
      default: t("title"),
      template: "%s | CORE829",
    },
    description: description,
    keywords: getSiteKeywords(locale, serviceTitles),
    metadataBase: new URL(siteUrl),
    alternates: buildAlternates(locale),
    openGraph: {
      title: t("title"),
      description: description,
      url: `${siteUrl}/${locale}`,
      siteName: "CORE829",
      locale,
      type: "website",
      images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: "CORE829" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: description,
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
  const { announcement } = await getPortalConfig();

  return (
    <html lang={locale} className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Google tag (gtag.js) — Consent Mode v2: negato finché l'utente non acconsente */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: googleTagBootstrap(CONSENT_STORAGE_KEY, CONSENT_VERSION),
          }}
        />
      </head>
      <body
        className="font-sans antialiased"
      >
        <NextIntlClientProvider messages={messages}>
          <CookieConsentProvider>
            <GoogleConsentSync />
            <PageViewTracker />
            <TrustpilotConsentGate />
            <VisualViewportProvider />
            <SmoothScrollProvider>
              <SimpleVersionSkipLink />
              <ResolvePendingHash />
              <ScrollProgress />
              <Navbar />
              {announcement ? <AnnouncementPill text={announcement.text} href={announcement.href} cta={announcement.cta} /> : null}
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
