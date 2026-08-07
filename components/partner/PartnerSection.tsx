"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Send,
  Clock,
  Handshake,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Candidatura partner (area clienti): mostra lo stato della candidatura e
 * permette di inviare una nuova richiesta se non ce n'è una in sospeso.
 */
export default function PartnerSection() {
  const t = useTranslations("partner");
  const application = useQuery(api.partners.getMyPartnerApplication);
  const applyAsPartner = useMutation(api.partners.applyAsPartner);

  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "ok" | "err";
    msg: string;
  } | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() || busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      await applyAsPartner({ message: message.trim() });
      setMessage("");
      setFeedback({ kind: "ok", msg: t("submitted") });
    } catch {
      setFeedback({ kind: "err", msg: t("error") });
    } finally {
      setBusy(false);
    }
  };

  const status = application?.status;

  return (
    <section className="border border-border bg-surface p-6 md:p-8">
      <div className="flex items-start gap-3">
        <Handshake className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
        <div>
          <h3 className="text-base font-semibold">{t("title")}</h3>
          <p className="mt-1 text-sm text-foreground-muted">{t("hint")}</p>
        </div>
      </div>

      {!application ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-foreground-muted">
          <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden />
          {t("loading")}
        </p>
      ) : status === "pending" ? (
        <div className="mt-6 flex items-start gap-3 border border-border p-4">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
          <div>
            <p className="text-sm font-medium text-foreground">{t("pendingTitle")}</p>
            <p className="mt-1 text-sm text-foreground-muted">{t("pendingHint")}</p>
            {application.message && (
              <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
                {application.message}
              </p>
            )}
          </div>
        </div>
      ) : status === "approved" ? (
        <div className="mt-6 flex items-start gap-3 border border-accent/30 bg-accent/5 p-4">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
          <div>
            <p className="text-sm font-medium text-foreground">{t("approvedTitle")}</p>
            <p className="mt-1 text-sm text-foreground-muted">{t("approvedHint")}</p>
          </div>
        </div>
      ) : status === "rejected" ? (
        <div className="mt-6 flex items-start gap-3 border border-border p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
          <div>
            <p className="text-sm font-medium text-foreground">{t("rejectedTitle")}</p>
            <p className="mt-1 text-sm text-foreground-muted">{t("rejectedHint")}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-4">
          <div>
            <label htmlFor="pa-message" className="tech-label block">
              {t("messageLabel")}
            </label>
            <textarea
              id="pa-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={3000}
              placeholder={t("messagePlaceholder")}
              className="input-core829 mt-2 resize-y"
            />
          </div>
          {feedback && (
            <p
              role={feedback.kind === "err" ? "alert" : "status"}
              className={`flex items-center gap-2 text-sm ${
                feedback.kind === "err" ? "text-accent" : "text-foreground"
              }`}
            >
              {feedback.kind === "err" ? (
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" aria-hidden />
              )}
              {feedback.msg}
            </p>
          )}
          <button
            type="submit"
            disabled={busy || !message.trim()}
            className="inline-flex min-h-11 items-center gap-2 bg-foreground px-8 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Send className="h-4 w-4" aria-hidden />
            )}
            {t("submit")}
          </button>
        </form>
      )}
    </section>
  );
}
