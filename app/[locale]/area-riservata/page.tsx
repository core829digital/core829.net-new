import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import InternalArea from "@/components/internal-area/InternalArea";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "internalArea" });
  return {
    title: `${t("metaTitle")} — CORE829`,
    description: t("metaDescription"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AreaRiservataPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <section className="container-core829 py-24 lg:py-32">
        <InternalArea />
      </section>
    </main>
  );
}
