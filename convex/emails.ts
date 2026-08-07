import { Resend } from "resend";
import ResendProvider from "@auth/core/providers/resend";
import {
  generateRandomString,
  type RandomReader,
} from "@oslojs/crypto/random";

/** Indirizzo email predefinito ricevente per i nuovi lead dal form. */
const LEAD_EMAIL = "hello@core829.net";

/** Email dell'admin di piattaforma (vede i preventivi e risponde). */
const ADMIN_EMAIL = "contact.core829@gmail.com";

const SITE_URL = process.env.SITE_URL ?? "https://core829.net";

const OTP_VERIFY_MAX_AGE = 10 * 60 * 1000;

/** Traduzione dei budget (chiave -> etichetta italiana). */
const BUDGET_LABELS: Record<string, string> = {
  "0": "Sotto i 5.000 €",
  "1": "5.000 – 15.000 €",
  "2": "15.000 – 40.000 €",
  "3": "Oltre 40.000 €",
};

/** Stato del preventivo: etichetta + messaggio caloroso per l'utente. */
const STATUS_COPY: Record<string, { label: string; message: string }> = {
  new: {
    label: "Nuova richiesta",
    message:
      "Abbiamo ricevuto la tua richiesta e il team la sta già prendendo in carico con attenzione.",
  },
  in_review: {
    label: "In valutazione",
    message:
      "Stiamo analizzando la tua richiesta per proporti la soluzione più adatta alle tue esigenze.",
  },
  quoted: {
    label: "Preventivo inviato",
    message:
      "Abbiamo preparato il tuo preventivo: lo trovi disponibile nella tua area riservata.",
  },
  accepted: {
    label: "Accettata",
    message:
      "Ottima scelta! Il progetto parte ufficialmente e il team si mette al lavoro. Ti aggiorneremo a ogni passo.",
  },
  declined: {
    label: "Declinata",
    message:
      "Nessun problema: se in futuro vorrai rivedere i termini o riprendere il progetto, siamo qui.",
  },
  completed: {
    label: "Completata",
    message:
      "Il progetto è stato completato. Grazie di cuore per la fiducia: per noi è stato un piacere lavorare con te.",
  },
};

// ---------------------------------------------------------------- Security

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ------------------------------------------------------------ Layout HTML

const htmlP = (text: string) =>
  `<p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#1a1a1a;">${text}</p>`;

const htmlTitle = (text: string) =>
  `<h1 style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:1.3;color:#1a1a1a;font-weight:700;">${text}</h1>`;

const htmlCode = (code: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td align="center" style="background-color:#f7f7f7;border:1px solid #e5e5e5;border-radius:6px;padding:18px;"><span style="font-family:monospace,Arial,sans-serif;font-size:28px;font-weight:700;letter-spacing:8px;color:#1a1a1a;">${escapeHtml(
    code
  )}</span></td></tr></table>`;

const htmlButton = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td><a href="${escapeHtml(
    href
  )}" style="display:inline-block;background-color:#1a1a1a;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;padding:14px 28px;border-radius:4px;">${escapeHtml(
    label
  )}</a></td></tr></table>`;

const htmlHr = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0;"><tr><td style="border-top:1px solid #e5e5e5;font-size:0;line-height:0;">&nbsp;</td></tr></table>`;

const htmlQuote = (text: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td style="background-color:#f7f7f7;border-left:3px solid #e11d2e;padding:16px 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#1a1a1a;white-space:pre-wrap;">${escapeHtml(
    text
  )}</td></tr></table>`;

const htmlSignOff = `A presto,<br/>Il team CORE829`;

function renderLayout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f7f7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f7f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <tr>
            <td style="padding:0 0 20px;">
              <span style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:#1a1a1a;letter-spacing:1px;">CORE<span style="color:#e11d2e;">829</span></span>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border:1px solid #e5e5e5;border-top:3px solid #e11d2e;border-radius:8px;padding:40px 32px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 0 0;text-align:center;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#4a4a4a;line-height:1.6;">
                CORE829 · <a href="${SITE_URL}" style="color:#4a4a4a;text-decoration:underline;">core829.net</a><br />
                Ricevi questa email perché ti sei registrato o hai chiesto informazioni.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Invio email best-effort via Resend. Non deve mai far fallire il flusso
 * principale (signup, verifica OTP, preventivi): un errore di invio viene
 * loggato chiaramente e ignorato, così account e codici di verifica restano
 * salvati anche se Resend non è configurato o ha problemi temporanei.
 */
export async function sendEmail(args: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[email] non inviata (Resend non configurato):", args.subject, args.to);
    }
    return;
  }
  try {
    const resend = new Resend(apiKey);
    const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
    const { data, error } = await resend.emails.send({
      from,
      to: args.to,
      subject: args.subject,
      text: args.text,
      ...(args.html ? { html: args.html } : {}),
    });
    if (error) {
      console.error("[email] invio fallito:", args.subject, args.to, error);
    } else if (data?.id) {
      console.log("[email] inviata:", args.subject, args.to, data.id);
    }
  } catch (err) {
    console.error("[email] eccezione durante l'invio:", args.subject, args.to, err);
  }
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
  const budget = q.budgetRange
    ? (BUDGET_LABELS[q.budgetRange] ?? q.budgetRange)
    : "Da definire";
  const company = q.company ?? "—";
  const name = escapeHtml(q.name);
  const email = escapeHtml(q.email);

  const bodyHtml = [
    htmlTitle("Nuova richiesta di preventivo"),
    htmlP(`${name} ha appena inviato una richiesta di preventivo.`),
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
      <tr><td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#4a4a4a;width:100px;vertical-align:top;">Nome</td><td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1a1a1a;">${name}</td></tr>
      <tr><td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#4a4a4a;width:100px;vertical-align:top;">Email</td><td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1a1a1a;">${email}</td></tr>
      <tr><td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#4a4a4a;width:100px;vertical-align:top;">Azienda</td><td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1a1a1a;">${escapeHtml(company)}</td></tr>
      <tr><td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#4a4a4a;width:100px;vertical-align:top;">Servizi</td><td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1a1a1a;">${escapeHtml(interests)}</td></tr>
      <tr><td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#4a4a4a;width:100px;vertical-align:top;">Budget</td><td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1a1a1a;">${escapeHtml(budget)}</td></tr>
    </table>`,
    htmlHr,
    htmlP(`<strong>Messaggio</strong>`),
    htmlQuote(q.message),
    htmlButton(`${SITE_URL}/area-riservata`, "Apri l'area riservata"),
  ].join("\n");

  const text = [
    `Nuova richiesta di preventivo da ${q.name}.`,
    "",
    `Nome: ${q.name}`,
    `Email: ${q.email}`,
    `Azienda: ${company}`,
    `Servizi: ${interests}`,
    `Budget: ${budget}`,
    "",
    `Messaggio:`,
    q.message,
    "",
    `— CORE829 (piattaforma preventivi)`,
  ].join("\n");

  await sendEmail({
    to: process.env.ADMIN_EMAIL ?? ADMIN_EMAIL,
    subject: `Nuova richiesta di preventivo da ${q.name}`,
    text,
    html: renderLayout("Nuova richiesta di preventivo", bodyHtml),
  });
}

