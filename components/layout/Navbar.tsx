"use client";

import { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Link, useRouter } from "@/i18n/navigation";
import { useGoToSection } from "@/lib/useGoToSection";
import { Button } from "@/components/ui/Button";
import { SERVICES_META } from "@/lib/constants";
import LanguageSwitcher from "./LanguageSwitcher";
import { SocialLinks } from "@/components/SocialIcons";

/**
 * Navbar sticky con hide-on-scroll-down / show-on-scroll-up.
 * Desktop: link "Custom Servers" a sé stante (frame nero-platino, fuori dal
 * dropdown Servizi: è un dipartimento con brand proprio) + dropdown "Servizi"
 * per le altre pagine. Mobile: full-screen overlay con sottomenu espandibili.
 */
export default function Navbar() {
  const t = useTranslations("nav");
  const tServices = useTranslations("solution.services");
  const serverIndex = SERVICES_META.findIndex((s) => s.key === "server");
  const serverMeta = SERVICES_META[serverIndex];
  const dropdownServices = SERVICES_META.map((s, i) => ({
    key: s.key,
    label: tServices(`${i}.title`),
    href: `/servizi/${s.key}`,
  })).filter((s) => s.key !== "server");
  const [menuOpen, setMenuOpen] = useState(false);
  const goToSection = useGoToSection();
  const router = useRouter();

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      window.__lenis?.stop?.();
    } else {
      document.body.style.overflow = "";
      window.__lenis?.start?.();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const goTo = (href: string) => {
    setMenuOpen(false);
    if (href.startsWith("#")) {
      setTimeout(() => goToSection(href), 60);
      return;
    }
    router.push(href);
  };

  const pillCta =
    "h-9 min-h-0 rounded-full px-5 font-mono text-[11px] uppercase tracking-[0.16em]";

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6"
      >
        {/* Capsula flottante sempre visibile: nessun contorno, solo ombra
            morbida e sfondo traslucido su layer proprio. */}
        <div className="relative flex h-12 w-full items-center justify-between gap-1 rounded-full pl-4 pr-1.5 shadow-lift xl:w-auto xl:justify-start xl:pl-2">
          <span
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full bg-background/95 backdrop-blur-md"
          />

          {/* Logo → home */}
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex shrink-0 items-center xl:px-3"
            aria-label="CORE829"
          >
            <Image
              src="/core829-logo/829black%20trsp.webp"
              alt="CORE829"
              width={120}
              height={32}
              priority
              className="h-7 w-auto"
            />
          </Link>

          {/* Navigazione desktop (≥1280) */}
          <nav className="hidden items-center xl:flex" aria-label="Main">
            {!serverMeta.hidden && (
              <NavLink href={`/servizi/${serverMeta.key}`} marker>
                {tServices(`${serverIndex}.title`)}
              </NavLink>
            )}

            <DesktopDropdown
              label={t("services")}
              href="/servizi"
              items={dropdownServices}
            />

            <NavLink href="/prezzi">{t("pricing")}</NavLink>
            <NavLink href="/careers">{t("careers")}</NavLink>
            <NavLink href="/contatti">{t("contact")}</NavLink>
          </nav>

          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <div className="hidden items-center gap-1 pl-1 xl:flex">
              <Button
                href="https://bookings.core829.net/book/intro-call"
                variant="secondary"
                className={pillCta}
              >
                {t("bookCta")}
              </Button>
              <Button
                href="mailto:sales@core829.net"
                variant="primary"
                className={pillCta}
              >
                {t("cta")}
              </Button>
            </div>

            {/* Toggle menu mobile/tablet */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label="Menu"
              className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface xl:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Menu a tutto schermo (mobile/tablet) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="scroll-core829 fixed inset-x-0 top-0 z-40 flex flex-col overflow-y-auto bg-background pb-[max(env(safe-area-inset-bottom),1.5rem)] pt-[calc(env(safe-area-inset-top)+5.5rem)] xl:hidden"
            style={{
              backgroundColor: "var(--color-background)",
              height: "var(--vvh, 100dvh)",
              touchAction: "pan-y",
            }}
          >
            <MobileNav
              nav={[
                ...(serverMeta.hidden
                  ? []
                  : [
                      {
                        key: "server",
                        label: tServices(`${serverIndex}.title`),
                        href: `/servizi/${serverMeta.key}`,
                      },
                    ]),
                {
                  key: "services",
                  label: t("services"),
                  children: dropdownServices,
                },
                { key: "pricing", label: t("pricing"), href: "/prezzi" },
                { key: "careers", label: t("careers"), href: "/careers" },
                { key: "contact", label: t("contact"), href: "/contatti" },
              ]}
              onNavigate={goTo}
            />
            <div className="px-5 pb-8 sm:px-8">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-6 pt-8 md:grid md:grid-cols-2 md:gap-4 md:space-y-0"
              >
                <Button
                  href="https://bookings.core829.net/book/intro-call"
                  variant="secondary"
                  className="w-full"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("bookCta")}
                </Button>
                <Button
                  href="mailto:sales@core829.net"
                  variant="primary"
                  className="w-full"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("cta")}
                </Button>
                <div className="flex flex-wrap gap-3 md:col-span-2">
                  <SocialLinks />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const navItemCls =
  "flex items-center gap-1.5 whitespace-nowrap px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-muted transition-colors duration-300 hover:text-accent";

