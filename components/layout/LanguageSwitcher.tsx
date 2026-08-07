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
        className="neon-frame flex min-h-11 items-center gap-2 px-3 text-sm text-foreground-muted transition-colors hover:text-foreground"
      >
        <Globe className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">
          {localeNames[currentLocale as Locale] ?? currentLocale}
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 max-h-[60vh] w-56 overflow-y-auto border border-border bg-background py-2 shadow-2xl"
          style={{ backgroundColor: "var(--color-background)" }}
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
                "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-surface",
                locale === currentLocale
                  ? "text-accent"
                  : "text-foreground"
              )}
            >
              {localeNames[locale]}
              <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
                {locale}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
