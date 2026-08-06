/**
 * Gerarchia ruoli e utilità di controllo accessi (backend Convex).
 *
 * Ruoli CORE829:
 * - client     (0): cliente finale, gestisce i propri preventivi
 * - partner    (1): può vedere/gestire i preventivi e collaborare
 * - technical  (2): operatore reparto tecnico, gestisce stato preventivi
 * - admin      (3): gestione utenti, statistiche, log, ban (no superadmin)
 * - superadmin (4): accesso completo e immutabile; l'account
 *                  contact.core829@gmail.com è sempre superadmin e non può
 *                  essere bannato, retrocesso o cancellato da nessuno.
 */

export const ROLE_RANK: Record<string, number> = {
  client: 0,
  partner: 1,
  technical: 2,
  admin: 3,
  superadmin: 4,
};

export const INTERNAL_ROLES = [
  "partner",
  "technical",
  "admin",
  "superadmin",
] as const;

/** Email dell'account radice: sempre superadmin e protetto. */
export const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ?? "contact.core829@gmail.com";

export function rankOf(role?: string | null): number {
  return ROLE_RANK[role ?? "client"] ?? 0;
}

export function isInternalRole(role?: string | null): boolean {
  return INTERNAL_ROLES.includes(
    (role ?? "") as (typeof INTERNAL_ROLES)[number]
  );
}

export function isSuperadminRole(role?: string | null): boolean {
  return role === "superadmin";
}

/**
 * Account protetto: il superadmin radice non può essere modificato/bannato
 * da nessuno, indipendentemente dal ruolo corrente in database.
 */
export function isProtectedAccount(
  email?: string | null,
  role?: string | null
): boolean {
  return (
    isSuperadminRole(role) ||
    (email ?? "").toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );
}

export function isBanned(user: { isBanned?: boolean | null }): boolean {
  return !!user.isBanned;
}
