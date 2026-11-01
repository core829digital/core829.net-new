"use client";

import { Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { buttonClasses } from "@/components/ui/buttonStyles";
import { setSimpleMode, useSimpleMode } from "@/lib/simpleMode";
import { cn } from "@/lib/utils";

/**
 * Interruttore "Versione semplice" (solo in home, dove c'è il tunnel 3D).
 * Pulsante a due stati (aria-pressed): attivo = pagina lineare senza 3D,
 * parallax, scroll inerziale e animazioni continue. Preferenza persistente.
 */
export function SimpleVersionToggle({ className }: { className?: string }) {
  const t = useTranslations("footer");
  const pathname = usePathname();
  const simple = useSimpleMode();
  if (pathname !== "/") return null;

  return (
    <button
      type="button"
      aria-pressed={simple}
      title={t("simpleHint")}
      onClick={() => setSimpleMode(!simple)}
      className={cn(buttonClasses(simple ? "primary" : "secondary", "gap-2 text-xs"), className)}
    >
      <Layers className="h-4 w-4" aria-hidden />
      {t("simpleVersion")}
    </button>
  );
}

/**
 * Primo elemento raggiungibile con Tab: visibile solo quando riceve il focus.
 * Permette a chi usa tastiera o screen reader di saltare subito al contenuto
 * lineare, senza attraversare il tunnel.
 */
export function SimpleVersionSkipLink() {
  const t = useTranslations("footer");
  const pathname = usePathname();
  const simple = useSimpleMode();
  if (pathname !== "/" || simple) return null;

  return (
    <button
      type="button"
      onClick={() => setSimpleMode(true)}
      className={cn(
        buttonClasses("primary"),
        "sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[95]"
      )}
    >
      {t("simpleVersion")}
      <span className="sr-only">. {t("simpleHint")}</span>
    </button>
  );
}
