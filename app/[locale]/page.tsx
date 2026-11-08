import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { withSeoOverride } from "@/lib/seoOverride";
import HomeTunnel from "@/components/tunnel/HomeTunnel";
import BookingSection from "@/components/sections/BookingSection";

/** La SEO della home viene da quella del sito (layout); qui si aggiunge solo quella scelta nel backoffice. */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return withSeoOverride({}, locale, "home");
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HomeTunnel />
      <BookingSection />
    </>
  );
}
