"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errorPage");

  useEffect(() => {
    console.error("[error-boundary]", error);
  }, [error]);

  return (
    <section className="container-core829 flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="kicker mb-4">{t("kicker")}</p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        {t("title")}
      </h1>
      <p className="mt-4 max-w-md text-foreground-muted">{t("desc")}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button variant="primary" onClick={() => reset()}>
          {t("retry")}
        </Button>
        <Link href="/" className="link-ghost">
          {t("back")}
        </Link>
      </div>
    </section>
  );
}
