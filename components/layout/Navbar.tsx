"use client";

import { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
 * Desktop: dropdown "Servizi" (8 pagine) + dropdown "Informazioni"
 *          (Blog, Lavora con noi, Prezzi). Mobile: full-screen overlay
 *          con sottomenus espandibili.
 */
export default function Navbar() {
  const t = useTranslations("nav");
  const tServices = useTranslations("solution.services");
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const goToSection = useGoToSection();
  const router = useRouter();

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 160 && y > lastY) setHidden(true);
      else setHidden(false);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const goTo = (href: string) => {
    setMenuOpen(false);
    if (href.startsWith("#")) {
      setTimeout(() => goToSection(href), 60);
      return;
    }
    router.push(href);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md transition-transform duration-500",
        hidden && "-translate-y-full"
      )}
    >
      <div className="container-core829 flex h-16 items-center justify-between">
        {/* Logo → home */}
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center"
          aria-label="CORE829"
        >
          <img
            src="/core829-logo/829black%20trsp.webp"
            alt="CORE829"
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          <DesktopDropdown
            label={t("services")}
            href="/servizi"
            items={SERVICES_META.map((s, i) => ({
              key: s.key,
              label: tServices(`${i}.title`),
              href: `/servizi/${s.key}`,
            }))}
          />

          <DesktopDropdown
            label={t("informazioni")}
            items={[
              { key: "blog", label: t("blog"), href: "/blog" },
              { key: "careers", label: t("careers"), href: "/careers" },
              { key: "pricing", label: t("pricing"), href: "/prezzi" },
            ]}
          />

          <NavLink href="#contatti">{t("contact")}</NavLink>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          <Button href="#contatti" variant="primary" className="px-5">
            {t("cta")}
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-1 lg:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Menu"
            className="flex min-h-11 min-w-11 items-center justify-center text-foreground"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 top-16 z-40 flex flex-col bg-background lg:hidden"
          >
            <MobileNav
              nav={[
                {
                  key: "services",
                  label: t("services"),
                  children: SERVICES_META.map((s, i) => ({
                    key: s.key,
                    label: tServices(`${i}.title`),
                    href: `/servizi/${s.key}`,
                  })),
                },{
                  key: "informazioni",
                  label: t("informazioni"),
                  children: [
                    { key: "blog", label: t("blog"), href: "/blog" },
                    { key: "careers", label: t("careers"), href: "/careers" },
                    { key: "pricing", label: t("pricing"), href: "/prezzi" },
                  ],
                },
                { key: "contact", label: t("contact"), href: "#contatti" },
              ]}
              onNavigate={goTo}
            />
            <div className="px-8 pb-12">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-8 pt-8 border-t border-border"
              >
                <Button
                  href="#contatti"
                  variant="primary"
                  className="w-full"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("cta")}
                </Button>
                <div className="flex flex-wrap gap-3">
                  <SocialLinks />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const goToSection = useGoToSection();
  const handleClick = (e: React.MouseEvent) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      goToSection(href);
    }
  };
  return (
    <a
      href={href}
      onClick={handleClick}
      className="link-ghost text-sm"
    >
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

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {href ? (
        <Link
          href={href}
          onClick={() => setOpen(false)}
          className="link-ghost flex items-center gap-1 text-sm"
          aria-haspopup="menu"
        >
          {label}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="link-ghost flex items-center gap-1 text-sm"
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
        className="flex items-center justify-center p-0.5 text-foreground-muted hover:text-foreground"
      >
        <ChevronDown
          className={cn("h-3 w-3 transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id="menu"
            role="menu"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-56 rounded-lg border border-border bg-background p-2 shadow-2xl shadow-black/10"
          >
            {items.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm text-foreground-muted hover:bg-surface hover:text-foreground"
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
    <nav className="flex flex-1 flex-col gap-2 border-b border-border px-8">
      {nav.map((item) => (
        <div key={item.key} className="border-b border-border/30">
          {item.children ? (
            <>
              <button
                type="button"
                onClick={() =>
                  setOpenSub(openSub === item.key ? null : item.key)
                }
                className="flex w-full items-center justify-between border-b border-border/30 py-5 text-2xl font-semibold tracking-tight text-foreground"
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
                    className="overflow-hidden"
                  >
                    {item.children.map((child) => (
                      <a
                        key={child.key}
                        href={child.href!}
                        onClick={(e) => {
                          e.preventDefault();
                          onNavigate(child.href!);
                        }}
                        className="block border-t border-border/30 py-4 text-xl font-medium text-foreground-muted hover:text-foreground"
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
              className="block border-b border-border/30 py-5 text-2xl font-semibold tracking-tight text-foreground hover:text-accent"
            >
              {item.label}
            </a>
          )}
        </div>
      ))}
    </nav>
  );
}
