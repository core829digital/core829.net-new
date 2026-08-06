"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Link } from "@/i18n/navigation";
import type { Doc, Id } from "@/convex/_generated/dataModel";

const INTERNAL_ROLES = ["admin", "partner", "technical"] as const;
const STATUSES = [
  "new",
  "in_review",
  "quoted",
  "accepted",
  "declined",
  "completed",
] as const;
type QuoteStatus = (typeof STATUSES)[number];

/**
 * Area riservata: gestione preventivi per admin / partner / technical.
 * - Filtro per stato + lista preventivi
 * - Dettaglio con cambio stato, assegnazione (admin/technical) e risposta
 *   via email al richiedente
 * - Gestione ruoli utente (solo admin)
 */
export default function InternalArea() {
  const t = useTranslations("internalArea");
  const me = useQuery(api.users.getMyUser);

  const isInternal = useMemo(
    () =>
      !!me &&
      INTERNAL_ROLES.includes((me.user.role ?? "") as (typeof INTERNAL_ROLES)[number]),
    [me]
  );

  if (!me) {
    return (
      <div className="mx-auto max-w-md">
        <ShieldCheck className="h-8 w-8 text-accent" aria-hidden />
        <h2 className="mt-4 text-section-title">{t("signedOutTitle")}</h2>
        <p className="mt-4 text-foreground-muted">{t("signedOutHint")}</p>
        <Link
          href="/area-clienti"
          className="mt-6 inline-flex min-h-11 items-center gap-2 bg-foreground px-8 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent"
        >
          {t("goToClientArea")}
        </Link>
      </div>
    );
  }

  if (!isInternal) {
    return (
      <div className="mx-auto max-w-md">
        <AlertCircle className="h-8 w-8 text-accent" aria-hidden />
        <h2 className="mt-4 text-section-title">{t("deniedTitle")}</h2>
        <p className="mt-4 text-foreground-muted">{t("deniedHint")}</p>
        <Link
          href="/area-clienti"
          className="mt-6 inline-flex min-h-11 items-center gap-2 bg-foreground px-8 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent"
        >
          {t("goToClientArea")}
        </Link>
      </div>
    );
  }

  return <QuotesPanel userRole={me.user.role ?? "client"} />;
}

// ---------------------------------------------------------------- Quotes

