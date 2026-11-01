import {
  Workflow,
  PenTool,
  Terminal,
  LayoutGrid,
  TrendingUp,
  Server,
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
  /**
   * Nasconde il servizio da nav, footer, griglie, sitemap e JSON-LD, e fa
   * rispondere 404 alla sua pagina dedicata — senza toccare l'ordine o gli
   * indici dell'array (che devono restare allineati a solution.services
   * nei messaggi i18n). Rimuovere il flag per ripubblicarlo.
   */
  hidden?: boolean;
}

/**
 * Ordine dei 7 servizi (coerente con i messaggi i18n e con il footer).
 * Gli anchor id permettono al footer di puntare alle singole card.
 */
export const SERVICES_META: ServiceMeta[] = [
  { key: "server", anchorId: "servizio-server", icon: Server },
  { key: "automations", anchorId: "servizio-automazioni", icon: Workflow },
  { key: "webdesign", anchorId: "servizio-webdesign", icon: PenTool },
  { key: "webapp", anchorId: "servizio-webapp", icon: LayoutGrid },
  { key: "desktop", anchorId: "servizio-desktop", icon: Terminal },
  { key: "seo", anchorId: "servizio-seo", icon: TrendingUp },
  { key: "marketing", anchorId: "servizio-marketing", icon: Megaphone },
];

/** Servizi pubblicamente visibili, con l'indice originale preservato per i lookup i18n. */
export const VISIBLE_SERVICES_META = SERVICES_META.map((s, index) => ({
  ...s,
  index,
})).filter((s) => !s.hidden);

export interface ClientMeta {
  key: string;
  anchorId: string;
  url: string;
  /** Prodotto proprio di CORE829 (non un cliente): resta nei case study ma non conta come cliente. */
  ownProduct?: boolean;
}

export const CLIENTS_META: ClientMeta[] = [
  {
    key: "onespec",
    anchorId: "cliente-onespec",
    url: "https://www.onespec.eu/",
    ownProduct: true,
  },
  { key: "winex", anchorId: "cliente-winex", url: "https://www.winex.ro/it" },
  {
    key: "andromedia",
    anchorId: "cliente-andromedia",
    url: "https://andromediaweb-it.vercel.app/",
  },
  {
    key: "doctor-haus",
    anchorId: "cliente-doctor-haus",
    url: "https://doctor-haus.com",
  },
  { key: "revive", anchorId: "cliente-revive", url: "https://getrevive.app" },
  { key: "bidwyz", anchorId: "cliente-bidwyz", url: "https://bidwyz.com" },
];

/** Solo i clienti reali (esclude i prodotti propri): stats e "Con chi abbiamo lavorato". */
export const REAL_CLIENTS_META = CLIENTS_META.filter((c) => !c.ownProduct);

export const clientAnchorIds = CLIENTS_META.map((c) => ({ id: c.anchorId }));

/**
 * Screenshot reali dei client (chiave = dominio mostrato nel case study, come
 * nel file in /public/core829-client-ss). Ogni voce è una lista: una sola
 * immagine = cornice statica; più immagini = carousel in loop.
 * Formato 1920×960 (2:1), WebP q82. I clienti senza screenshot cadono sul
 * mockup astratto.
 */
export const CLIENT_SCREENSHOTS: Record<string, string[]> = {
  "onespec.eu": [
    "/core829-client-ss/onespec.eu.webp",
    "/core829-client-ss/onespec.eu-2.webp",
    "/core829-client-ss/onespec.eu-3.webp",
    "/core829-client-ss/onespec.eu-4.webp",
  ],
  "winex.ro": [
    "/core829-client-ss/winex.ro.webp",
    "/core829-client-ss/winex.ro-2.webp",
    "/core829-client-ss/winex.ro-3.webp",
  ],
  "andromediaweb-it.vercel.app": [
    "/core829-client-ss/andromediaweb-it.vercel.app.webp",
  ],
  "doctor-haus.com": ["/core829-client-ss/doctor-haus.com.webp"],
  "getrevive.app": ["/core829-client-ss/getrevive.app.webp"],
  "bidwyz.com": ["/core829-client-ss/bidwyz.com.webp"],
};

/**
 * Loghi reali dei client (chiave = key in CLIENTS_META, come i file
 * copiati in /public/logos dalla cartella fornita /public/branding+foto).
 * Convertiti in WebP per prestazioni.
 */
export const CLIENT_LOGOS: Record<string, string> = {
  onespec: "/logos/onespec.webp",
  andromedia: "/logos/andromedia.webp",
  "doctor-haus": "/logos/doctor-haus.webp",
  winex: "/logos/winex.webp",
  revive: "/logos/revive.webp",
  bidwyz: "/logos/bidwyz.webp",
};

/**
 * Dimensioni intrinseche (px) dei loghi in /public/logos, usate per riservare
 * lo spazio prima del caricamento (nessun salto di layout nei marquee).
 * I loghi sono già ritagliati e, tranne Doctor Haus, monocromi (#1a1a1a).
 */
export const CLIENT_LOGO_SIZE: Record<string, { w: number; h: number }> = {
  onespec: { w: 563, h: 160 },
  andromedia: { w: 900, h: 133 },
  "doctor-haus": { w: 402, h: 160 },
  winex: { w: 447, h: 160 },
  revive: { w: 206, h: 160 },
  bidwyz: { w: 143, h: 160 },
};

/** Loghi solo-simbolo (senza testo): nei marquee si affianca il nome. */
export const CLIENT_LOGO_ICON_ONLY = new Set(["revive", "bidwyz"]);

/** Loghi a colori che si mostrano in grigio e tornano a colori all'hover. */
export const CLIENT_LOGO_COLOR = new Set(["doctor-haus"]);

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
  /** Disponibilità: sempre attivi. */
  hours: "24/7",
};

/**
 * Fondatore e co-fondatore CORE829, con le rispettive linee dirette.
 * `phones` è sempre un array (anche con un solo numero) per uniformità
 * di rendering; `whatsapp`, se presente, è lo stesso numero raggiungibile
 * anche su WhatsApp.
 */
export const FOUNDERS = [
  {
    key: "founder",
    name: "Stefan Serban",
    phones: [COMPANY.phoneRo, COMPANY.phoneIt],
    whatsapp: undefined as string | undefined,
  },
  {
    key: "cofounder",
    name: "Vasile Serban",
    phones: ["+40 766 231 632"],
    whatsapp: "+40 766 231 632" as string | undefined,
  },
] as const;

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
