"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { smoothScrollTo } from "@/lib/scrollTo";
import { Button } from "@/components/ui/Button";
import LanguageSwitcher from "./LanguageSwitcher";
import { SocialLinks } from "@/components/SocialIcons";

interface NavLink {
  key: "services" | "clients" | "method" | "faq" | "contact" | "blog" | "careers" | "pricing";
  href: string;
}

const LINKS: NavLink[] = [
  { key: "services", href: "#servizi" },
  { key: "clients", href: "#clienti" },
  { key: "method", href: "#metodo" },
  { key: "faq", href: "#faq" },
  { key: "contact", href: "#contatti" },
  { key: "blog", href: "/blog" },
  { key: "careers", href: "/careers" },
  { key: "pricing", href: "/prezzi" },
];

/**
 * Navbar sticky con hide-on-scroll-down / show-on-scroll-up
 * e menu full-screen su mobile con animazione staggered.
 */
export default function Navbar() {
  const t = useTranslations("nav");
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    setTimeout(() => smoothScrollTo(href), 60);
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md transition-transform duration-500",
        hidden && "-translate-y-full"
      )}
    >
      <div className="container-core829 flex h-16 items-center justify-between">
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            smoothScrollTo("#hero");
          }}
          className="flex items-center"
        >
          <img
            src="/core829-logo/829black%20trsp.png"
            alt="CORE829"
            className="h-8 w-auto"
          />
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {LINKS.map((link) => (
            <a
              key={link.key}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                smoothScrollTo(link.href);
              }}
              className="link-ghost text-sm"
            >
              {t(link.key)}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher />
          <Button href="#contatti" variant="primary" className="px-5">
            {t("cta")}
          </Button>
        </div>

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

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 top-16 z-40 flex flex-col bg-background lg:hidden"
          >
            <nav className="flex flex-1 flex-col justify-center gap-2 px-8">
              {LINKS.map((link, i) => (
                <motion.a
                  key={link.key}
                  href={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: 0.06 * i, duration: 0.35 }}
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(link.href);
                  }}
                  className="border-b border-border py-5 text-3xl font-semibold tracking-tight text-foreground"
                >
                  <span className="mr-3 font-mono text-sm text-accent">
                    0{i + 1}
                  </span>
                  {t(link.key)}
                </motion.a>
              ))}
            </nav>
            <div className="px-8 pb-12">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-8"
              >
                <Button
                  href="#contatti"
                  variant="primary"
                  className="w-full"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("cta")}
                </Button>
                <div className="flex flex-wrap gap-3 border-t border-border pt-8">
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
