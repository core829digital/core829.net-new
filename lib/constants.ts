import {
  Workflow,
  PenTool,
  Terminal,
  LayoutGrid,
  TrendingUp,
  Server,
  Rocket,
  Megaphone,
  ShieldCheck,
  Gauge,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface ServiceMeta {
  key: string;
  anchorId: string;
  icon: LucideIcon;
}

/**
 * Ordine degli 8 servizi (coerente con i messaggi i18n e con il footer).
 * Gli anchor id permettono al footer di puntare alle singole card.
 */
export const SERVICES_META: ServiceMeta[] = [
  { key: "server", anchorId: "servizio-server", icon: Server },
  { key: "automations", anchorId: "servizio-automazioni", icon: Workflow },
  { key: "webdesign", anchorId: "servizio-webdesign", icon: PenTool },
  { key: "webapp", anchorId: "servizio-webapp", icon: LayoutGrid },
  { key: "desktop", anchorId: "servizio-desktop", icon: Terminal },
  { key: "seo", anchorId: "servizio-seo", icon: TrendingUp },
  { key: "delivery", anchorId: "servizio-delivery", icon: Rocket },
  { key: "marketing", anchorId: "servizio-marketing", icon: Megaphone },
];

export interface ClientMeta {
  key: string;
  anchorId: string;
  url: string;
}

export const CLIENTS_META: ClientMeta[] = [
  { key: "iwhome", anchorId: "cliente-iwhome", url: "https://iwhome.app" },
  {
    key: "doctor-haus",
    anchorId: "cliente-doctor-haus",
    url: "https://doctor-haus.com",
  },
  { key: "winex", anchorId: "cliente-winex", url: "https://winex.ro" },
  { key: "revive", anchorId: "cliente-revive", url: "https://getrevive.app" },
  { key: "bidwyz", anchorId: "cliente-bidwyz", url: "https://bidwyz.com" },
];

export const clientAnchorIds = CLIENTS_META.map((c) => ({ id: c.anchorId }));

/**
 * Screenshot reali dei client (chiave = dominio, come nel file in /public/core829-client-ss).
 * I clienti senza screenshot (es. iwhome) cadono sul mockup astratto.
 */
export const CLIENT_SCREENSHOTS: Record<string, string> = {
  "iwhome.app": "/core829-client-ss/iwhome.app.png",
  "doctor-haus.com": "/core829-client-ss/doctor-haus.com.png",
  "winex.ro": "/core829-client-ss/winex.ro.png",
  "getrevive.app": "/core829-client-ss/getrevive.app.png",
  "bidwyz.com": "/core829-client-ss/bidwyz.com.png",
};

/**
 * Loghi reali dei client (chiave = key in CLIENTS_META, come i file
 * copiati in /public/logos dalla cartella fornita /public/branding+foto).
 */
export const CLIENT_LOGOS: Record<string, string> = {
  iwhome: "/logos/iwhome.png",
  "doctor-haus": "/logos/doctor-haus.webp",
  winex: "/logos/winex.png",
  revive: "/logos/revive.png",
  bidwyz: "/logos/bidwyz.png",
};

/**
 * Filtro CSS per rendere ogni logo visibile come marcatura monocroma scura,
 * indipendentemente dal colore dell'originale. I loghi chiari/bianchi
 * (winex, iwhome, revive) vengono invertiti su scuro; quelli già scuri
 * (doctor-haus, bidwyz) restano in scala di grigi.
 */
export const CLIENT_LOGO_FILTER: Record<string, string> = {
  iwhome: "invert(1) grayscale(1)",
  "doctor-haus": "grayscale(1)",
  winex: "invert(1) grayscale(1)",
  revive: "invert(1) grayscale(1)",
  bidwyz: "grayscale(1)",
};

/**
 * Dati societari CORE829 SRL (condivisi, non dipendono dalla lingua).
 * Usati in footer, JSON-LD, pagina contatti e legali.
 */
export const COMPANY = {
  name: "CORE829 SRL",
  legalName: "CORE829 SRL",
  address: "Str. Mihai Eminescu, 10, Roman, Romania",
  regCom: "J2026029428009",
  cui: "54616345",
  cif: "54616345",
  phoneRo: "+40 766 668 482",
  phoneIt: "+39 375 946 8881",
  email: "hello@core829.net",
};

/**
 * Caselle di posta aziendali, ciascuna pensata per uno scenario di contatto.
 * `key` coincide con la chiave i18n (contactEmails.<key>.label / .desc).
 */
export const EMAILS = [
  { key: "hello", address: "hello@core829.net" },
  { key: "office", address: "office@core829.net" },
  { key: "partnerships", address: "partnerships@core829.net" },
  { key: "sales", address: "sales@core829.net" },
  { key: "projects", address: "projects@core829.net" },
] as const;

/** Indirizzo predefinito ricevente per i nuovi lead dal form. */
export const LEAD_EMAIL = "hello@core829.net";

/** Icone per la bento grid delle capability trasversali. */
export const FEATURE_ICON_MAP: Record<string, LucideIcon> = {
  Server,
  ShieldCheck,
  TrendingUp,
  Workflow,
  Gauge,
  Zap,
};
