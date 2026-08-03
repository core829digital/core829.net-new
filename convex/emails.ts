import { Resend } from "resend";

/**
 * Invio email di notifica per le richieste di preventivo.
 * Usa Resend se RESEND_API_KEY è configurato; altrimenti logga in dev.
 */
export async function sendContactEmail(args: {
  name: string;
  email: string;
  company?: string;
  serviceInterest: string[];
  message: string;
  budgetRange?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[contact] Email notificata (Resend non configurato):", args);
    }
    return;
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  const interests = args.serviceInterest.length
    ? args.serviceInterest.join(", ")
    : "—";
  const budget = args.budgetRange ? `Budget: ${args.budgetRange}` : "";

  await resend.emails.send({
    from,
    to: process.env.CONTACT_RECIPIENT_EMAIL ?? args.email,
    subject: `Nuova richiesta da ${args.name}`,
    text: [
      `Nome: ${args.name}`,
      `Email: ${args.email}`,
      args.company ? `Azienda: ${args.company}` : "",
      `Servizi: ${interests}`,
      budget,
      "",
      args.message,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}
