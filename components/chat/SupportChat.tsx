"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Send, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Chat col supporto CORE829 (lato cliente).
 * Mostra la conversazione dell'utente autenticato con lo staff in tempo
 * reale (query reattiva di Convex) e permette di inviare messaggi.
 */
export default function SupportChat() {
  const t = useTranslations("chat");
  const me = useQuery(api.users.getMyUser);
  const conversation = useQuery(api.chat.getMyConversation);
  const sendMessage = useMutation(api.chat.sendMessage);

  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const userId = me?.user._id;

  // Auto-scroll in fondo alla chat quando arrivano nuovi messaggi.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conversation?.messages?.length]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || busy || !userId) return;
    setBusy(true);
    setError(false);
    try {
      await sendMessage({ body });
      setDraft("");
      inputRef.current?.focus();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="border border-border bg-surface">
      <div className="border-b border-border px-6 py-4">
        <h3 className="text-base font-semibold">{t("title")}</h3>
        <p className="mt-1 text-sm text-foreground-muted">{t("hint")}</p>
      </div>

      {conversation === undefined || conversation === null ? (
        <p className="flex items-center gap-2 px-6 py-8 text-sm text-foreground-muted">
          <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden />
          {t("loading")}
        </p>
      ) : (
        <div className="flex h-96 flex-col">
          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
            {conversation.messages.length === 0 ? (
              <p className="text-sm text-foreground-muted">{t("empty")}</p>
            ) : (
              conversation.messages.map((m) => {
                const mine = m.senderId === userId;
                return (
                  <div
                    key={m._id}
                    className={mine ? "flex justify-end" : "flex justify-start"}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                        mine
                          ? "bg-foreground text-white"
                          : "border border-border bg-white text-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <p
                        className={`mt-1 text-[11px] ${
                          mine ? "text-white/70" : "text-foreground-muted"
                        }`}
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
                ref={inputRef}
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
      )}
    </section>
  );
}
