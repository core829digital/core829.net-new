"use client";

import { useSyncExternalStore } from "react";

/**
 * "Versione semplice": pagina lineare senza tunnel 3D, parallax, scroll
 * inerziale né animazioni continue. Preferenza dell'utente salvata nel browser
 * (nessun cookie, nessun dato inviato al server).
 */
const KEY = "core829-simple";
const EVENT = "core829-simple-change";

function read(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** true se l'utente ha scelto la versione semplice (false lato server). */
export function useSimpleMode(): boolean {
  return useSyncExternalStore(subscribe, read, () => false);
}

/** Attiva/disattiva la versione semplice e riporta la pagina in cima (il layout cambia). */
export function setSimpleMode(value: boolean) {
  try {
    window.localStorage.setItem(KEY, value ? "1" : "0");
  } catch {
    /* storage non disponibile: la scelta vale solo per questa sessione */
  }
  document.documentElement.dataset.simple = value ? "1" : "0";
  window.dispatchEvent(new Event(EVENT));
  if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
  else window.scrollTo(0, 0);
}
