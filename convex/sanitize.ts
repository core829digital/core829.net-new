/**
 * Sanitizzazione lato server di tutti gli input di testo.
 *
 * Obiettivo: impedire l'iniezione di XML/HTML/codice nei campi di testo
 * ("provisional text formatting") e l'header injection nelle email,
 * oltre a normalizzare spazi e rimuovere caratteri di controllo.
 */

const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const ZERO_WIDTH_RE = /[\u200B-\u200D\uFEFF]/g;
const CRLF_RE = /\r\n/g;
const MULTI_LINE_RE = /\n{3,}/g;

/**
 * Pulisce un testo libero: rimuove caratteri di controllo, normalizza
 * a capo, limita la lunghezza. `allowNewlines` conserva i ritorni a capo
 * (usato per i messaggi). Gli altri campi vengono ridotti a riga singola.
 */
export function sanitizeText(
  input: string,
  maxLength: number,
  allowNewlines = false
): string {
  let out = String(input ?? "");
  out = out.replace(CONTROL_CHARS_RE, "");
  out = out.replace(ZERO_WIDTH_RE, "");
  out = out.replace(CRLF_RE, "\n");
  if (!allowNewlines) {
    out = out.replace(/[\r\n\t]/g, " ").replace(/ {2,}/g, " ");
  } else {
    out = out.replace(MULTI_LINE_RE, "\n\n");
  }
  out = out.trim();
  if (out.length > maxLength) {
    out = out.slice(0, maxLength);
  }
  return out;
}

/** Campo a riga singola: nessun carattere di controllo, nessun a capo. */
export function sanitizeSingleLine(
  input: string,
  maxLength: number
): string {
  return sanitizeText(input, maxLength, false);
}

/**
 * Email: minuscole, senza spazi, senza caratteri di controllo.
 * Previene header injection (nuove righe / caratteri C0).
 */
export function sanitizeEmail(input: string, maxLength = 254): string {
  return sanitizeSingleLine(input, maxLength).toLowerCase();
}

/**
 * Whitelist per la lista dei servizi: i valori devono appartenere ai
 * service keys noti. Evita che vengano iniettati valori arbitrari.
 */
export function sanitizeServiceInterest(
  input: unknown,
  allowed: readonly string[],
  maxItems: number
): string[] {
  if (!Array.isArray(input)) {
    throw new Error("Invalid serviceInterest");
  }
  const cleaned = input
    .slice(0, maxItems)
    .map((s) => sanitizeSingleLine(String(s ?? ""), 80))
    .filter((s) => s.length > 0 && allowed.includes(s));
  if (cleaned.length > maxItems) {
    throw new Error("Too many service interests");
  }
  return cleaned;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
