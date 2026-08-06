"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Ban,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { isSuperadminRole } from "@/lib/roles";

const ROLE_OPTIONS = ["client", "partner", "technical", "admin"] as const;

/**
 * Pannello di amministrazione (admin/superadmin):
 * - Statistiche di piattaforma (utenti, preventivi, performance)
 * - Gestione utenti: assegnazione ruoli e ban/unban
 *   (solo il superadmin può nominare altri admin)
 * - Log delle azioni amministrative
 */
export default function AdminPanel({ userRole }: { userRole: string }) {
  const t = useTranslations("adminPanel");
  const tRole = useTranslations("userRole");
  const isSuper = isSuperadminRole(userRole);

  const stats = useQuery(api.admin.getPlatformStats);
  const logs = useQuery(api.admin.listAdminLogs, { limit: 50 });
  const users = useQuery(api.users.listUsers);

  const updateUserRole = useMutation(api.users.updateUserRole);
  const setUserBan = useMutation(api.admin.setUserBan);

  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null
  );
  const [banTarget, setBanTarget] = useState<Id<"users"> | null>(null);
  const [banReason, setBanReason] = useState("");
  const [busy, setBusy] = useState(false);

  const show = (kind: "ok" | "err", text: string) => setMsg({ kind, text });

  const runRole = async (userId: Id<"users">, role: string) => {
    setBusy(true);
    setMsg(null);
    try {
      await updateUserRole({ userId, role: role as never });
      show("ok", t("users.roleSaved"));
    } catch {
      show("err", t("users.denied"));
    } finally {
      setBusy(false);
    }
  };

  const runBan = async (userId: Id<"users">, banned: boolean) => {
    setBusy(true);
    setMsg(null);
    try {
      await setUserBan({
        userId,
        banned,
        reason: banned ? banReason.trim() || undefined : undefined,
      });
      show("ok", t("users.banSaved"));
      setBanTarget(null);
      setBanReason("");
    } catch {
      show("err", t("users.denied"));
    } finally {
      setBusy(false);
    }
  };

  const roleOptions = isSuper
    ? ROLE_OPTIONS
    : ROLE_OPTIONS.filter((r) => r !== "admin");

  return (
    <div className="space-y-8">
      <StatsSection stats={stats} t={t} />

      <section className="border border-border bg-surface p-6 md:p-8">
        <h3 className="text-base font-semibold">{t("users.title")}</h3>

        {!users ? (
          <p className="mt-4 text-sm text-foreground-muted">
            <Loader2
              className="mr-2 inline h-4 w-4 animate-spin text-accent"
              aria-hidden
            />
            {t("users.loading")}
          </p>
        ) : (
          <div className="mt-4 divide-y divide-border">
            {users.map((u) => {
              const isProtected = !!u.protected;
              const banned = !!u.isBanned;
              const banningThis = banTarget === u._id;
              return (
                <div
                  key={u._id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {u.name || "—"}
                      {!u.emailVerified && (
                        <span className="ml-2 text-xs text-accent">
                          {t("users.unverified")}
                        </span>
                      )}
                      {banned && (
                        <span className="ml-2 text-xs text-accent">
                          {t("users.bannedBadge")}
                        </span>
                      )}
                      {isProtected && (
                        <span className="ml-2 inline-flex items-center gap-1 text-xs text-foreground">
                          <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden />
                          {t("users.protectedBadge")}
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-foreground-muted">
                      {u.email}
                    </p>
                    {banned && u.banReason && (
                      <p className="truncate text-xs text-foreground-muted">
                        {u.banReason}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={u.role}
                      disabled={isProtected || busy}
                      onChange={(e) => void runRole(u._id, e.target.value)}
                      className="input-core829 w-auto min-w-32"
                      aria-label={`${t("users.roleLabel")} ${u.email}`}
                    >
                      {roleOptions.map((r) => (
                        <option key={r} value={r}>
                          {tRole(r)}
                        </option>
                      ))}
                      {isProtected && (
                        <option value="superadmin">{tRole("superadmin")}</option>
                      )}
                    </select>

                    {isProtected ? null : banningThis ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                          placeholder={t("users.banReasonPlaceholder")}
                          maxLength={500}
                          aria-label={t("users.banReasonLabel")}
                          className="input-core829 w-56"
                        />
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void runBan(u._id, true)}
                          className="inline-flex min-h-10 items-center gap-2 bg-accent px-4 text-sm font-medium text-white transition-colors duration-300 hover:bg-foreground disabled:opacity-60"
                        >
                          {busy && (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          )}
                          {t("users.confirmBan")}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            setBanTarget(null);
                            setBanReason("");
                          }}
                          className="link-ghost text-sm"
                        >
                          {t("users.cancel")}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setBanTarget(u._id)}
                        className={`inline-flex min-h-10 items-center gap-2 border px-4 text-sm font-medium transition-colors duration-300 disabled:opacity-60 ${
                          banned
                            ? "border-foreground text-foreground hover:bg-foreground hover:text-white"
                            : "border-accent text-accent hover:bg-accent hover:text-white"
                        }`}
                      >
                        <Ban className="h-4 w-4" aria-hidden />
                        {banned ? t("users.unban") : t("users.ban")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <LogsSection logs={logs} t={t} />

      {msg && (
        <p
          role={msg.kind === "err" ? "alert" : "status"}
          className={`flex items-center gap-2 text-sm ${
            msg.kind === "err" ? "text-accent" : "text-foreground"
          }`}
        >
          {msg.kind === "err" ? (
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" aria-hidden />
          )}
          {msg.text}
        </p>
      )}
    </div>
  );
}

function StatsSection({
  stats,
  t,
}: {
  stats: ReturnType<typeof useQuery<typeof api.admin.getPlatformStats>>;
  t: (key: string) => string;
}) {
  if (!stats) {
    return (
      <p className="text-sm text-foreground-muted">
        <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-accent" aria-hidden />
        {t("stats.loading")}
      </p>
    );
  }

  const items: Array<{ label: string; value: string }> = [
    { label: t("stats.totalUsers"), value: String(stats.totalUsers) },
    { label: t("stats.verifiedUsers"), value: String(stats.verifiedUsers) },
    { label: t("stats.bannedUsers"), value: String(stats.bannedUsers) },
    { label: t("stats.newUsers30d"), value: String(stats.newUsers30d) },
    { label: t("stats.totalQuotes"), value: String(stats.totalQuotes) },
    { label: t("stats.quotes30d"), value: String(stats.quotes30d) },
    { label: t("stats.publicQuotes"), value: String(stats.publicQuotes) },
    { label: t("stats.clientAreaQuotes"), value: String(stats.clientAreaQuotes) },
    {
      label: t("stats.avgCompletionDays"),
      value:
        stats.avgCompletionDays !== null
          ? `${stats.avgCompletionDays.toFixed(1)} ${t("stats.days")}`
          : "—",
    },
    {
      label: t("stats.avgFirstResponseHours"),
      value:
        stats.avgFirstResponseHours !== null
          ? `${stats.avgFirstResponseHours.toFixed(1)} ${t("stats.hours")}`
          : "—",
    },
  ];

  return (
    <section>
      <h3 className="text-base font-semibold">{t("stats.title")}</h3>
      <dl className="mt-4 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="bg-surface p-4">
            <dt className="tech-label">{item.label}</dt>
            <dd className="mt-1 text-2xl font-semibold text-foreground">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function LogsSection({
  logs,
  t,
}: {
  logs: ReturnType<typeof useQuery<typeof api.admin.listAdminLogs>>;
  t: (key: string) => string;
}) {
  const actionLabel = (action: string) => {
    const map: Record<string, string> = {
      "role.update": "roleUpdate",
      "user.ban": "userBan",
      "user.unban": "userUnban",
      "quote.status": "quoteStatus",
      "quote.assign": "quoteAssign",
      "quote.reply": "quoteReply",
    };
    const key = map[action];
    return key ? t(`logActions.${key}`) : action;
  };

  return (
    <section>
      <h3 className="text-base font-semibold">{t("logs.title")}</h3>
      {!logs ? (
        <p className="mt-4 text-sm text-foreground-muted">
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-accent" aria-hidden />
          {t("logs.loading")}
        </p>
      ) : logs.length === 0 ? (
        <p className="mt-4 border border-border p-6 text-sm text-foreground-muted">
          {t("logs.empty")}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border border border-border">
          {logs.map((log) => (
            <li key={log._id} className="flex flex-wrap items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {actionLabel(log.action)}
                  {log.details && (
                    <span className="ml-2 font-normal text-foreground-muted">
                      {log.details}
                    </span>
                  )}
                </p>
                <p className="mt-1 truncate text-xs text-foreground-muted">
                  {log.actorName || log.actorEmail || "—"}
                </p>
              </div>
              <p className="shrink-0 text-xs text-foreground-muted">
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
