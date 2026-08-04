"use client";

import { useRouter } from "@/i18n/navigation";
import { smoothScrollTo } from "@/lib/scrollTo";

const PENDING_HASH_KEY = "core829-pending-hash";

/**
 * Navigazione smart verso una sezione anchor (#id):
 * - se l'elemento esiste sulla pagina corrente, scroll liscio (Lenis);
 * - altrimenti memorizza l'hash pendente e naviga alla home,
 *   dove ResolvePendingHash completerà lo scroll dopo il render.
 */
export function useGoToSection() {
  const router = useRouter();

  return (hash: string) => {
    if (typeof document === "undefined") return;
    const el = document.querySelector(hash);
    if (el) {
      smoothScrollTo(hash);
      return;
    }
    // Elemento non presente su questa pagina → vai in home e scrolla.
    try {
      sessionStorage.setItem(PENDING_HASH_KEY, hash);
    } catch {
      /* storage non disponibile: nessun pending hash */
    }
    router.push("/");
  };
}
