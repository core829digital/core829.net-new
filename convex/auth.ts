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
});
