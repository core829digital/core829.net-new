"use client";

import "./lenis-global";

function scrollY(target: number, duration = 1.2) {
  const lenis = window.__lenis;
  if (lenis) {
    lenis.scrollTo(target, { duration });
  } else {
    window.scrollTo({ top: target, behavior: "smooth" });
  }
}

/**
 * Scrolla fino al centro del plateau di una slide del tunnel (DepthStage).
 * La posizione dipende dall'indice: progress = index / (count - 1).
 */
export function scrollToSlide(stage: HTMLElement, index: number) {
  if (typeof window === "undefined") return;
  const count = Number(stage.dataset.depthCount ?? 1);
  const top = stage.getBoundingClientRect().top + window.scrollY;
  const total = stage.offsetHeight - window.innerHeight;
  const p = count > 1 ? index / (count - 1) : 0;
  scrollY(top + total * p, 1.6);
}

/**
 * Scroll animato verso un anchor (#id) della stessa pagina.
 * - Se l'anchor sta in una slide del tunnel, calcola la posizione di scroll
 *   corrispondente (gli elementi sono trasformati in 3D: l'offset DOM non vale).
 * - Altrimenti usa Lenis (smooth) o scrollIntoView.
 */
export function smoothScrollTo(hash: string) {
  if (typeof window === "undefined") return;
  const el = document.querySelector(hash) as HTMLElement | null;
  if (!el) return;

  const slide = el.closest<HTMLElement>("[data-depth-slide]");
  const stage = slide?.closest<HTMLElement>("[data-depth-stage]");
  if (slide && stage) {
    scrollToSlide(stage, Number(slide.dataset.depthSlide ?? 0));
    return;
  }

  const lenis = window.__lenis;
  if (lenis) {
    lenis.scrollTo(el, { offset: -72, duration: 1.2 });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}
