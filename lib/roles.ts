/**
 * Gerarchia ruoli condivisa lato client (speculare a convex/roles.ts).
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
