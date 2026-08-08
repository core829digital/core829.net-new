"use client";

import { useEffect, useState } from "react";

/**
 * Misura il viewport realmente visibile all'utente (Visual Viewport API),
 * inclusi gli offset dovuti a barra del browser mobile, pinch-zoom, ecc.
 *
 * Espone valori reali (fatti, non stime) e li propaga come custom properties
 * CSS su <html> (`--vvh`, `--vvw`, `--vvt`, `--vvl`) così che gli overlay
 * possano dimensionarsi su ciò che l'utente vede davvero.
 */
export interface VisualViewportState {
  height: number;
  width: number;
  offsetTop: number;
  offsetLeft: number;
}

export function getVisualViewport(): VisualViewportState {
  if (typeof window === "undefined") {
    return { height: 0, width: 0, offsetTop: 0, offsetLeft: 0 };
  }
  const vv = window.visualViewport;
  if (vv) {
    return {
      height: vv.height,
      width: vv.width,
      offsetTop: vv.offsetTop,
      offsetLeft: vv.offsetLeft,
    };
  }
  return {
    height: window.innerHeight,
    width: window.innerWidth,
    offsetTop: 0,
    offsetLeft: 0,
  };
}

export function useVisualViewport(): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>(() =>
    getVisualViewport()
  );

  useEffect(() => {
    const vv = window.visualViewport;
    let raf = 0;

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const next = getVisualViewport();
        setState(next);
        const root = document.documentElement;
        root.style.setProperty("--vvh", `${next.height}px`);
        root.style.setProperty("--vvw", `${next.width}px`);
        root.style.setProperty("--vvt", `${next.offsetTop}px`);
        root.style.setProperty("--vvl", `${next.offsetLeft}px`);
      });
    };

    update();

    if (vv) {
      vv.addEventListener("resize", update);
      vv.addEventListener("scroll", update);
    }
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      cancelAnimationFrame(raf);
      if (vv) {
        vv.removeEventListener("resize", update);
        vv.removeEventListener("scroll", update);
      }
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return state;
}
