"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";

/**
 * Provider Convex + Auth per il client area e l'area riservata.
 * Deve stare sopra ogni componente che usa useQuery/useMutation/useAuthActions.
 *
 * Se NEXT_PUBLIC_CONVEX_URL non è definito (es. build/prerender senza env),
 * rende semplicemente i children senza Convex: deterministico sia su server
 * che su client, quindi nessun hydration mismatch. Le pagine Convex
 * falliranno in modo esplicito a runtime finché l'env non viene configurato.
 */
const address = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = address
  ? new ConvexReactClient(address, {
      unsavedChangesWarning: false,
    })
  : null;

export default function ConvexAuthProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  if (!convex) {
    return <>{children}</>;
  }
  return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>;
}
