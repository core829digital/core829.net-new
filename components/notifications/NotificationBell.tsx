"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * Campanella notifiche in-app (client/staff).
 * Mostra un badge col numero di notifiche non lette e un pannello con le
 * ultime. Il conteggio è reattivo via Convex.
 */
export default function NotificationBell() {
  const t = useTranslations("notifications");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const count = useQuery(api.notifications.unreadCount);
  const notifications = useQuery(api.notifications.listMyNotifications, {
    limit: 15,
  });
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);

  // Chiude il pannello al click fuori.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const unread = count ?? 0;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
        }}
        aria-label={t("label")}
        aria-expanded={open}
        className="relative inline-flex h-11 w-11 items-center justify-center border border-border text-foreground-muted transition-colors duration-300 hover:border-foreground hover:text-foreground"
      >
        <Bell className="h-5 w-5" aria-hidden />
        {unread > 0 && (
          <span
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center bg-accent px-1 text-[11px] font-bold text-white"
            aria-hidden
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 border border-border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">
              {t("title")}
            </p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="link-ghost text-xs"
              >
                <CheckCheck className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                {t("markAllRead")}
              </button>
            )}
          </div>

          {!notifications ? (
            <p className="flex items-center gap-2 px-4 py-6 text-sm text-foreground-muted">
              <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden />
              {t("loading")}
            </p>
          ) : notifications.length === 0 ? (
            <p className="px-4 py-6 text-sm text-foreground-muted">
              {t("empty")}
            </p>
          ) : (
            <ul className="max-h-96 divide-y divide-border overflow-y-auto">
              {notifications.map((n) => (
                <li key={n._id}>
                  {n.link ? (
                    <Link
                      href={n.link}
                      onClick={() => {
                        if (!n.read) void markRead({ notificationId: n._id });
                        setOpen(false);
                      }}
                      className={cn(
                        "block px-4 py-3 transition-colors hover:bg-surface",
                        !n.read && "bg-surface/60"
                      )}
                    >
                      <NotifBody n={n} />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!n.read) void markRead({ notificationId: n._id });
                      }}
                      className={cn(
                        "block w-full px-4 py-3 text-left transition-colors hover:bg-surface",
                        !n.read && "bg-surface/60"
                      )}
                    >
                      <NotifBody n={n} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function NotifBody({
  n,
}: {
  n: {
    _id: Id<"notifications">;
    title: string;
    body: string;
    createdAt: number;
    read: boolean;
  };
}) {
  return (
    <>
      <p className="flex items-center justify-between gap-2 text-sm font-medium text-foreground">
        {n.title}
        {!n.read && (
          <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden />
        )}
      </p>
      <p className="mt-1 line-clamp-2 text-xs text-foreground-muted">{n.body}</p>
      <p className="mt-1 text-[11px] text-foreground-muted">
        {new Date(n.createdAt).toLocaleString()}
      </p>
    </>
  );
}
