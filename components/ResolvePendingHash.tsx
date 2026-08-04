"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { smoothScrollTo } from "@/lib/scrollTo";

const PENDING_HASH_KEY = "core829-pending-hash";

/**
 * Completa la navigazione verso un anchor richiesto da un'altra pagina:
 * quando arriviamo in home e c'è un hash pendente, lo scrolla dopo il render.
 */
export default function ResolvePendingHash() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    let pending: string | null = null;
    try {
      pending = sessionStorage.getItem(PENDING_HASH_KEY);
      if (pending) sessionStorage.removeItem(PENDING_HASH_KEY);
    } catch {
      /* storage non disponibile */
    }

    if (!pending) return;

    const t = window.setTimeout(() => {
      smoothScrollTo(pending as string);
    }, 120);

    return () => window.clearTimeout(t);
  }, [pathname]);

  return null;
}
