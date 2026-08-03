import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function LocaleNotFound() {
  const t = await getTranslations("notFound");

  return (
    <section className="container-core829 flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="kicker mb-4">404</p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-md text-foreground-muted">{t("desc")}</p>
      <Link href="/" className="link-ghost mt-8">
        {t("back")}
      </Link>
    </section>
  );
}
