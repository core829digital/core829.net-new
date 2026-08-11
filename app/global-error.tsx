"use client";

import { useEffect } from "react";

/**
 * Ultima rete di sicurezza: cattura errori non gestiti nel root layout
 * stesso (dove il normale error.tsx per-route non si applica). Deve
 * definire i propri <html>/<body> perché sostituisce l'intero root layout.
 * Niente next-intl qui: l'errore potrebbe essere avvenuto proprio dentro
 * al provider, quindi il testo resta volutamente statico e minimale.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          backgroundColor: "#ffffff",
          color: "#0a0a0a",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#999999",
              marginBottom: "1rem",
            }}
          >
            CORE829
          </p>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: "0.75rem", color: "#555555", lineHeight: 1.6 }}>
            An unexpected error occurred. Please try again, or contact us at{" "}
            <a href="mailto:hello@core829.net" style={{ color: "#0a0a0a" }}>
              hello@core829.net
            </a>
            .
          </p>
          <div style={{ marginTop: "2rem", display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: "0.625rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#ffffff",
                backgroundColor: "#0a0a0a",
                border: "none",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- full reload is intentional: this boundary catches errors in the root layout itself, so client-side routing state may be broken */}
            <a
              href="/"
              style={{
                padding: "0.625rem 1.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#0a0a0a",
                border: "1px solid #d4d4d4",
                textDecoration: "none",
              }}
            >
              Back to home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
