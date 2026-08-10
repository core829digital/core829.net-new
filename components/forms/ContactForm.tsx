"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { SERVICES_META } from "@/lib/constants";

type Status = "idle" | "submitting" | "success" | "error";

const inputClasses =
  "w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted/60 transition-colors duration-300 focus:border-accent focus:outline-none";

export default function ContactForm() {
  const t = useTranslations("contactForm");
  const tServices = useTranslations("solution.services");
  const [status, setStatus] = useState<Status>("idle");
  const [consent, setConsent] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          company: data.get("company"),
          service: data.get("service"),
          budget: data.get("budget"),
          message: data.get("message"),
          consent: data.get("consent") === "on",
          website: data.get("website"),
        }),
      });

      if (!res.ok) throw new Error("request_failed");
      setStatus("success");
      form.reset();
      setConsent(false);
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-start gap-4 border border-border bg-surface p-8">
        <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-accent" aria-hidden />
        <div>
          <p className="text-lg font-semibold tracking-tight text-foreground">
            {t("successTitle")}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
            {t("successDesc")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="relative">
      <p className="tech-label">{t("title")}</p>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-foreground-muted">
        {t("desc")}
      </p>

      {/* Honeypot: nascosto via CSS, non aria-hidden per non escluderlo dal focus dei bot che ignorano lo stile. */}
      <div className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-xs font-semibold uppercase tracking-widest text-foreground-muted">
            {t("nameLabel")}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={200}
            placeholder={t("namePlaceholder")}
            className={`mt-2 ${inputClasses}`}
          />
        </div>
        <div>
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-foreground-muted">
            {t("emailLabel")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={320}
            placeholder={t("emailPlaceholder")}
            className={`mt-2 ${inputClasses}`}
          />
        </div>
        <div>
          <label htmlFor="company" className="text-xs font-semibold uppercase tracking-widest text-foreground-muted">
            {t("companyLabel")}
          </label>
          <input
            id="company"
            name="company"
            type="text"
            maxLength={200}
            placeholder={t("companyPlaceholder")}
            className={`mt-2 ${inputClasses}`}
          />
        </div>
        <div>
          <label htmlFor="service" className="text-xs font-semibold uppercase tracking-widest text-foreground-muted">
            {t("serviceLabel")}
          </label>
          <select id="service" name="service" defaultValue="" className={`mt-2 ${inputClasses}`}>
            <option value="">{t("serviceDefault")}</option>
            {SERVICES_META.map((s, i) => (
              <option key={s.key} value={tServices(`${i}.title`)}>
                {tServices(`${i}.title`)}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="budget" className="text-xs font-semibold uppercase tracking-widest text-foreground-muted">
            {t("budgetLabel")}
          </label>
          <input
            id="budget"
            name="budget"
            type="text"
            maxLength={100}
            placeholder={t("budgetPlaceholder")}
            className={`mt-2 ${inputClasses}`}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="message" className="text-xs font-semibold uppercase tracking-widest text-foreground-muted">
            {t("messageLabel")}
          </label>
          <textarea
            id="message"
            name="message"
            required
            maxLength={5000}
            rows={5}
            placeholder={t("messagePlaceholder")}
            className={`mt-2 resize-none ${inputClasses}`}
          />
        </div>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-foreground-muted">
        <input
          type="checkbox"
          name="consent"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 border border-border accent-accent"
        />
        <span>
          {t("consentLabel")}{" "}
          <Link
            href="/privacy-policy"
            className="underline decoration-accent/50 underline-offset-4 transition-colors hover:text-accent"
          >
            {t("privacyLinkLabel")}
          </Link>
          .
        </span>
      </label>

      {status === "error" && (
        <div className="mt-6 flex items-start gap-3 border border-red-500/40 bg-red-500/5 p-4">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-foreground">{t("errorTitle")}</p>
            <p className="mt-1 text-xs leading-relaxed text-foreground-muted">{t("errorDesc")}</p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Button type="submit" variant="primary" disabled={status === "submitting"}>
          {status === "submitting" ? t("submitting") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