function QuotesPanel({ userRole }: { userRole: string }) {
  const t = useTranslations("internalArea");
  const tStatus = useTranslations("quoteStatus");
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "all">("new");
  const [selectedId, setSelectedId] = useState<Id<"quoteRequests"> | null>(null);

  const quotes = useQuery(api.quotes.listAllQuotes, {
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  const selected = useMemo(
    () => quotes?.find((q) => q._id === selectedId) ?? null,
    [quotes, selectedId]
  );

  if (selected) {
    return (
      <QuoteDetail
        quote={selected}
        userRole={userRole}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="kicker">{t("kicker")}</p>
        <h2 className="mt-2 text-section-title">{t("title")}</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterButton
          active={statusFilter === "all"}
          label={t("filterAll")}
          onClick={() => setStatusFilter("all")}
        />
        {STATUSES.map((s) => (
          <FilterButton
            key={s}
            active={statusFilter === s}
            label={tStatus(s)}
            onClick={() => setStatusFilter(s)}
          />
        ))}
      </div>

      {userRole === "admin" && <UserManagement />}

      {!quotes ? (
        <p className="text-sm text-foreground-muted">
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-accent" aria-hidden />
          {t("loading")}
        </p>
      ) : quotes.length === 0 ? (
        <p className="border border-border p-6 text-sm text-foreground-muted">
          {t("empty")}
        </p>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {quotes.map((q) => (
            <li key={q._id}>
              <button
                type="button"
                onClick={() => setSelectedId(q._id)}
                className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left transition-colors hover:bg-surface"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{q.name}</p>
                  <p className="mt-1 truncate text-sm text-foreground-muted">
                    {q.message}
                  </p>
                  <p className="mt-2 text-xs text-foreground-muted">
                    {new Date(q.createdAt).toLocaleString()}
                    {" · "}
                    {q.email}
                    {q.source === "client_area" ? ` · ${t("sourceClient")}` : ""}
                  </p>
                </div>
                <span className="shrink-0 border border-border px-3 py-1 text-xs uppercase tracking-widest text-foreground-muted">
                  {tStatus(q.status)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selectedId && !selected && (
        <p className="text-sm text-foreground-muted">{t("loading")}</p>
      )}
    </div>
  );
}

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`border px-4 py-2 text-sm transition-colors duration-200 ${
        active
          ? "border-accent bg-accent text-white"
          : "border-border text-foreground-muted hover:border-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------- Detail

function QuoteDetail({
  quote,
  userRole,
  onBack,
}: {
  quote: Doc<"quoteRequests">;
  userRole: string;
  onBack: () => void;
}) {
  const t = useTranslations("internalArea");
  const tStatus = useTranslations("quoteStatus");
  const updateStatus = useMutation(api.quotes.updateQuoteStatus);
  const replyToQuote = useMutation(api.quotes.replyToQuote);
  const assignQuote = useMutation(api.quotes.assignQuote);
  const users = useQuery(api.users.listInternalUsers);

  const [newStatus, setNewStatus] = useState<QuoteStatus>(quote.status);
  const [note, setNote] = useState(quote.internalNote ?? "");
  const [reply, setReply] = useState("");
  const [feedback, setFeedback] = useState<{
    kind: "ok" | "err";
    msg: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  const canAssign = userRole === "admin" || userRole === "technical";
  const internalUsers = useMemo(
    () =>
      (users ?? []).filter((u) =>
        INTERNAL_ROLES.includes((u.role ?? "") as (typeof INTERNAL_ROLES)[number])
      ),
    [users]
  );

  const run = async (fn: () => Promise<unknown>, okMsg: string) => {
    setBusy(true);
    setFeedback(null);
    try {
      await fn();
      setFeedback({ kind: "ok", msg: okMsg });
    } catch {
      setFeedback({ kind: "err", msg: t("error") });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={onBack}
        className="link-ghost text-sm"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t("back")}
      </button>

      <div className="border border-border p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="tech-label">{t("request")}</p>
            <h2 className="mt-2 text-section-title">{quote.name}</h2>
          </div>
          <span className="border border-accent px-3 py-1 text-xs uppercase tracking-widest text-accent">
            {tStatus(quote.status)}
          </span>
        </div>

        <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="tech-label">{t("fieldEmail")}</dt>
            <dd className="mt-1 text-foreground">{quote.email}</dd>
          </div>
          <div>
            <dt className="tech-label">{t("fieldCompany")}</dt>
            <dd className="mt-1 text-foreground">{quote.company ?? "—"}</dd>
          </div>
          <div>
            <dt className="tech-label">{t("fieldServices")}</dt>
            <dd className="mt-1 text-foreground">
              {quote.serviceInterest.length
                ? quote.serviceInterest.join(", ")
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="tech-label">{t("fieldBudget")}</dt>
            <dd className="mt-1 text-foreground">{quote.budgetRange ?? "—"}</dd>
          </div>
          <div>
            <dt className="tech-label">{t("fieldSource")}</dt>
            <dd className="mt-1 text-foreground">
              {quote.source === "client_area"
                ? t("sourceClient")
                : t("sourcePublic")}
            </dd>
          </div>
          <div>
            <dt className="tech-label">{t("fieldDate")}</dt>
            <dd className="mt-1 text-foreground">
              {new Date(quote.createdAt).toLocaleString()}
            </dd>
          </div>
        </dl>

        <div className="mt-6">
          <p className="tech-label">{t("fieldMessage")}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {quote.message}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="border border-border p-6">
          <h3 className="text-base font-semibold">{t("statusSection")}</h3>
          <div className="mt-4">
            <label htmlFor="quote-status" className="tech-label block">
              {t("statusLabel")}
            </label>
            <select
              id="quote-status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as QuoteStatus)}
              className="input-core829 mt-2"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {tStatus(s)}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            <label htmlFor="quote-note" className="tech-label block">
              {t("noteLabel")}
            </label>
            <textarea
              id="quote-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={2000}
              className="input-core829 mt-2 resize-y"
            />
          </div>

          {canAssign && (
            <div className="mt-4">
              <label htmlFor="quote-assign" className="tech-label block">
                {t("assignLabel")}
              </label>
              <select
                id="quote-assign"
                defaultValue=""
                onChange={(e) => {
                  const target = e.target.value;
                  if (target) {
                    void run(
                      () =>
                        assignQuote({
                          quoteId: quote._id,
                          assignedTo: target as Id<"users">,
                        }),
                      t("assigned")
                    );
                  }
                }}
                className="input-core829 mt-2"
              >
                <option value="" disabled>
                  {t("assignPlaceholder")}
                </option>
                {internalUsers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name || u.email}
                  </option>
                ))}
              </select>
              {quote.assignedTo && (
                <p className="mt-2 text-xs text-foreground-muted">
                  {t("assignedTo")}{" "}
                  {internalUsers.find((u) => u._id === quote.assignedTo)?.name ??
                    quote.assignedTo}
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void run(
                () =>
                  updateStatus({
                    quoteId: quote._id,
                    status: newStatus,
                    internalNote: note || undefined,
                  }),
                t("statusSaved")
              )
            }
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 bg-foreground px-6 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {t("saveStatus")}
          </button>
        </section>

        <section className="border border-border p-6">
          <h3 className="text-base font-semibold">{t("replySection")}</h3>
          <p className="mt-1 text-sm text-foreground-muted">{t("replyHint")}</p>
          <div className="mt-4">
            <label htmlFor="quote-reply" className="tech-label block">
              {t("replyLabel")}
            </label>
            <textarea
              id="quote-reply"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={6}
              maxLength={5000}
              className="input-core829 mt-2 resize-y"
            />
          </div>
          <button
            type="button"
            disabled={busy || !reply.trim()}
            onClick={() =>
              void run(
                () =>
                  replyToQuote({
                    quoteId: quote._id,
                    reply: reply.trim(),
                    internalNote: note || undefined,
                  }),
                t("replySent")
              )
            }
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 bg-foreground px-6 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {t("sendReply")}
          </button>
        </section>
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
    </div>
  );
}

// ---------------------------------------------------------------- Users

function UserManagement() {
  const t = useTranslations("internalArea");
  const tRole = useTranslations("userRole");
  const users = useQuery(api.users.listUsers);
  const updateUserRole = useMutation(api.users.updateUserRole);
  const [msg, setMsg] = useState<string | null>(null);

  if (!users) {
    return (
      <p className="text-sm text-foreground-muted">
        <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-accent" aria-hidden />
        {t("loading")}
      </p>
    );
  }

  return (
    <section className="border border-border bg-surface p-6 md:p-8">
      <h3 className="text-base font-semibold">{t("usersSection")}</h3>
      <div className="mt-4 divide-y divide-border">
        {users.map((u) => (
          <div
            key={u._id}
            className="flex flex-wrap items-center justify-between gap-3 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {u.name || "—"}
                {!u.emailVerified && (
                  <span className="ml-2 text-xs text-accent">
                    {t("unverified")}
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-foreground-muted">{u.email}</p>
            </div>
            <select
              value={u.role}
              onChange={(e) => {
                void updateUserRole({
                  userId: u._id,
                  role: e.target.value as never,
                })
                  .then(() => setMsg(t("roleSaved")))
                  .catch(() => setMsg(t("error")));
              }}
              className="input-core829 w-auto min-w-32"
              aria-label={`Ruolo ${u.email}`}
            >
              {["client", "partner", "technical", "admin"].map((r) => (
                <option key={r} value={r}>
                  {tRole(r)}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      {msg && <p className="mt-4 text-sm text-foreground">{msg}</p>}
    </section>
  );
}
