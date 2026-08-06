"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ArrowRight,
  Building2,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth, useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { Link } from "@/i18n/navigation";
import { isInternalRole } from "@/lib/roles";
import QuoteForm from "@/components/forms/QuoteForm";
import { cn } from "@/lib/utils";

type Step =
  | "signIn"
  | "signUp"
  | "verify"
  | "forgot"
  | "reset";

/**
 * Client area: registrazione / accesso con verifica email OTP,
 * recupero password e dashboard con i propri preventivi.
 */
export default function ClientArea() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" aria-hidden />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthFlow />;
  }

  return <Dashboard />;
}

// ---------------------------------------------------------------- Auth flow

function AuthFlow() {
  const t = useTranslations("clientArea");
  const [step, setStep] = useState<Step>("signIn");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { signIn } = useAuthActions();

  const run = async (params: Record<string, string>) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const ok = await signIn("password", params);
      if (params.flow === "signUp" && !ok) {
        setEmail(params.email);
        setNotice(t("otpSent"));
        setStep("verify");
      } else if (params.flow === "reset") {
        setEmail(params.email);
        setNotice(t("resetSent"));
        setStep("reset");
      }
      // Negli altri casi: se ok, isAuthenticated diventa true e la dashboard
      // sostituisce questo componente.
    } catch {
      setError(t("genericError"));
    } finally {
      setBusy(false);
    }
  };

  if (step === "verify") {
    return (
      <AuthShell title={t("verifyTitle")}>
        <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
          {t("verifyHint", { email })}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void run({
              email,
              code: String(f.get("code") ?? "").trim(),
              flow: "email-verification",
            });
          }}
          className="mt-6 space-y-6"
        >
          <div>
            <label htmlFor="ca-code" className="tech-label block">
              {t("code")} *
            </label>
            <input
              id="ca-code"
              name="code"
              type="text"
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              className="input-core829 mt-2"
            />
          </div>
          <Feedback error={error} notice={notice} />
          <SubmitButton busy={busy} label={t("verifyCta")} />
          <button
            type="button"
            onClick={() => setStep("signIn")}
            className="link-ghost text-sm"
          >
            {t("cancel")}
          </button>
        </form>
      </AuthShell>
    );
  }

  if (step === "forgot") {
    return (
      <AuthShell title={t("forgotTitle")}>
        <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
          {t("forgotHint")}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void run({
              email: String(f.get("email") ?? "").trim(),
              flow: "reset",
            });
          }}
          className="mt-6 space-y-6"
        >
          <div>
            <label htmlFor="ca-reset-email" className="tech-label block">
              {t("email")} *
            </label>
            <input
              id="ca-reset-email"
              name="email"
              type="email"
              required
              maxLength={254}
              className="input-core829 mt-2"
            />
          </div>
          <Feedback error={error} notice={notice} />
          <SubmitButton busy={busy} label={t("resetCta")} />
          <button
            type="button"
            onClick={() => setStep("signIn")}
            className="link-ghost text-sm"
          >
            {t("cancel")}
          </button>
        </form>
      </AuthShell>
    );
  }

  if (step === "reset") {
    return (
      <AuthShell title={t("resetTitle")}>
        <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
          {t("resetHint", { email })}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void run({
              email,
              code: String(f.get("code") ?? "").trim(),
              newPassword: String(f.get("newPassword") ?? ""),
              flow: "reset-verification",
            });
          }}
          className="mt-6 space-y-6"
        >
          <div>
            <label htmlFor="ca-reset-code" className="tech-label block">
              {t("code")} *
            </label>
            <input
              id="ca-reset-code"
              name="code"
              type="text"
              required
              inputMode="numeric"
              maxLength={8}
              className="input-core829 mt-2"
            />
          </div>
          <div>
            <label htmlFor="ca-new-password" className="tech-label block">
              {t("newPassword")} *
            </label>
            <input
              id="ca-new-password"
              name="newPassword"
              type="password"
              required
              minLength={10}
              autoComplete="new-password"
              className="input-core829 mt-2"
            />
            <p className="mt-2 text-xs text-foreground-muted">
              {t("passwordHint")}
            </p>
          </div>
          <Feedback error={error} notice={notice} />
          <SubmitButton busy={busy} label={t("changePassword")} />
          <button
            type="button"
            onClick={() => setStep("signIn")}
            className="link-ghost text-sm"
          >
            {t("cancel")}
          </button>
        </form>
      </AuthShell>
    );
  }

  const isSignUp = step === "signUp";

  return (
    <AuthShell title={t(`${step}Title`)}>
      <div className="mt-3 flex gap-4">
        <button
          type="button"
          onClick={() => {
            setStep("signIn");
            setError(null);
          }}
          className={`pb-2 text-sm font-medium transition-colors ${
            !isSignUp
              ? "border-b-2 border-accent text-foreground"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          {t("tabSignIn")}
        </button>
        <button
          type="button"
          onClick={() => {
            setStep("signUp");
            setError(null);
          }}
          className={`pb-2 text-sm font-medium transition-colors ${
            isSignUp
              ? "border-b-2 border-accent text-foreground"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          {t("tabSignUp")}
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          if (isSignUp) {
            void run({
              name: String(f.get("name") ?? "").trim(),
              email: String(f.get("email") ?? "").trim(),
              password: String(f.get("password") ?? ""),
              flow: "signUp",
            });
          } else {
            void run({
              email: String(f.get("email") ?? "").trim(),
              password: String(f.get("password") ?? ""),
              flow: "signIn",
            });
          }
        }}
        className="mt-6 space-y-6"
      >
        {isSignUp && (
          <div>
            <label htmlFor="ca-name" className="tech-label block">
              {t("name")} *
            </label>
            <input
              id="ca-name"
              name="name"
              type="text"
              required
              maxLength={100}
              autoComplete="name"
              className="input-core829 mt-2"
            />
          </div>
        )}
        <div>
          <label htmlFor="ca-email" className="tech-label block">
            {t("email")} *
          </label>
          <input
            id="ca-email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            className="input-core829 mt-2"
          />
        </div>
        <div>
          <label htmlFor="ca-password" className="tech-label block">
            {t("password")} *
          </label>
          <input
            id="ca-password"
            name="password"
            type="password"
            required
            minLength={isSignUp ? 10 : undefined}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            className="input-core829 mt-2"
          />
          {isSignUp && (
            <p className="mt-2 text-xs text-foreground-muted">
              {t("passwordHint")}
            </p>
          )}
        </div>

        {!isSignUp && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep("forgot")}
              className="link-ghost text-sm"
            >
              {t("forgotLink")}
            </button>
          </div>
        )}

        <Feedback error={error} notice={notice} />
        <SubmitButton busy={busy} label={t(`${step}Cta`)} />
      </form>
    </AuthShell>
  );
}

