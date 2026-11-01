"use client";

import { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeNames, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Selettore di lingua: dropdown con tutte le lingue disponibili.
 * Mantiene la route corrente cambiando solo il prefisso di locale.
 */
export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const currentLocale = (params.locale as string) ?? "it";

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-11 items-center gap-2 rounded-full px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground-muted transition-colors hover:bg-foreground/5 hover:text-accent active:bg-foreground/10"
      >
        <Globe className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">
          {localeNames[currentLocale as Locale] ?? currentLocale}
        </span>
      </button>

      {open && (
        <div
          className="scroll-core829 glass-panel absolute right-0 top-full z-50 mt-3 max-h-[60dvh] w-60 rounded-3xl p-2"
          style={{ touchAction: "pan-y" }}
        >
          {locales.map((locale) => (
            <button
              key={locale}
              type="button"
              role="option"
              aria-selected={locale === currentLocale}
              onClick={() => {
                router.replace(pathname, { locale });
                setOpen(false);
              }}
              className={cn(
                "flex min-h-11 w-full items-center justify-between rounded-2xl px-4 text-left text-sm transition-colors hover:bg-foreground/5 active:bg-foreground/10",
                locale === currentLocale
                  ? "text-accent"
                  : "text-foreground"
              )}
            >
              {localeNames[locale]}
              <span className="font-mono text-[11px] uppercase tracking-widest text-foreground-muted">
                {locale}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
