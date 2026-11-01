import { setRequestLocale } from "next-intl/server";
import HomeTunnel from "@/components/tunnel/HomeTunnel";
import BookingSection from "@/components/sections/BookingSection";

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