/** Conferma al richiedente che il preventivo è stato ricevuto. */
export async function sendQuoteConfirmationEmail(q: QuoteEmailData) {
  const interests = q.serviceInterest.length
    ? q.serviceInterest.join(", ")
    : "—";
  const budget = q.budgetRange
    ? (BUDGET_LABELS[q.budgetRange] ?? q.budgetRange)
    : "Da definire";
  const name = escapeHtml(q.name);

  const bodyHtml = [
    htmlTitle("Abbiamo ricevuto la tua richiesta"),
    htmlP(
      `Ciao ${name}, grazie per averci scritto. La tua richiesta di preventivo è arrivata e il team la sta già leggendo con attenzione.`
    ),
    htmlP(
      `Ti risponderemo entro <strong>1-2 giorni lavorativi</strong> con una proposta su misura per il tuo progetto.`
    ),
    htmlHr,
    htmlP(`<strong>Riepilogo della tua richiesta</strong>`),
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
      <tr><td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#4a4a4a;width:100px;vertical-align:top;">Servizi</td><td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1a1a1a;">${escapeHtml(interests)}</td></tr>
      <tr><td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#4a4a4a;width:100px;vertical-align:top;">Budget</td><td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1a1a1a;">${escapeHtml(budget)}</td></tr>
    </table>`,
    htmlQuote(q.message),
    htmlP(
      `Nel frattempo puoi seguire lo stato della tua richiesta in qualsiasi momento dalla tua area riservata.`
    ),
    htmlButton(`${SITE_URL}/area-riservata`, "Vai alla tua area riservata"),
    htmlSignOff,
  ].join("\n");

  const text = [
    `Ciao ${q.name},`,
    "",
    "Grazie per averci scritto. Abbiamo ricevuto la tua richiesta di preventivo e il team la sta già leggendo con attenzione.",
    "",
    "Ti risponderemo entro 1-2 giorni lavorativi con una proposta su misura.",
    "",
    "Riepilogo:",
    `Servizi: ${interests}`,
    `Budget: ${budget}`,
    "",
    q.message,
    "",
    "Puoi seguire lo stato della tua richiesta dalla tua area riservata:",
    `${SITE_URL}/area-riservata`,
    "",
    "A presto,",
    "Il team CORE829",
  ].join("\n");

  await sendEmail({
    to: q.email,
    subject: "La tua richiesta è arrivata — CORE829",
    text,
    html: renderLayout("Abbiamo ricevuto la tua richiesta", bodyHtml),
  });
}

/** Notifica al richiedente quando lo stato del preventivo cambia. */
export async function sendQuoteStatusEmail(args: {
  to: string;
  name: string;
  status: string;
}) {
  const copy = STATUS_COPY[args.status] ?? {
    label: args.status,
    message:
      "Il tuo preventivo è stato aggiornato dal team. Puoi rispondere a questa email per qualsiasi domanda.",
  };
  const name = escapeHtml(args.name);
  const label = escapeHtml(copy.label);

  const bodyHtml = [
    htmlTitle("Novità sul tuo preventivo"),
    htmlP(`Ciao ${name},`),
    htmlP(`Il tuo preventivo è ora: <strong>${label}</strong>`),
    htmlP(copy.message),
    htmlP(
      `Se hai domande o vuoi approfondire, rispondi pure a questa email: siamo qui per te.`
    ),
    htmlButton(`${SITE_URL}/area-riservata`, "Apri la tua area riservata"),
    htmlSignOff,
  ].join("\n");

  const text = [
    `Ciao ${args.name},`,
    "",
    `Il tuo preventivo è ora: ${copy.label}`,
    "",
    copy.message,
    "",
    "Se hai domande, rispondi a questa email: siamo qui per te.",
    "",
    "A presto,",
    "Il team CORE829",
  ].join("\n");

  await sendEmail({
    to: args.to,
    subject: "Aggiornamento sul tuo preventivo — CORE829",
    text,
    html: renderLayout("Novità sul tuo preventivo", bodyHtml),
  });
}

/** Risposta dell'admin al richiedente (dal pannello interno). */
export async function sendQuoteReplyEmail(args: {
  to: string;
  name: string;
  reply: string;
}) {
  const name = escapeHtml(args.name);

  const bodyHtml = [
    htmlTitle("Il team CORE829 ti ha scritto"),
    htmlP(`Ciao ${name},`),
    htmlP(`Ecco la risposta del nostro team sulla tua richiesta:`),
    htmlQuote(args.reply),
    htmlP(`Se hai altre domande, siamo a un'email di distanza.`),
    htmlSignOff,
  ].join("\n");

  const text = [
    `Ciao ${args.name},`,
    "",
    "Ecco la risposta del nostro team sulla tua richiesta:",
    "",
    args.reply,
    "",
    "Se hai altre domande, siamo a un'email di distanza.",
    "",
    "A presto,",
    "Il team CORE829",
  ].join("\n");

  await sendEmail({
    to: args.to,
    subject: "Una risposta dal team CORE829",
    text,
    html: renderLayout("Il team CORE829 ti ha scritto", bodyHtml),
  });
}

