/**
 * Configurazione auth per la piattaforma CORE829.
 *
 * ATTENZIONE: un config mancante o errato produce un login che sembra
 * funzionare ma risulta sempre disconnesso senza alcun errore.
 *
 * L'autenticazione è email + password (senza OAuth/passkey): il backend
 * valida la lista dei provider di credenziali; per il solo password
 * la lista rimane vuota.
 */
export default {
  providers: [],
};
