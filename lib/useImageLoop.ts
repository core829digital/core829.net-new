"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Indice di un carousel automatico di immagini. A ogni tick precarica la
 * prossima immagine e cambia solo quando è pronta (nessun fotogramma vuoto
 * su connessioni lente). Fermo con `paused`, con prefers-reduced-motion o
 * con una sola immagine.
 */
export function useImageLoop(srcs: string[], intervalMs: number, paused: boolean) {
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  // Ref: l'array può essere ricreato a ogni render senza riavviare il timer.
  const list = useRef(srcs);
  list.current = srcs;
  const count = srcs.length;

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (paused || reduced || count < 2) return;
    let cancelled = false;
    const id = window.setInterval(() => {
      const next = (active + 1) % count;
      const img = new window.Image();
      const go = () => {
        if (!cancelled) setActive(next);
      };
      img.onload = go;
      img.onerror = go;
      img.src = list.current[next];
    }, intervalMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [active, paused, reduced, count, intervalMs]);

  return [active, setActive] as const;
}
