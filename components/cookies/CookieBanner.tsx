"use client";

import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import CookiePreferencesModal from "./CookiePreferencesModal";
import { useCookieConsent } from "./CookieConsentContext";

export default function CookieBanner() {
  const t = useTranslations("cookieConsent");
  const { status, acceptAll, rejectAll, openPreferences } = useCookieConsent();

  return (
    <>
      <AnimatePresence>
        {status === "unset" && (
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            role="dialog"
            aria-modal="false"
            aria-label={t("bannerTitle")}
            className="fixed inset-x-0 bottom-0 z-[85] border-t border-border bg-background/95 p-4 backdrop-blur-md sm:p-6"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold tracking-tight text-foreground">
                  {t("bannerTitle")}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                  {t("bannerDesc")}{" "}
                  <Link
                    href="/cookie-policy"
                    className="underline decoration-accent/50 underline-offset-4 transition-colors hover:text-accent"
                  >
                    {t("policyLinkLabel")}
                  </Link>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="ghost" onClick={openPreferences} className="px-0">
                  {t("managePreferences")}
                </Button>
                <Button variant="secondary" onClick={rejectAll}>
                  {t("rejectAll")}
                </Button>
                <Button variant="primary" onClick={acceptAll}>
                  {t("acceptAll")}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CookiePreferencesModal />
    </>
  );
}
