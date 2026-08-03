import { NextResponse } from "next/server";
import { Resend } from "resend";

interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  serviceInterest: string[];
  message: string;
  budgetRange?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;
const MAX_COMPANY = 150;
const MAX_INTERESTS = 8;
const MAX_INTEREST_LEN = 80;

/** Limiter di memoria keyed by IP: max 3 richieste / 60s. */
const ipRequests = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (ipRequests.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (recent.length >= RATE_LIMIT_MAX) {
    ipRequests.set(ip, recent);
    return true;
  }
  recent.push(now);
  ipRequests.set(ip, recent);
  return false;
}

/**
 * Fallback per il form di contatto (usato quando Convex non è deployed).
 * Valida server-side e notifica via Resend.
 */
export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = (payload.name ?? "").toString().trim();
  const email = (payload.email ?? "").toString().trim();
  const message = (payload.message ?? "").toString().trim();
  const company = (payload.company ?? "").toString().trim();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (name.length > MAX_NAME || email.length > MAX_EMAIL || message.length > MAX_MESSAGE) {
    return NextResponse.json({ error: "Field exceeds maximum length" }, { status: 413 });
  }
  if (company.length > MAX_COMPANY) {
    return NextResponse.json({ error: "Company exceeds maximum length" }, { status: 413 });
  }
  if (
    !Array.isArray(payload.serviceInterest) ||
    payload.serviceInterest.length > MAX_INTERESTS ||
    payload.serviceInterest.some(
      (s) => typeof s !== "string" || s.length > MAX_INTEREST_LEN
    )
  ) {
    return NextResponse.json({ error: "Invalid serviceInterest" }, { status: 400 });
  }

  // Notifica via Resend (best-effort). Se nessun canale è configurato, fallisci
  // in modo esplicito invece di restituire un falso successo.
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Contact delivery is not configured" },
      { status: 503 }
    );
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
      to: process.env.CONTACT_RECIPIENT_EMAIL ?? email,
      subject: `Nuova richiesta da ${name}`,
      text: [
        `Nome: ${name}`,
        `Email: ${email}`,
        payload.company ? `Azienda: ${payload.company}` : "",
        `Servizi: ${payload.serviceInterest.length ? payload.serviceInterest.join(", ") : "—"}`,
        payload.budgetRange ? `Budget: ${payload.budgetRange}` : "",
        "",
        message,
      ]
        .filter(Boolean)
        .join("\n"),
    });
  } catch {
    return NextResponse.json({ error: "Send failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
