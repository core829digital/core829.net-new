"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations, useMessages } from "next-intl";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { submitContactRequest } from "@/lib/contact";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  title: string;
}

type Status = "idle" | "submitting" | "success" | "error";

const BUDGET_KEYS = ["0", "1", "2", "3"] as const;

/**
 * Form di contatto / richiesta preventivo.
 * Protezione anti-spam leggera: honeypot + validazione timing + validazione client.
 * Invio: mutation Convex se configurata, altrimenti API route /api/contact.
 */
export default function ContactForm() {
  const t = useTranslations("contact");
  const messages = useMessages();
  const services = (messages.solution as unknown as { services: Service[] }).services;

  const [status, setStatus] = useState<Status>("idle");
  const [selected, setSelected] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const mountedAt = useRef<number>(0);
  const honeypotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  const toggleService = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Honeypot: se compilato, simula successo senza inviare nulla.
    if (honeypotRef.current?.value) {
      setStatus("success");
      return;
    }
    // Timing: submit troppo rapido = bot.
    if (Date.now() - mountedAt.current < 3000) {
      setStatus("success");
      return;
    }

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (!name || !email || !message) {
      setFormError(t("required"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError(t("invalidEmail"));
      return;
    }

    setStatus("submitting");
    try {
      await submitContactRequest({
        name,
        email,
        company: String(formData.get("company") ?? "").trim() || undefined,
        serviceInterest: selected,
        message,
        budgetRange:
          String(formData.get("budgetRange") ?? "").trim() || undefined,
      });
      setStatus("success");
      form.reset();
      setSelected([]);
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Honeypot nascosto */}
      <input
        ref={honeypotRef}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="tech-label block">
            {t("name")} *
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            placeholder={t("namePlaceholder")}
            className="input-core829 mt-2"
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="tech-label block">
            {t("email")} *
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder={t("emailPlaceholder")}
            className="input-core829 mt-2"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-company" className="tech-label block">
          {t("company")}
        </label>
        <input
          id="contact-company"
          name="company"
          type="text"
          placeholder={t("companyPlaceholder")}
          className="input-core829 mt-2"
        />
      </div>

      <fieldset>
        <legend className="tech-label">{t("service")}</legend>
        <p className="mt-1 text-xs text-foreground-muted">{t("serviceHint")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {services.map((service, i) => {
            const active = selected.includes(service.id);
            return (
              <button
                key={service.id ?? i}
                type="button"
                aria-pressed={active}
                onClick={() => toggleService(service.id)}
                className={cn(
                  "min-h-11 border px-4 py-2 text-sm transition-colors duration-200",
                  active
                    ? "border-accent bg-accent text-white"
                    : "border-border text-foreground-muted hover:border-foreground hover:text-foreground"
                )}
              >
                {service.title}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="contact-budget" className="tech-label block">
          {t("budget")}
        </label>
        <select
          id="contact-budget"
          name="budgetRange"
          className="input-core829 mt-2"
          defaultValue=""
        >
          <option value="" disabled>
            {t("budgetPlaceholder")}
          </option>
          {BUDGET_KEYS.map((key) => (
            <option key={key} value={key}>
              {t(`budgetOptions.${key}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contact-message" className="tech-label block">
          {t("message")} *
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder={t("messagePlaceholder")}
          className="input-core829 mt-2 resize-y"
        />
      </div>

      {formError && (
        <p role="alert" className="flex items-center gap-2 text-sm text-accent">
          <AlertCircle className="h-4 w-4" aria-hidden />
          {formError}
        </p>
      )}

      {status === "success" && (
        <p role="status" className="flex items-center gap-2 text-sm text-foreground">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" aria-hidden />
          {t("success")}
        </p>
      )}

      {status === "error" && (
        <p role="alert" className="flex items-center gap-2 text-sm text-accent">
          <AlertCircle className="h-4 w-4" aria-hidden />
          {t("error")}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex min-h-11 items-center justify-center gap-2 bg-foreground px-8 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent disabled:opacity-60"
      >
        {status === "submitting" && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        )}
        {t("submit")}
      </button>
    </form>
  );
}
