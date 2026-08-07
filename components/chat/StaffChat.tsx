"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Send, Loader2, ArrowLeft, MessageSquare } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

/**
 * Chat staff (partner/technical/admin/superadmin): elenco di tutte le
 * conversazioni con i clienti + thread selezionato. Lo staff può rispondere
 * a qualsiasi conversazione; le risposte notificano il cliente via email.
 */
export default function StaffChat() {
  const t = useTranslations("chat");
  const me = useQuery(api.users.getMyUser);
  const conversations = useQuery(api.chat.listConversations);
  const [selected, setSelected] = useState<Id<"conversations"> | null>(null);

  const selectedData = conversations?.find((c) => c._id === selected);

  if (selectedData) {
    return (
      <Thread
        conversationId={selectedData._id}
        userName={selectedData.userName || selectedData.userEmail}
        staffId={me?.user._id ?? null}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <section className="border border-border bg-surface">
      <div className="border-b border-border px-6 py-4">
        <h3 className="text-base font-semibold">{t("staffTitle")}</h3>
        <p className="mt-1 text-sm text-foreground-muted">{t("staffHint")}</p>
      </div>

      {!conversations ? (
        <p className="flex items-center gap-2 px-6 py-8 text-sm text-foreground-muted">
          <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden />
          {t("loading")}
        </p>
      ) : conversations.length === 0 ? (
        <p className="px-6 py-8 text-sm text-foreground-muted">{t("empty")}</p>
      ) : (
        <ul className="divide-y divide-border">
          {conversations.map((c) => (
            <li key={c._id}>
              <button
                type="button"
                onClick={() => setSelected(c._id)}
                className="flex w-full flex-wrap items-center justify-between gap-3 px-6 py-4 text-left transition-colors hover:bg-surface"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium text-foreground">
                    {c.unreadForStaff && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />
                    )}
                    <span className="truncate">
                      {c.userName || c.userEmail || t("anonymous")}
                    </span>
                  </p>
                  <p className="mt-1 truncate text-sm text-foreground-muted">
                    {c.lastMessagePreview || t("noMessages")}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-foreground-muted">
                  {new Date(c.lastMessageAt).toLocaleString()}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Thread({
  conversationId,
  userName,
  staffId,
  onBack,
}: {
  conversationId: Id<"conversations">;
  userName: string;
  staffId: Id<"users"> | null;
  onBack: () => void;
}) {
  const t = useTranslations("chat");
  const messages = useQuery(api.chat.getConversationMessages, {
    conversationId,
  });
  const sendMessage = useMutation(api.chat.sendMessage);

  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages?.length]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || busy || !staffId) return;
    setBusy(true);
    setError(false);
    try {
      await sendMessage({ body, conversationId });
      setDraft("");
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <button type="button" onClick={onBack} className="link-ghost text-sm">
          <ArrowLeft className="mr-1 inline h-4 w-4" aria-hidden />
          {t("back")}
        </button>
        <p className="truncate px-2 text-sm font-semibold text-foreground">
          <MessageSquare className="mr-2 inline h-4 w-4 text-accent" aria-hidden />
          {userName}
        </p>
        <span className="w-8" aria-hidden />
      </div>

      <div className="flex h-96 flex-col">
        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {!messages ? (
            <p className="flex items-center gap-2 text-sm text-foreground-muted">
              <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden />
              {t("loading")}
            </p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-foreground-muted">{t("empty")}</p>
          ) : (
            messages.map((m) => {
              const mine = m.senderId === staffId;
              return (
                <div
                  key={m._id}
                  className={mine ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={cn(
                      "max-w-[80%] px-4 py-3 text-sm leading-relaxed",
                      mine
                        ? "bg-foreground text-white"
                        : "border border-border bg-white text-foreground"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    <p
                      className={cn(
                        "mt-1 text-[11px]",
                        mine ? "text-white/70" : "text-foreground-muted"
                      )}
                    >
                      {new Date(m.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={(e) => void submit(e)} className="border-t border-border p-4">
          {error && (
            <p role="alert" className="mb-2 text-sm text-accent">
              {t("error")}
            </p>
          )}
          <div className="flex items-end gap-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              maxLength={3000}
              placeholder={t("placeholder")}
              className="input-core829 flex-1 resize-y"
            />
            <button
              type="submit"
              disabled={busy || !draft.trim()}
              className="inline-flex min-h-11 items-center gap-2 bg-foreground px-6 text-sm font-medium text-white transition-colors duration-300 hover:bg-accent disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Send className="h-4 w-4" aria-hidden />
              )}
              {t("send")}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