// ------------------------------------------------------------- Dashboard

function Dashboard() {
  const t = useTranslations("clientArea");
  const tStatus = useTranslations("quoteStatus");
  const { signOut } = useAuthActions();
  const me = useQuery(api.users.getMyUser);
  const quotes = useQuery(api.quotes.getMyQuotes);
  const claimAdmin = useMutation(api.users.claimAdminIfEligible);

  const [claimed, setClaimed] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!me || claimed) return;
    // Il backend decide se l'utente è idoneo (email superadmin verificata).
    void claimAdmin()
      .then(() => setClaimed(true))
      .catch(() => {});
  }, [me, claimed, claimAdmin]);

  if (!me) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" aria-hidden />
      </div>
    );
  }

  const user = me.user;
  const profile = me.profile;
  const isInternal = isInternalRole(user.role);
  const needsOnboarding = !profile?.onboardingCompleted;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="kicker">{t("dashboardKicker")}</p>
          <h2 className="mt-2 text-section-title">{t("dashboardTitle")}</h2>
          <p className="mt-2 text-sm text-foreground-muted">
            {user.name ? `${user.name} · ` : ""}
            {user.email}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isInternal && (
            <Link
              href="/area-riservata"
              className="inline-flex min-h-11 items-center gap-2 border border-foreground px-6 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-foreground hover:text-white"
            >
              {t("internalArea")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex min-h-11 items-center gap-2 border border-border px-6 text-sm font-medium text-foreground-muted transition-colors duration-300 hover:border-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            {t("signOut")}
          </button>
        </div>
      </div>

      {needsOnboarding && (
        <section className="border border-border bg-surface p-6 md:p-8">
          <div className="flex items-start gap-3">
            <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
            <div>
              <h3 className="text-lg font-semibold">{t("onboardingTitle")}</h3>
              <p className="mt-1 text-sm text-foreground-muted">
                {t("onboardingHint")}
              </p>
            </div>
          </div>
          <OnboardingForm initial={profile} />
        </section>
      )}

      <section>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-semibold">{t("myQuotes")}</h3>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex min-h-11 items-center gap-2 bg-foreground px-6 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent"
          >
            {showForm ? t("cancel") : t("newQuote")}
            <ArrowRight
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                showForm && "rotate-90"
              )}
              aria-hidden
            />
          </button>
        </div>

        {showForm && (
          <section className="mt-6 border border-border bg-surface p-6 md:p-8">
            <h4 className="text-base font-semibold">{t("newQuoteTitle")}</h4>
            <p className="mt-1 text-sm text-foreground-muted">
              {t("newQuoteHint")}
            </p>
            <div className="mt-6">
              <QuoteForm />
            </div>
          </section>
        )}

        {!quotes ? (
          <p className="mt-6 text-sm text-foreground-muted">
            <Loader2 className="mr-2 inline h-4 w-4 animate-spin text-accent" aria-hidden />
            {t("loading")}
          </p>
        ) : quotes.length === 0 ? (
          <div className="mt-6 border border-border p-6">
            <p className="text-sm text-foreground-muted">{t("noQuotes")}</p>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-border border border-border">
            {quotes.map((q) => (
              <li key={q._id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{q.name}</p>
                  <span className="border border-border px-3 py-1 text-xs uppercase tracking-widest text-foreground-muted">
                    {tStatus(q.status)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                  {q.message}
                </p>
                <p className="mt-3 text-xs text-foreground-muted">
                  {new Date(q.createdAt).toLocaleDateString()}
                  {q.serviceInterest.length > 0
                    ? ` · ${q.serviceInterest.join(", ")}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ------------------------------------------------------------- Onboarding

function OnboardingForm({
  initial,
}: {
  initial?: { company?: string; vatNumber?: string; country?: string; contactPhone?: string } | null;
}) {
  const t = useTranslations("clientArea");
  const updateProfile = useMutation(api.users.updateProfile);
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setStatus("busy");
    try {
      await updateProfile({
        company: String(f.get("company") ?? "").trim() || undefined,
        vatNumber: String(f.get("vatNumber") ?? "").trim() || undefined,
        country: String(f.get("country") ?? "").trim() || undefined,
        contactPhone: String(f.get("contactPhone") ?? "").trim() || undefined,
        onboardingCompleted: true,
      });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="ob-company" className="tech-label block">
            {t("company")}
          </label>
          <input
            id="ob-company"
            name="company"
            type="text"
            maxLength={150}
            defaultValue={initial?.company ?? ""}
            className="input-core829 mt-2"
          />
        </div>
        <div>
          <label htmlFor="ob-vat" className="tech-label block">
            {t("vatNumber")}
          </label>
          <input
            id="ob-vat"
            name="vatNumber"
            type="text"
            maxLength={50}
            defaultValue={initial?.vatNumber ?? ""}
            className="input-core829 mt-2"
          />
        </div>
        <div>
          <label htmlFor="ob-country" className="tech-label block">
            {t("country")}
          </label>
          <input
            id="ob-country"
            name="country"
            type="text"
            maxLength={80}
            defaultValue={initial?.country ?? ""}
            className="input-core829 mt-2"
          />
        </div>
        <div>
          <label htmlFor="ob-phone" className="tech-label block">
            {t("contactPhone")}
          </label>
          <input
            id="ob-phone"
            name="contactPhone"
            type="tel"
            maxLength={40}
            defaultValue={initial?.contactPhone ?? ""}
            className="input-core829 mt-2"
          />
        </div>
      </div>

      {status === "done" && (
        <p role="status" className="flex items-center gap-2 text-sm text-foreground">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" aria-hidden />
          {t("saved")}
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="flex items-center gap-2 text-sm text-accent">
          <AlertCircle className="h-4 w-4" aria-hidden />
          {t("genericError")}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "busy"}
        className="inline-flex min-h-11 items-center justify-center gap-2 bg-foreground px-8 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent disabled:opacity-60"
      >
        {status === "busy" && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        )}
        {t("saveProfile")}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------- Primitives

function AuthShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md">
      <p className="kicker">CORE829</p>
      <h2 className="mt-3 text-section-title">{title}</h2>
      {children}
    </div>
  );
}

function Feedback({ error, notice }: { error: string | null; notice: string | null }) {
  if (error) {
    return (
      <p role="alert" className="flex items-center gap-2 text-sm text-accent">
        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
        {error}
      </p>
    );
  }
  if (notice) {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-foreground">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" aria-hidden />
        {notice}
      </p>
    );
  }
  return null;
}

function SubmitButton({ busy, label }: { busy: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 bg-foreground px-8 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent disabled:opacity-60"
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {label}
    </button>
  );
}
