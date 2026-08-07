import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import {
  verificationEmailProvider,
  passwordResetEmailProvider,
} from "./emails";
import { sanitizeEmail, sanitizeSingleLine } from "./sanitize";

/**
 * Autenticazione CORE829.
 *
 * Provider: email + password con verifica email obbligatoria (OTP via
 * Resend) e reset password (OTP via Resend). Le password sono hashate
 * con Scrypt e i tentativi falliti sono limitati (10/ora) lato Convex.
 *
 * Il ruolo viene assegnato a "client" alla registrazione; l'admin
 * (contact.core829@gmail.com) viene promosso solo dopo la verifica
 * dell'email (vedi users:claimAdminIfEligible).
 */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      verify: verificationEmailProvider,
      reset: passwordResetEmailProvider,
      validatePasswordRequirements(password: string) {
        if (typeof password !== "string" || password.length < 10) {
          throw new Error("Password must be at least 10 characters");
        }
        if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
          throw new Error(
            "Password must contain both letters and numbers"
          );
        }
      },
      profile(params) {
        const email = sanitizeEmail(String(params.email ?? ""));
        const name = sanitizeSingleLine(String(params.name ?? ""), 100);
        const userName = name || email.split("@")[0] || undefined;
        return {
          email,
          role: "client",
          ...(userName ? { name: userName } : {}),
        };
      },
    }),
  ],
  signIn: {
    maxFailedAttempsPerHour: 10,
  },
  callbacks: {
    /**
     * Promozione automatica a superadmin dell'email amministratore
     * (contact.core829@gmail.com) non appena l'indirizzo risulta verificato.
     * Viene eseguita server-side a ogni creazione/aggiornamento utente,
     * quindi non dipende dal client. La verifica email via OTP garantisce
     * la proprietà dell'indirizzo. Il superadmin non può mai essere bannato.
     */
    async afterUserCreatedOrUpdated(ctx, { userId }) {
      const user = await ctx.db.get(userId);
      if (!user) return;
      const email = (user.email ?? "").toLowerCase();
      const adminEmail = (process.env.ADMIN_EMAIL ?? "contact.core829@gmail.com")
        .toLowerCase();
      if (email === adminEmail && user.emailVerificationTime) {
        await ctx.db.patch(userId, {
          role: "superadmin",
          isBanned: undefined,
          banReason: undefined,
          bannedAt: undefined,
        });
      }
    },
  },
});
