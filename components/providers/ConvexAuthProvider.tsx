"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";

/**
 * Provider Convex + Auth per il client area e l'area riservata.
 * Deve stare sopra ogni componente che usa useQuery/useMutation/useAuthActions.
 */
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

export default function ConvexAuthProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>
  );
}
