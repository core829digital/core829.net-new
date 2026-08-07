/**
 * Configurazione auth per la piattaforma CORE829.
 *
 * ATTENZIONE: un config mancante o errato produce un login che sembra
 * funzionare ma risulta sempre disconnesso senza alcun errore.
 *
 * Questa voce NON riguarda OAuth: è il provider JWT interno che Convex usa
 * per validare i token emessi da @convex-dev/auth ad ogni sign-in (email +
 * password). Senza di essa `ctx.auth.getUserIdentity()` / `getAuthUserId`
 * restituiscono sempre null anche con un token valido, quindi il login
 * sembra riuscire ma la dashboard non si carica mai.
 */
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
