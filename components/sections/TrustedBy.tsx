"use client";

import { useTranslations } from "next-intl";
import Marquee from "@/components/ui/Marquee";
import { CLIENTS_META, CLIENT_LOGOS, CLIENT_LOGO_FILTER } from "@/lib/constants";

/**
 * "Con chi abbiamo lavorato" — marquee infinito dei 5 clienti reali.
 * Loghi reali in scala di grigio di default, piena saturazione on-hover.
 */
export default function TrustedBy() {
  const t = useTranslations("trustedBy");

  return (
    <section className="border-y border-border bg-surface">
      <div className="container-core829 py-14">
        <p className="tech-label text-center">{t("label")}</p>

        <Marquee duration={36} className="mt-10">
          {CLIENTS_META.map((client) => {
            const logo = CLIENT_LOGOS[client.key];
            return (
              <a
                key={client.key}
                href={client.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={client.key}
                className="group mx-10 flex shrink-0 items-center gap-3"
              >
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rotate-45 border border-foreground/40 transition-transform duration-300 group-hover:rotate-[135deg] group-hover:border-accent"
                />
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logo}
                    alt={client.key}
                    loading="lazy"
                    decoding="async"
                    className="h-9 max-w-40 object-contain opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ filter: CLIENT_LOGO_FILTER[client.key] }}
                  />
                ) : (
                  <span className="text-xl font-semibold tracking-tight text-foreground-muted transition-colors duration-300 group-hover:text-accent">
                    {client.key}
                  </span>
                )}
              </a>
            );
          })}
        </Marquee>
      </div>
    </section>
  );
}
