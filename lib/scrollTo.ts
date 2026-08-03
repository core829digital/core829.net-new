"use client";

import "./lenis-global";

/**
 * Scroll animato verso un anchor (#id) della stessa pagina.
 * Usa Lenis quando disponibile (smooth scroll), altrimenti scrollIntoView.
 */
export function smoothScrollTo(hash: string) {
  if (typeof window === "undefined") return;
  const el = document.querySelector(hash);
  if (!el) return;

  const lenis = window.__lenis;
  if (lenis) {
    lenis.scrollTo(el as HTMLElement, { offset: -72, duration: 1.2 });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}
