import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { LEAD_EMAIL } from "@/lib/constants";
import { getClientIp, isRateLimited } from "@/lib/rateLimit";

export const runtime = "nodejs";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  service?: string;
  budget?: string;
  message: string;
  consent: boolean;
  /** Honeypot: campo invisibile per gli utenti, spesso compilato dai bot. */
  website?: string;
  locale?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEN = {
  name: 200,
  email: 320,
  company: 200,
  service: 100,
  budget: 100,
  message: 5000,
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: ContactPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: se compilato, si tratta quasi certamente di un bot.
  // Rispondiamo comunque "ok" per non rivelare la tecnica al bot.
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();
  const company = (body.company ?? "").trim();
  const service = (body.service ?? "").trim();
  const budget = (body.budget ?? "").trim();

  if (!name || name.length > MAX_LEN.name) {
    return NextResponse.json({ ok: false, error: "invalid_name" }, { status: 400 });
  }
  if (!email || email.length > MAX_LEN.email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }
  if (!message || message.length > MAX_LEN.message) {
    return NextResponse.json({ ok: false, error: "invalid_message" }, { status: 400 });
  }
  if (company.length > MAX_LEN.company || service.length > MAX_LEN.service || budget.length > MAX_LEN.budget) {
    return NextResponse.json({ ok: false, error: "invalid_field" }, { status: 400 });
  }
  if (!body.consent) {
    return NextResponse.json({ ok: false, error: "consent_required" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY is not configured");
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  const from = process.env.CONTACT_FROM_EMAIL ?? "CORE829 Website <onboarding@resend.dev>";
  const to = process.env.CONTACT_TO_EMAIL ?? LEAD_EMAIL;

  const fields = [
    ["Name", name],
    ["Email", email],
    ["Company", company || "—"],
    ["Service", service || "—"],
    ["Budget", budget || "—"],
  ];

  const html = `
    <table cellpadding="0" cellspacing="0" style="font-family:sans-serif;font-size:14px;color:#111">
      ${fields
        .map(
          ([label, value]) =>
            `<tr><td style="padding:4px 12px 4px 0;font-weight:600;vertical-align:top">${label}</td><td>${escapeHtml(value)}</td></tr>`
        )
        .join("")}
    </table>
    <p style="font-weight:600;margin-top:16px">Message</p>
    <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
  `;

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `New contact form submission — ${name}`,
      html,
    });

    if (error) {
      console.error("[contact] Resend error", error);
      return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
    }
  } catch (err) {
    console.error("[contact] Unexpected error", err);
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