function NavLink({
  href,
  children,
  marker = false,
}: {
  href: string;
  children: React.ReactNode;
  marker?: boolean;
}) {
  const goToSection = useGoToSection();
  const handleClick = (e: React.MouseEvent) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      goToSection(href);
    }
  };
  return (
    <a href={href} onClick={handleClick} className={navItemCls}>
      {marker && (
        <span aria-hidden className="h-1.5 w-1.5 shrink-0 bg-foreground" />
      )}
      {children}
    </a>
  );
}

function DesktopDropdown({
  label,
  items,
  href,
}: {
  label: string;
  items: { key: string; label: string; href: string }[];
  href?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <div className="flex items-center">
        {href ? (
          <Link
            href={href}
            onClick={() => setOpen(false)}
            className={cn(navItemCls, "pr-1")}
            aria-haspopup="menu"
          >
            {label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className={cn(navItemCls, "pr-1")}
            aria-haspopup="menu"
            aria-expanded={open}
          >
            {label}
          </button>
        )}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={`Apri menu ${label}`}
          aria-expanded={open}
          className="flex items-center justify-center px-2 py-2 text-foreground-muted hover:text-foreground"
        >
          <ChevronDown
            className={cn("h-3 w-3 transition-transform duration-200", open && "rotate-180")}
          />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            id="menu"
            role="menu"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="scroll-core829 absolute left-0 top-full mt-3 max-h-[70dvh] w-64 border border-border bg-background p-2 shadow-lift"
          >
            {items.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="block px-3 py-2.5 text-sm text-foreground-muted transition-[background-color,color,padding] duration-300 hover:bg-surface hover:pl-4 hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MobileNavItem {
  key: string;
  label: string;
  href?: string;
  children?: MobileNavItem[];
}

function MobileNav({
  nav,
  onNavigate,
}: {
  nav: MobileNavItem[];
  onNavigate: (href: string) => void;
}) {
  const [openSub, setOpenSub] = useState<string | null>(null);

  return (
    <nav className="flex flex-1 flex-col px-5 sm:px-8">
      {nav.map((item) => (
        <div key={item.key} className="border-b border-border">
          {item.children ? (
            <>
              <button
                type="button"
                onClick={() =>
                  setOpenSub(openSub === item.key ? null : item.key)
                }
                className="flex w-full items-baseline justify-between gap-4 py-4 text-left font-display text-2xl tracking-tight text-foreground transition-colors hover:text-accent sm:text-3xl"
              >
                <span>{item.label}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    openSub === item.key && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {openSub === item.key && (
                  <motion.div
                    key="submenu"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden bg-background"
                  >
                    {item.children.map((child) => (
                      <a
                        key={child.key}
                        href={child.href!}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate(child.href!);
                        }}
                        className="block border-t border-border py-3.5 pl-4 text-lg text-foreground-muted transition-colors hover:text-accent"
                      >
                        {child.label}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <a
              href={item.href!}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.href!);
              }}
              className="block py-4 font-display text-2xl tracking-tight text-foreground transition-colors hover:text-accent sm:text-3xl"
            >
              {item.label}
            </a>
          )}
        </div>
      ))}
    </nav>
  );
}
