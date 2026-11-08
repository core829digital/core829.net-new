"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

/** Avviso scelto nel backoffice: pillola in vetro sotto la barra di navigazione. Si puo' chiudere (per la sessione). */
export default function AnnouncementPill({ text, href, cta }: { text: string; href: string; cta: string }) {
  const storageKey = `core829-announcement:${text}`;
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      setHidden(window.sessionStorage.getItem(storageKey) === "1");
    } catch {
      setHidden(false);
    }
  }, [storageKey]);

  if (hidden) return null;
  const external = /^https:\/\//.test(href);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(max(0.75rem,env(safe-area-inset-top))+4.5rem)] z-40 flex justify-center px-3">
      <div role="status" className="glass-bar pointer-events-auto flex max-w-xl items-center gap-2 rounded-full py-1.5 pl-4 pr-1.5 text-xs sm:text-sm">
        <span className="min-w-0 flex-1">{text}</span>
        {href && cta ? (
          <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="shrink-0 rounded-full px-3 py-1 font-medium text-accent underline-offset-4 hover:underline">
            {cta}
          </a>
        ) : null}
        <button
          type="button"
          aria-label="Chiudi l'avviso"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-foreground/[0.06]"
          onClick={() => {
            try {
              window.sessionStorage.setItem(storageKey, "1");
            } catch {
              /* archivio bloccato: si chiude solo per ora */
            }
            setHidden(true);
          }}
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>
    </div>
  );
}
