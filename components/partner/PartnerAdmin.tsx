"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2, AlertCircle, XCircle, Handshake } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * Gestione candidature partner (admin/superadmin):
 * elenco con stato, approvazione/rifiuto (con email automatica al richiedente).
 */
export default function PartnerAdmin() {
  const t = useTranslations("partner");
  const applications = useQuery(api.partners.listPartnerApplications, {});
  const decide = useMutation(api.partners.decidePartnerApplication);

  const [busy, setBusy] = useState<Id<"partnerApplications"> | null>(null);
  const [feedback, setFeedback] = useState<{
    kind: "ok" | "err";
    msg: string;
  } | null>(null);

  const run = async (
    id: Id<"partnerApplications">,
    approve: boolean
  ) => {
    setBusy(id);
    setFeedback(null);
    try {
      await decide({ applicationId: id, approve });
      setFeedback({
        kind: "ok",
        msg: approve ? t("decidedApproved") : t("decidedRejected"),
      });
    } catch {
      setFeedback({ kind: "err", msg: t("error") });
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="border border-border bg-surface p-6 md:p-8">
      <div className="flex items-start gap-3">
        <Handshake className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
        <div>
          <h3 className="text-base font-semibold">{t("adminTitle")}</h3>
          <p className="mt-1 text-sm text-foreground-muted">{t("adminHint")}</p>
        </div>
      </div>

      {!applications ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-foreground-muted">
          <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden />
          {t("loading")}
        </p>
      ) : applications.length === 0 ? (
        <p className="mt-4 border border-border p-6 text-sm text-foreground-muted">
          {t("empty")}
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-border border border-border">
          {applications.map((app) => {
            const isPending = app.status === "pending";
            return (
              <li key={app._id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {app.userName || app.userEmail}
                    </p>
                    <p className="mt-1 truncate text-xs text-foreground-muted">
                      {app.userEmail}
                    </p>
                    <p className="mt-2 text-sm whitespace-pre-wrap text-foreground">
                      {app.message}
                    </p>
                    <p className="mt-2 text-xs text-foreground-muted">
                      {new Date(app.createdAt).toLocaleString()}
                      {" · "}
                      {t(`status_${app.status}`)}
                    </p>
                  </div>

                  {isPending ? (
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        disabled={busy !== null}
                        onClick={() => void run(app._id, true)}
                        className="inline-flex min-h-10 items-center gap-2 bg-foreground px-4 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent disabled:opacity-60"
                      >
                        {busy === app._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" aria-hidden />
                        )}
                        {t("approve")}
                      </button>
                      <button
                        type="button"
                        disabled={busy !== null}
                        onClick={() => void run(app._id, false)}
                        className="inline-flex min-h-10 items-center gap-2 border border-accent px-4 text-sm font-medium text-accent transition-colors duration-300 hover:bg-accent hover:text-white disabled:opacity-60"
                      >
                        {busy === app._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        ) : (
                          <XCircle className="h-4 w-4" aria-hidden />
                        )}
                        {t("reject")}
                      </button>
                    </div>
                  ) : (
                    <span className="shrink-0 text-xs uppercase tracking-widest text-foreground-muted">
                      {t(`status_${app.status}`)}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {feedback && (
        <p
          role={feedback.kind === "err" ? "alert" : "status"}
          className={`mt-4 flex items-center gap-2 text-sm ${
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
    </section>
  );
}
