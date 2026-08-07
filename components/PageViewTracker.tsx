"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useConvexAuth } from "@convex-dev/auth/react";

/**
 * Tracking anonimo delle pagine viste (analytics admin).
 *
 * Fa una POST al sito Convex (route HTTP /track-page-view) a ogni cambio di
 * rotta. Il server calcola paese/città dagli header Vercel e un visitorKey
 * pseudonimo (hash SHA-256 di IP+salt): l'IP non viene mai trasmesso né
 * salvato, e il paese/città sono i soli dati di geolocalizzazione usati.
 *
 * La chiamata è best-effort e fire-and-forget: non blocca mai il rendering.
 */
export default function PageViewTracker() {
  const pathname = usePathname();
  const { isAuthenticated } = useConvexAuth();
  const authedRef = useRef(false);
  authedRef.current = isAuthenticated;

  useEffect(() => {
    const siteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
    if (!siteUrl) {
      return;
    }
    const locale = pathname.split("/")[1] ?? "";
    const path = pathname.length > 1 ? pathname : "/";

    // Aggiorna il flag autenticato anche a livello di navigazione successiva.
    const authenticated = authedRef.current;

    void fetch(`${siteUrl}/track-page-view`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        path,
        locale,
        isAuthenticated: authenticated,
      }),
    }).catch(() => {
      // best-effort: nessun crash se il tracking fallisce.
    });
  }, [pathname]);

  return null;
}
