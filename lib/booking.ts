/**
 * Widget di prenotazione (bookings.core829.net): tutti i link passano da qui così
 * la pagina di prenotazione si apre nella lingua del sito (parametro ?lang=).
 */
const BASE = "https://bookings.core829.net";
const SLUG = "intro-call";

/** Pagina di prenotazione a schermo intero (link e pulsanti). */
export function bookingUrl(locale: string): string {
  return `${BASE}/book/${SLUG}?lang=${encodeURIComponent(locale)}`;
}

/** Widget incorporato (iframe): colore d'accento del sito (Rosso Racing), font DM Sans, lingua del sito. */
export function bookingEmbedUrl(locale: string): string {
  const params = new URLSearchParams({
    accent: "#FF2743",
    font: "DM Sans",
    lang: locale,
  });
  return `${BASE}/embed/${SLUG}?${params.toString()}`;
}
