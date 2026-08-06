import { Resend } from "resend";

/** Indirizzo email predefinito ricevente per i nuovi lead dal form. */
const LEAD_EMAIL = "hello@core829.net";

/** Email dell'admin di piattaforma (vede i preventivi e risponde). */
const ADMIN_EMAIL = "contact.core829@gmail.com";

/**
 * Invio email best-effort via Resend. Se RESEND_API_KEY non è configurato,
 * logga in dev e non fallisce mai il flusso principale.
 */
export async function sendEmail(args: {
  to: string;
  subject: string;
  text: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[email] non inviata (Resend non configurato):", args);
    }
    return;
  }
  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  await resend.emails.send({
    from,
    to: args.to,
    subject: args.subject,
    text: args.text,
  });
}

export interface QuoteEmailData {
  name: string;
  email: string;
  company?: string;
  serviceInterest: string[];
  message: string;
  budgetRange?: string;
}

/** Notifica interna all'admin quando arriva un nuovo preventivo. */
export async function sendNewQuoteAdminNotification(q: QuoteEmailData) {
  const interests = q.serviceInterest.length
    ? q.serviceInterest.join(", ")
    : "—";
  const budget = q.budgetRange ? `Budget: ${q.budgetRange}` : "";
  await sendEmail({
    to: process.env.ADMIN_EMAIL ?? ADMIN_EMAIL,
    subject: `Nuovo preventivo richiesto da ${q.name}`,
    text: [
      `Nuova richiesta di preventivo da ${q.name}.`,
      `Email: ${q.email}`,
      q.company ? `Azienda: ${q.company}` : "",
      `Servizi: ${interests}`,
      budget,
      "",
      q.message,
      "",
      `— CORE829 (piattaforma preventivi)`,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

/** Conferma al richiedente che il preventivo è stato ricevuto. */
export async function sendQuoteConfirmationEmail(q: QuoteEmailData) {
  await sendEmail({
    to: q.email,
    subject: "Abbiamo ricevuto la tua richiesta di preventivo",
    text: [
      `Ciao ${q.name},`,
      "",
      "Grazie per averci contattato. Abbiamo ricevuto la tua richiesta di preventivo e il team ti risponderà entro 1-2 giorni lavorativi.",
      "",
      q.message ? `Riepilogo:\n\n${q.message}` : "",
      "",
      "— CORE829",
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

/** Notifica al richiedente quando lo stato del preventivo cambia. */
export async function sendQuoteStatusEmail(args: {
  to: string;
  name: string;
  status: string;
}) {
  await sendEmail({
    to: args.to,
    subject: `Il tuo preventivo CORE829: ${args.status}`,
    text: [
      `Ciao ${args.name},`,
      "",
      `Il tuo preventivo è ora in stato: "${args.status}".`,
      "",
      "Puoi contattarci in qualsiasi momento rispondendo a questa email.",
      "",
      "— CORE829",
    ].join("\n"),
  });
}

/** Risposta dell'admin al richiedente (dal pannello interno). */
export async function sendQuoteReplyEmail(args: {
  to: string;
  name: string;
  reply: string;
}) {
  await sendEmail({
    to: args.to,
    subject: "Risposta dal team CORE829 sul tuo preventivo",
    text: [
      `Ciao ${args.name},`,
      "",
      args.reply,
      "",
      "— Il team CORE829",
      process.env.RESEND_FROM_EMAIL ? "" : "",
    ].join("\n"),
  });
}

import ResendProvider from "@auth/core/providers/resend";
import {
  generateRandomString,
  type RandomReader,
} from "@oslojs/crypto/random";

const random: RandomReader = {
  read(bytes) {
    crypto.getRandomValues(bytes);
  },
};

const DIGITS = "0123456789";

const OTP_VERIFY_MAX_AGE = 10 * 60 * 1000;

/** Email OTP per la verifica dell'indirizzo email (signup/signin). */
export const verificationEmailProvider = ResendProvider({
  id: "verification-otp",
  apiKey: process.env.RESEND_API_KEY,
  from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
  maxAge: OTP_VERIFY_MAX_AGE,
  async generateVerificationToken() {
    return generateRandomString(random, DIGITS, 6);
  },
  async sendVerificationRequest({ identifier, token }) {
    await sendEmail({
      to: identifier,
      subject: "Il tuo codice di verifica CORE829",
      text: [
        "Benvenuto in CORE829.",
        "",
        `Il tuo codice di verifica è: ${token}`,
        "",
        "Inseriscilo nella pagina per completare l'accesso.",
        "",
        "Il codice scade dopo 10 minuti.",
        "",
        "— CORE829",
      ].join("\n"),
    });
  },
});

/** Email OTP per il reset della password. */
export const passwordResetEmailProvider = ResendProvider({
  id: "password-reset-otp",
  apiKey: process.env.RESEND_API_KEY,
  from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
  maxAge: OTP_VERIFY_MAX_AGE,
  async generateVerificationToken() {
    return generateRandomString(random, DIGITS, 6);
  },
  async sendVerificationRequest({ identifier, token }) {
    await sendEmail({
      to: identifier,
      subject: "Reimposta la tua password CORE829",
      text: [
        "Ciao,",
        "",
        `Il tuo codice per reimpostare la password è: ${token}`,
        "",
        "Inseriscilo nella pagina per proseguire.",
        "",
        "Il codice scade dopo 10 minuti.",
        "",
        "— CORE829",
      ].join("\n"),
    });
  },
});

export { LEAD_EMAIL, ADMIN_EMAIL };
