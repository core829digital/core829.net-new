"use client";

import { ReactNode } from "react";
import { useTranslations } from "next-intl";

/**
 * Se NEXT_PUBLIC_CONVEX_URL non è configurato (es. build Vercel senza env),
 * evita di montare i componenti che usano le hook Convex (useQuery/
 * useMutation/useConvexAuth) mostrando un fallback. La decisione è basata
 * sulla stessa variabile d'ambiente sia su server che su client, quindi è
 * deterministica e non causa hydration mismatch.
 */
const convexEnabled = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

export default function ConvexGate({ children }: { children: ReactNode }) {
  if (convexEnabled) {
    return <>{children}</>;
  }
  return <ConvexUnavailable />;
}

function ConvexUnavailable() {
  const t = useTranslations("clientArea");
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="max-w-md text-center text-foreground-muted">
        {t("backendUnavailable")}
      </p>
    </div>
  );
}
