"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2, AlertCircle, Megaphone } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Notifica bulk (admin/superadmin): invia una notifica in-app + email a
 * tutti gli utenti verificati. Uso responsabile: conferma esplicita.
 */
export default function BulkNotifyPanel() {
  const t = useTranslations("adminPanel");
  const sendBulk = useMutation(api.admin.sendBulkNotification);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "ok" | "err";
    msg: string;
  } | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      await sendBulk({
        title: title.trim(),
        body: body.trim(),
        link: link.trim() || undefined,
      });
      setFeedback({ kind: "ok", msg: t("bulk.sent") });
      setTitle("");
      setBody("");
      setLink("");
      setConfirm(false);
    } catch {
      setFeedback({ kind: "err", msg: t("bulk.denied") });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="border border-border bg-surface p-6 md:p-8">
      <div className="flex items-start gap-3">
        <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
        <div>
          <h3 className="text-base font-semibold">{t("bulk.title")}</h3>
          <p className="mt-1 text-sm text-foreground-muted">{t("bulk.hint")}</p>
        </div>
      </div>

      <form onSubmit={(e) => void submit(e)} className="mt-6 space-y-4">
        <div>
          <label htmlFor="bulk-title" className="tech-label block">
            {t("bulk.titleLabel")}
          </label>
          <input
            id="bulk-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={150}
            required
            className="input-core829 mt-2"
          />
        </div>
        <div>
          <label htmlFor="bulk-body" className="tech-label block">
            {t("bulk.bodyLabel")}
          </label>
          <textarea
            id="bulk-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            maxLength={4000}
            required
            className="input-core829 mt-2 resize-y"
          />
        </div>
        <div>
          <label htmlFor="bulk-link" className="tech-label block">
            {t("bulk.linkLabel")}
          </label>
          <input
            id="bulk-link"
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            maxLength={500}
            placeholder="/area-riservata"
            className="input-core829 mt-2"
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

        {!confirm ? (
          <button
            type="button"
            disabled={!title.trim() || !body.trim() || busy}
            onClick={() => setConfirm(true)}
            className="inline-flex min-h-11 items-center gap-2 bg-foreground px-8 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent disabled:opacity-60"
          >
            <Megaphone className="h-4 w-4" aria-hidden />
            {t("bulk.next")}
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-foreground-muted">{t("bulk.confirmHint")}</p>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-11 items-center gap-2 bg-accent px-8 text-sm font-medium text-white transition-colors duration-300 hover:bg-foreground disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {t("bulk.confirm")}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirm(false)}
              className="link-ghost text-sm"
            >
              {t("users.cancel")}
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
