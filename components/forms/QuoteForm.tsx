"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations, useMessages } from "next-intl";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  title: string;
}

type Status = "idle" | "submitting" | "success" | "error";

const BUDGET_KEYS = ["0", "1", "2", "3"] as const;

/**
 * Form di richiesta preventivo (pagina /preventivo).
 * Sanitizzazione e rate limit avvengono lato Convex (quotes:submitQuote).
 * Anti-spam leggero: honeypot + timing.
 */
export default function QuoteForm() {
  const t = useTranslations("preventivo");
  const tContact = useTranslations("contact");
  const messages = useMessages();
  const services = useMemo(
    () =>
      (messages.solution as unknown as { services: Service[] }).services ?? [],
    [messages]
  );

  const submitQuote = useMutation(api.quotes.submitQuote);

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
      setFormError(tContact("required"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError(tContact("invalidEmail"));
      return;
    }

    setStatus("submitting");
    try {
      await submitQuote({
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
          <label htmlFor="quote-name" className="tech-label block">
            {tContact("name")} *
          </label>
          <input
            id="quote-name"
            name="name"
            type="text"
            required
            maxLength={100}
            placeholder={tContact("namePlaceholder")}
            className="input-core829 mt-2"
          />
        </div>
        <div>
          <label htmlFor="quote-email" className="tech-label block">
            {tContact("email")} *
          </label>
          <input
            id="quote-email"
            name="email"
            type="email"
            required
            maxLength={254}
            placeholder={tContact("emailPlaceholder")}
            className="input-core829 mt-2"
          />
        </div>
      </div>

      <div>
        <label htmlFor="quote-company" className="tech-label block">
          {tContact("company")}
        </label>
        <input
          id="quote-company"
          name="company"
          type="text"
          maxLength={150}
          placeholder={tContact("companyPlaceholder")}
          className="input-core829 mt-2"
        />
      </div>

      <fieldset>
        <legend className="tech-label">{tContact("service")}</legend>
        <p className="mt-1 text-xs text-foreground-muted">
          {tContact("serviceHint")}
        </p>
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
        <label htmlFor="quote-budget" className="tech-label block">
          {tContact("budget")}
        </label>
        <select
          id="quote-budget"
          name="budgetRange"
          className="input-core829 mt-2"
          defaultValue=""
        >
          <option value="" disabled>
            {tContact("budgetPlaceholder")}
          </option>
          {BUDGET_KEYS.map((key) => (
            <option key={key} value={key}>
              {tContact(`budgetOptions.${key}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="quote-message" className="tech-label block">
          {tContact("message")} *
        </label>
        <textarea
          id="quote-message"
          name="message"
          required
          rows={5}
          maxLength={5000}
          placeholder={tContact("messagePlaceholder")}
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
          {tContact("error")}
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
