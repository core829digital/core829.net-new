"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useMessages, useTranslations } from "next-intl";
import { ArrowUpRight, X } from "lucide-react";
import { DepthItem, DepthSlide, radial } from "@/components/tunnel/DepthStage";
import { SlideHeading, slideCard } from "@/components/tunnel/parts";
import Badge from "@/components/ui/Badge";
import ClientScreenshot from "@/components/ui/ClientScreenshot";
import ProjectMockup from "@/components/ui/ProjectMockup";
import { buttonClasses } from "@/components/ui/Button";
import {
  CLIENTS_META,
  CLIENT_LOGOS,
  CLIENT_LOGO_COLOR,
  CLIENT_SCREENSHOTS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  domain: string;
  sector: string;
  what: string;
  stack: string;
  details: string[];
  tags: string[];
  mockup: "dashboard" | "3d" | "crm" | "fashion" | "auction";
}

/**
 * Case study: nel tunnel le card mostrano solo anteprima e nome (poche parole);
 * la storia completa (problema, soluzione, dettagli, stack, link) si apre in
 * un dialog accessibile.
 */
export default function CasesSlide({ index }: { index?: number }) {
  const t = useTranslations("caseStudies");
  const messages = useMessages();
  const projects = (messages.caseStudies as unknown as { projects: Project[] }).projects;
  const [openId, setOpenId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const close = useCallback(() => setOpenId(null), []);
  const current = projects.find((p) => p.id === openId) ?? null;

  return (
    <DepthSlide index={index} id="clienti">
      <SlideHeading kicker={t("kicker")} title={t("title")} />
      <ul className="grid w-full max-w-6xl grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 lg:gap-5">
        {projects.map((p, i) => {
          const meta = CLIENTS_META.find((c) => c.key === p.id);
          const shot = CLIENT_SCREENSHOTS[p.domain]?.[0];
          return (
            <DepthItem
              as="li"
              key={p.id}
              dir={radial(i, projects.length, 3)}
              delay={i % 3}
              rotate={(i % 2 ? 1 : -1) * 4}
            >
              <button
                type="button"
                id={meta?.anchorId}
                aria-haspopup="dialog"
                onClick={() => setOpenId(p.id)}
                className={cn(slideCard, "group block w-full overflow-hidden text-left")}
              >
                <span className="relative block aspect-[2/1] overflow-hidden bg-surface">
                  {shot ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={shot}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="h-full w-full object-cover object-top transition-transform duration-700 ease-out-expo group-hover:scale-105"
                    />
                  ) : (
                    <ProjectMockup variant={p.mockup} />
                  )}
                </span>
                <span className="flex items-center justify-between gap-2 p-2.5 sm:p-4">
                  <span className="min-w-0">
                    <span className="block truncate font-display text-[0.8rem] leading-tight tracking-tight sm:text-base">
                      {p.name}
                    </span>
                    <span className="mt-0.5 hidden truncate font-mono text-[10px] uppercase tracking-[0.16em] text-foreground-muted sm:block">
                      {p.domain}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-foreground-muted transition-all duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                    aria-hidden
                  />
                </span>
              </button>
            </DepthItem>
          );
        })}
      </ul>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {current && (
              <CaseDialog key={current.id} project={current} onClose={close} />
            )}
          </AnimatePresence>,
          document.body
        )}
    </DepthSlide>
  );
}

function CaseDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const t = useTranslations("caseStudies");
  const meta = CLIENTS_META.find((c) => c.key === project.id);
  const logo = CLIENT_LOGOS[project.id];
  const shots = CLIENT_SCREENSHOTS[project.domain];
  const boxRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    window.__lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !boxRef.current) return;
      const f = Array.from(
        boxRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);
      if (f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.__lenis?.start();
      document.body.style.overflow = prevOverflow;
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/70 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-label={project.name}
        data-lenis-prevent
        className="scroll-core829 relative max-h-[92svh] w-full max-w-6xl overflow-y-auto bg-background text-foreground shadow-lift sm:max-h-[88svh]"
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center bg-background/90 text-foreground backdrop-blur transition-colors hover:bg-accent hover:text-white"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>

        <div className="grid gap-6 p-5 pt-14 sm:gap-8 sm:p-8 sm:pt-8 lg:grid-cols-2 lg:gap-12 lg:p-12">
          <div className="min-w-0 self-start">
            {shots ? (
              <ClientScreenshot srcs={shots} alt={`${project.name} — ${project.domain}`} domain={project.domain} />
            ) : (
              <ProjectMockup variant={project.mockup} />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logo}
                  alt={project.name}
                  className={cn("h-8 w-auto object-contain", CLIENT_LOGO_COLOR.has(project.id) && "grayscale")}
                />
              ) : (
                <h2 className="font-display text-2xl tracking-tight">{project.name}</h2>
              )}
              <p className="tech-label">{project.domain}</p>
            </div>
            <p className="mt-2 text-sm text-foreground-muted">{project.sector}</p>

            <p className="mt-5 text-base leading-relaxed sm:mt-6 sm:text-lg">{project.what}</p>

            <p className="mt-5 font-mono text-xs uppercase tracking-[0.2em] text-foreground-muted">
              {t("stackLabel")}
              <span className="ml-3 normal-case tracking-normal text-foreground">{project.stack}</span>
            </p>

            <ul className="mt-5 space-y-2.5">
              {project.details.map((d, j) => (
                <li key={j} className="flex items-start gap-3 text-sm text-foreground-muted">
                  <span className="mt-2 h-px w-6 shrink-0 bg-accent" aria-hidden />
                  {d}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, j) => (
                  <Badge key={j} tone="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <a
                href={meta?.url ?? `https://${project.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonClasses("secondary"), "sm:ml-auto")}
              >
                {t("viewSite")}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
