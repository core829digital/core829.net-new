"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import CookieToggle from "./CookieToggle";
import { useCookieConsent } from "./CookieConsentContext";

export default function CookiePreferencesModal() {
  const t = useTranslations("cookieConsent");
  const { consent, isPreferencesOpen, closePreferences, acceptAll, rejectAll, savePreferences } =
    useCookieConsent();

  const [draft, setDraft] = useState({
    preferences: consent.preferences,
    analytics: consent.analytics,
    marketing: consent.marketing,
  });

  useEffect(() => {
    if (isPreferencesOpen) {
      setDraft({
        preferences: consent.preferences,
        analytics: consent.analytics,
        marketing: consent.marketing,
      });
    }
  }, [isPreferencesOpen, consent]);

  useEffect(() => {
    if (!isPreferencesOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePreferences();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isPreferencesOpen, closePreferences]);

  const categories = [
    {
      key: "necessary" as const,
      title: t("necessaryTitle"),
      desc: t("necessaryDesc"),
      checked: true,
      disabled: true,
    },
    {
      key: "preferences" as const,
      title: t("preferencesTitle"),
      desc: t("preferencesDesc"),
      checked: draft.preferences,
      disabled: false,
    },
    {
      key: "analytics" as const,
      title: t("analyticsTitle"),
      desc: t("analyticsDesc"),
      checked: draft.analytics,
      disabled: false,
    },
    {
      key: "marketing" as const,
      title: t("marketingTitle"),
      desc: t("marketingDesc"),
      checked: draft.marketing,
      disabled: false,
    },
  ];

  return (
    <AnimatePresence>
      {isPreferencesOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[90] flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={t("modalTitle")}
          onClick={(e) => {
            if (e.target === e.currentTarget) closePreferences();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2 }}
            className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto border border-border bg-background p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="kicker">{t("modalTitle")}</p>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-foreground-muted">
                  {t("modalDesc")}
                </p>
              </div>
              <button
                type="button"
                onClick={closePreferences}
                aria-label="Close"
                className="flex h-10 w-10 shrink-0 items-center justify-center border border-border text-foreground transition-colors duration-300 hover:border-accent hover:text-accent"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="mt-8 space-y-4">
              {categories.map((cat) => (
                <div
                  key={cat.key}
                  className="flex items-start justify-between gap-6 border border-border p-5"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold tracking-tight text-foreground">
                      {cat.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-foreground-muted">
                      {cat.desc}
                    </p>
                    {cat.disabled && (
                      <span className="mt-3 inline-block font-mono text-[10px] uppercase tracking-widest text-accent">
                        {t("alwaysActive")}
                      </span>
                    )}
                  </div>
                  <CookieToggle
                    checked={cat.checked}
                    disabled={cat.disabled}
                    label={cat.title}
                    onChange={(value) =>
                      setDraft((prev) => ({ ...prev, [cat.key]: value }))
                    }
                  />
                </div>
              ))}
            </div>

            <p className="mt-6 text-xs text-foreground-muted">
              <Link
                href="/cookie-policy"
                className="underline decoration-accent/50 underline-offset-4 transition-colors hover:text-accent"
              >
                {t("policyLinkLabel")}
              </Link>
            </p>

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={rejectAll}>
                {t("rejectAll")}
              </Button>
              <Button
                variant="secondary"
                onClick={() => savePreferences(draft)}
              >
                {t("save")}
              </Button>
              <Button variant="primary" onClick={acceptAll}>
                {t("acceptAll")}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
