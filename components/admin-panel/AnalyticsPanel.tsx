"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, BarChart3, Globe2, MapPin, Eye, UserCheck } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const DAY_OPTIONS = [7, 30, 90];

/**
 * Analytics delle pagine (admin/superadmin): visualizzazioni, visitatori
 * unici, top pagine e geo (paese/città dagli header Vercel). Nessun IP.
 */
export default function AnalyticsPanel() {
  const t = useTranslations("adminPanel");
  const [days, setDays] = useState(30);
  const analytics = useQuery(api.admin.getAnalytics, { days });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <BarChart3 className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
          <div>
            <h3 className="text-base font-semibold">{t("analytics.title")}</h3>
            <p className="mt-1 text-sm text-foreground-muted">
              {t("analytics.hint")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              aria-pressed={days === d}
              className={`border px-4 py-2 text-sm transition-colors duration-200 ${
                days === d
                  ? "border-accent bg-accent text-white"
                  : "border-border text-foreground-muted hover:border-foreground hover:text-foreground"
              }`}
            >
              {d} {t("analytics.days")}
            </button>
          ))}
        </div>
      </div>

      {!analytics ? (
        <p className="flex items-center gap-2 text-sm text-foreground-muted">
          <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden />
          {t("analytics.loading")}
        </p>
      ) : (
        <>
          <dl className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={Eye} label={t("analytics.totalViews")} value={String(analytics.totalViews)} />
            <Stat icon={UserCheck} label={t("analytics.authedViews")} value={String(analytics.authedViews)} />
            <Stat icon={Globe2} label={t("analytics.anonymousViews")} value={String(analytics.anonymousViews)} />
            <Stat icon={MapPin} label={t("analytics.uniqueVisitors")} value={String(analytics.uniqueVisitors)} />
          </dl>

          <div className="grid gap-6 lg:grid-cols-2">
            <TopList
              title={t("analytics.topPages")}
              rows={analytics.topPaths.map((r) => ({ label: r.path, value: r.count }))}
              t={t}
            />
            <TopList
              title={t("analytics.topCountries")}
              rows={analytics.topCountries.map((r) => ({ label: r.country, value: r.count }))}
              t={t}
            />
          </div>

          <TopList
            title={t("analytics.topCities")}
            rows={analytics.topCities.map((r) => ({ label: r.city, value: r.count }))}
            t={t}
          />

          <section>
            <h4 className="text-sm font-semibold">{t("analytics.byDay")}</h4>
            {analytics.byDay.length === 0 ? (
              <p className="mt-2 text-sm text-foreground-muted">
                {t("analytics.empty")}
              </p>
            ) : (
              <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto border border-border p-4">
                {analytics.byDay.map((d) => (
                  <li
                    key={d.date}
                    className="flex items-center justify-between gap-4 text-sm"
                  >
                    <span className="text-foreground-muted">{d.date}</span>
                    <div className="flex items-center gap-4">
                      <span className="w-16 text-right text-foreground">{d.total}</span>
                      <span className="w-16 text-right text-xs text-foreground-muted">
                        {d.authed} {t("analytics.authedShort")}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </section>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Eye;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-surface p-4">
      <Icon className="h-5 w-5 text-accent" aria-hidden />
      <dt className="mt-2 tech-label">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function TopList({
  title,
  rows,
  t,
}: {
  title: string;
  rows: Array<{ label: string; value: number }>;
  t: (key: string) => string;
}) {
  if (rows.length === 0) {
    return (
      <section>
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="mt-2 text-sm text-foreground-muted">{t("analytics.empty")}</p>
      </section>
    );
  }
  const max = rows[0].value || 1;
  return (
    <section>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-3 space-y-2">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-3">
            <span className="w-40 shrink-0 truncate text-sm text-foreground-muted">
              {r.label}
            </span>
            <div className="h-2 flex-1 bg-surface">
              <div
                className="h-2 bg-accent"
                style={{ width: `${Math.max((r.value / max) * 100, 2)}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-sm text-foreground">
              {r.value}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
