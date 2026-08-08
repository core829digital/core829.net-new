"use client";

import { useTranslations, useMessages } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import RevealOnScroll from "@/components/animations/RevealOnScroll";
import ProjectMockup from "@/components/ui/ProjectMockup";
import ClientScreenshot from "@/components/ui/ClientScreenshot";
import Badge from "@/components/ui/Badge";
import { CLIENTS_META, CLIENT_SCREENSHOTS, CLIENT_LOGOS, CLIENT_LOGO_FILTER } from "@/lib/constants";
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
 * "Clienti & Case Study" — card grandi alternate (immagine/testo).
 * Immagine: screenshot reale del progetto quando disponibile,
 * altrimenti mockup astratto (es. clienti senza screenshot fornito).
 */
export default function CaseStudies() {
  const t = useTranslations("caseStudies");
  const messages = useMessages();
  const projects = (messages.caseStudies as unknown as { projects: Project[] }).projects;

  return (
    <section id="clienti" className="bg-background">
      <div className="container-core829 py-24 lg:py-32">
        <RevealOnScroll>
          <div className="max-w-2xl">
            <p className="kicker">{t("kicker")}</p>
            <h2 className="mt-4 text-section-title">{t("title")}</h2>
            <p className="mt-6 text-lg text-foreground-muted">{t("subtitle")}</p>
          </div>
        </RevealOnScroll>

        <div className="mt-16 space-y-20 lg:space-y-28">
          {projects.map((project, i) => {
            const meta = CLIENTS_META[i];
            const reversed = i % 2 === 1;
            const screenshot = CLIENT_SCREENSHOTS[project.domain];
            return (
              <article
                key={project.id ?? i}
                id={meta?.anchorId}
                className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16"
              >
                <RevealOnScroll
                  className={cn(
                    "relative",
                    reversed && "lg:order-2"
                  )}
                >
                  <div
                    aria-hidden
                    className={cn(
                      "absolute -top-4 -left-4 h-3 w-3 bg-accent",
                      reversed && "lg:-right-4 lg:-left-auto"
                    )}
                  />
                  <a
                    href={meta?.url ?? `https://${project.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t("viewSite")} — ${project.name}`}
                    className="group block"
                  >
                    {screenshot ? (
                      <ClientScreenshot
                        src={screenshot}
                        alt={`${project.name} — ${project.domain}`}
                      />
                    ) : (
                      <ProjectMockup variant={project.mockup} />
                    )}
                  </a>
                </RevealOnScroll>

                <RevealOnScroll
                  className={cn(reversed && "lg:order-1")}
                >
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                    {meta?.key && CLIENT_LOGOS[meta.key] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={CLIENT_LOGOS[meta.key]}
                        alt={`${project.name} logo`}
                        loading="lazy"
                        decoding="async"
                        className="h-8 object-contain"
                        style={{ filter: CLIENT_LOGO_FILTER[meta.key] }}
                      />
                    ) : (
                      <h3 className="text-2xl font-semibold tracking-tight">
                        {project.name}
                      </h3>
                    )}
                    <p className="tech-label">{project.domain}</p>
                  </div>
                  <p className="mt-2 text-sm text-foreground-muted">
                    {project.sector}
                  </p>

                  <p className="mt-6 text-lg leading-relaxed text-foreground">
                    {project.what}
                  </p>

                  <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-foreground-muted">
                    {t("stackLabel")}
                    <span className="ml-3 normal-case tracking-normal text-foreground">
                      {project.stack}
                    </span>
                  </p>

                  <ul className="mt-6 space-y-2.5">
                    {project.details.map((detail, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-3 text-sm text-foreground-muted"
                      >
                        <span className="mt-2 h-px w-6 shrink-0 bg-accent" aria-hidden />
                        {detail}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
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
                      className="link-ghost ml-auto text-sm"
                    >
                      {t("viewSite")}
                      <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </a>
                  </div>
                </RevealOnScroll>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