// ------------------------------------------------------------- OTP (auth)

const random: RandomReader = {
  read(bytes) {
    crypto.getRandomValues(bytes);
  },
};

const DIGITS = "0123456789";

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
    const bodyHtml = [
      htmlTitle("Benvenuto in CORE829"),
      htmlP(
        `Siamo felici di averti con noi. Per completare la registrazione e accedere alla tua area personale, inserisci il codice qui sotto:`
      ),
      htmlCode(token),
      htmlP(
        `Il codice è valido per <strong>10 minuti</strong>. Se non hai richiesto questa verifica, puoi semplicemente ignorare questa email.`
      ),
      htmlSignOff,
    ].join("\n");

    const text = [
      "Benvenuto in CORE829!",
      "",
      "Siamo felici di averti con noi. Per completare la registrazione, inserisci questo codice:",
      "",
      token,
      "",
      "Il codice è valido per 10 minuti. Se non hai richiesto questa verifica, puoi ignorare questa email.",
      "",
      "A presto,",
      "Il team CORE829",
    ].join("\n");

    await sendEmail({
      to: identifier,
      subject: "Conferma la tua email — CORE829",
      text,
      html: renderLayout("Benvenuto in CORE829", bodyHtml),
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
    const bodyHtml = [
      htmlTitle("Reimposta la tua password"),
      htmlP(
        `Abbiamo ricevuto una richiesta per cambiare la password del tuo account CORE829. Inserisci questo codice nella pagina per proseguire:`
      ),
      htmlCode(token),
      htmlP(
        `Il codice è valido per <strong>10 minuti</strong>. Se non sei stato tu a richiederlo, ignora questa email: la tua password resterà invariata.`
      ),
      htmlSignOff,
    ].join("\n");

    const text = [
      "Ciao,",
      "",
      "Abbiamo ricevuto una richiesta per cambiare la password del tuo account CORE829. Inserisci questo codice:",
      "",
      token,
      "",
      "Il codice è valido per 10 minuti. Se non sei stato tu, ignora questa email: la tua password resterà invariata.",
      "",
      "A presto,",
      "Il team CORE829",
    ].join("\n");

    await sendEmail({
      to: identifier,
      subject: "Reimposta la tua password — CORE829",
      text,
      html: renderLayout("Reimposta la tua password", bodyHtml),
    });
  },
});

export { LEAD_EMAIL, ADMIN_EMAIL };
