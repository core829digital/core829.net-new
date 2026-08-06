"use client";

import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { Loader2, Ban, LogOut } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import ClientArea from "@/components/client-area/ClientArea";
import InternalArea from "@/components/internal-area/InternalArea";
import { isInternalRole } from "@/lib/roles";

/**
 * Area riservata unificata (punto di accesso unico dall'header):
 * - Non autenticato  -> ClientArea (login / registrazione / verifica OTP /
 *                        recupero password) direttamente su questa pagina
 * - Cliente          -> ClientArea (dashboard preventivi, richiesta nuovo
 *                        preventivo, profilo)
 * - Admin/partner/technical/superadmin -> InternalArea (gestione preventivi)
 * - Account bannato  -> schermata di avviso con possibilità di uscire
 *
 * Dopo il sign-up l'utente resta su questa stessa pagina: niente reindirizzi.
 */
export default function PrivateArea() {
  const me = useQuery(api.users.getMyUser);

  if (me === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" aria-hidden />
      </div>
    );
  }

  if (me === null) {
    return <ClientArea />;
  }

  if (me.user.isBanned) {
    return <BannedScreen />;
  }

  if (isInternalRole(me.user.role)) {
    return <InternalArea />;
  }

  return <ClientArea />;
}

function BannedScreen() {
  const t = useTranslations("banned");
  const { signOut } = useAuthActions();

  return (
    <div className="mx-auto max-w-md text-center">
      <Ban className="mx-auto h-8 w-8 text-accent" aria-hidden />
      <h2 className="mt-4 text-section-title">{t("title")}</h2>
      <p className="mt-4 text-foreground-muted">{t("hint")}</p>
      <button
        type="button"
        onClick={() => void signOut()}
        className="mt-6 inline-flex min-h-11 items-center gap-2 border border-border px-6 text-sm font-medium text-foreground-muted transition-colors duration-300 hover:border-foreground hover:text-foreground"
      >
        <LogOut className="h-4 w-4" aria-hidden />
        {t("signOut")}
      </button>
    </div>
  );
}
