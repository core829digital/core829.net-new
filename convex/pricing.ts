/**
 * Fasce di budget condivise tra il form preventivi, le email (emails.ts)
 * e la stima della pipeline finanziaria (admin.ts). Unica fonte di verità
 * per evitare che le fasce vadano fuori sincrono tra i moduli.
 */

export const BUDGET_LABELS: Record<string, string> = {
  "0": "Sotto i 5.000 €",
  "1": "5.000 – 15.000 €",
  "2": "15.000 – 40.000 €",
  "3": "Oltre 40.000 €",
};

/** Stima prudenziale (punto medio, floor per l'ultima fascia aperta). */
export const BUDGET_MIDPOINTS: Record<string, number> = {
  "0": 2500,
  "1": 10000,
  "2": 27500,
  "3": 50000,
};

export function estimateBudgetValue(budgetRange?: string | null): number {
  if (!budgetRange) return 0;
  return BUDGET_MIDPOINTS[budgetRange] ?? 0;
}
