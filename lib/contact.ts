"use client";

/**
 * Invio della richiesta di contatto/preventivo.
 *
 * Percorso primario: mutation Convex `contact:submitContactRequest`
 * (attivo quando NEXT_PUBLIC_CONVEX_URL è configurato).
 *
 * Fallback: API route /api/contact (validazione server-side + email via Resend).
 * Questo garantisce che il sito funzioni anche senza deployment Convex configurato.
 */

export interface ContactPayload {
  name: string;
  email: string;
  company?: string;
  serviceInterest: string[];
  message: string;
  budgetRange?: string;
}

export async function submitContactRequest(payload: ContactPayload): Promise<void> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (convexUrl) {
    try {
      const { ConvexHttpClient } = await import("convex/browser");
      const client = new ConvexHttpClient(convexUrl);
      const mutate = client.mutation as (
        name: string,
        args: Record<string, unknown>
      ) => Promise<unknown>;
      await mutate("contact:submitContactRequest", {
        name: payload.name,
        email: payload.email,
        company: payload.company ?? "",
        serviceInterest: payload.serviceInterest,
        message: payload.message,
        budgetRange: payload.budgetRange ?? "",
      });
      return;
    } catch (err) {
      // Degrada al fallback solo per errori transitori (rete/indisponibilità).
      // Gli errori di validazione (argomenti) NON vanno mascherati.
      if (err instanceof Error && /(Invalid|Missing|exceeds|Too many)/i.test(err.message)) {
        throw err;
      }
    }
  }

  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Contact request failed");
  }
}
