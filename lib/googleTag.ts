/** ID della proprietà Google Analytics 4 di CORE829. */
export const GA_ID = "G-5X9Q08R6B1";

/**
 * Bootstrap inline eseguito nell'<head> di ogni pagina, PRIMA di gtag.js.
 *
 * Google Consent Mode v2: il tag è presente ovunque, ma tutte le categorie
 * partono NEGATE (nessun cookie, nessun identificativo). Se l'utente ha già
 * acconsentito in una visita precedente, il consenso salvato viene applicato
 * subito, prima del primo hit. Gli aggiornamenti successivi arrivano da
 * <GoogleConsentSync /> quando l'utente cambia scelta nel banner.
 */
export function googleTagBootstrap(storageKey: string, version: number): string {
  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'denied',personalization_storage:'denied',security_storage:'granted',wait_for_update:500});
try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(storageKey)})||'null');
if(s&&s.version===${version}&&s.consent){var c=s.consent;
gtag('consent','update',{analytics_storage:c.analytics?'granted':'denied',ad_storage:c.marketing?'granted':'denied',ad_user_data:c.marketing?'granted':'denied',ad_personalization:c.marketing?'granted':'denied',functionality_storage:c.preferences?'granted':'denied',personalization_storage:c.preferences?'granted':'denied'});}}catch(e){}
gtag('js',new Date());gtag('config','${GA_ID}');`;
}
