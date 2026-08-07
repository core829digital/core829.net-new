"use client";

import { useTranslations } from "next-intl";
import { Loader2, TrendingUp } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const STATUSES = [
  "new",
  "in_review",
  "quoted",
  "accepted",
  "declined",
  "completed",
] as const;

const euro = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/**
 * Pipeline finanziaria (admin/superadmin): valore dei preventivi per stato,
 * pipeline aperta (nuovi/in valutazione/preventivati) e won value
 * (accettati/completati). Stima dal budget se non c'è valutazione.
 */
export default function FinancePanel() {
  const t = useTranslations("adminPanel");
  const tStatus = useTranslations("quoteStatus");
  const pipeline = useQuery(api.admin.getFinancePipeline);

  if (!pipeline) {
    return (
      <section className="space-y-6">
        <div className="flex items-start gap-3">
          <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
          <div>
            <h3 className="text-base font-semibold">{t("finance.title")}</h3>
            <p className="mt-1 text-sm text-foreground-muted">
              {t("finance.hint")}
            </p>
          </div>
        </div>
        <p className="flex items-center gap-2 text-sm text-foreground-muted">
          <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden />
          {t("analytics.loading")}
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start gap-3">
        <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
        <div>
          <h3 className="text-base font-semibold">{t("finance.title")}</h3>
          <p className="mt-1 text-sm text-foreground-muted">{t("finance.hint")}</p>
        </div>
      </div>

      <dl className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-surface p-4">
          <dt className="tech-label">{t("finance.pipelineValue")}</dt>
          <dd className="mt-1 text-2xl font-semibold text-foreground">
            {euro.format(pipeline.pipelineValue)}
          </dd>
        </div>
        <div className="bg-surface p-4">
          <dt className="tech-label">{t("finance.wonValue")}</dt>
          <dd className="mt-1 text-2xl font-semibold text-accent">
            {euro.format(pipeline.wonValue)}
          </dd>
        </div>
        <div className="bg-surface p-4">
          <dt className="tech-label">{t("finance.totalPotential")}</dt>
          <dd className="mt-1 text-2xl font-semibold text-foreground">
            {euro.format(pipeline.totalPotential)}
          </dd>
        </div>
        <div className="bg-surface p-4">
          <dt className="tech-label">{t("finance.quotes30dValue")}</dt>
          <dd className="mt-1 text-2xl font-semibold text-foreground">
            {euro.format(pipeline.quotes30dValue)}
          </dd>
        </div>
      </dl>

      <section>
        <h4 className="text-sm font-semibold">{t("finance.byStatus")}</h4>
        <table className="mt-3 w-full border border-border text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="p-3 font-medium text-foreground-muted">{t("finance.status")}</th>
              <th className="p-3 text-right font-medium text-foreground-muted">{t("finance.count")}</th>
              <th className="p-3 text-right font-medium text-foreground-muted">{t("finance.quoted")}</th>
              <th className="p-3 text-right font-medium text-foreground-muted">{t("finance.estimated")}</th>
            </tr>
          </thead>
          <tbody>
            {STATUSES.map((s) => {
              const b = pipeline.byStatus[s];
              if (!b) return null;
              return (
                <tr key={s} className="border-b border-border last:border-0">
                  <td className="p-3 text-foreground">{tStatus(s)}</td>
                  <td className="p-3 text-right text-foreground">{b.count}</td>
                  <td className="p-3 text-right text-foreground">
                    {b.quoted > 0 ? euro.format(b.quoted) : "—"}
                  </td>
                  <td className="p-3 text-right text-foreground-muted">
                    {b.estimated > 0 ? euro.format(b.estimated) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </section>
  );
}
