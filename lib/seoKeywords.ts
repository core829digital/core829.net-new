import type { Locale } from "@/i18n/routing";

type ServiceKey =
  | "server"
  | "automations"
  | "webdesign"
  | "webapp"
  | "desktop"
  | "seo"
  | "marketing";

/**
 * Cluster di keyword curate manualmente (intent commerciale + long-tail
 * reali, non semplice concatenazione) per le due lingue di business
 * primarie di CORE829. Usate per il meta tag `keywords`, per JSON-LD e
 * come riferimento strategico per contenuti futuri (blog, landing, ADS).
 *
 * Nota: il meta tag `keywords` non ha alcun peso nel ranking di Google dal
 * 2009 — il valore reale di questa mappa è nei title/description/JSON-LD
 * che la usano, e come base per contenuti e campagne a pagamento.
 */
export const SERVICE_KEYWORDS_EN: Record<ServiceKey, string[]> = {
  server: [
    "custom server builds",
    "custom server manufacturer",
    "AI server configuration",
    "rendering server build",
    "custom GPU server",
    "enterprise server solutions",
    "Intel partner server builder",
    "NVIDIA server builder",
    "custom hosting server",
    "custom gaming server build",
    "storage server custom build",
    "server build management service",
    "managed server procurement",
    "custom server Europe",
    "custom AI infrastructure provider",
    "dedicated server design and build",
  ],
  automations: [
    "business process automation",
    "B2B workflow automation",
    "CRM automation services",
    "ERP integration automation",
    "email automation for business",
    "invoicing automation software",
    "workflow automation agency",
    "custom automation development",
    "business automation consulting",
    "automate repetitive tasks company",
    "system integration automation",
    "trigger-based automation solutions",
    "internal notification automation",
    "automation agency for enterprises",
  ],
  webdesign: [
    "custom web design agency",
    "brand-driven web design",
    "conversion-focused website design",
    "UI UX design agency",
    "custom website design company",
    "bespoke web design services",
    "web design for businesses",
    "premium web design studio",
    "design system development",
    "website redesign agency",
    "performance-focused web design",
    "B2B website design",
    "website design and development agency",
  ],
  webapp: [
    "custom web application development",
    "full-stack web app development",
    "B2B platform development",
    "SaaS development agency",
    "web app development company",
    "custom CRM development",
    "internal tools development",
    "dashboard development services",
    "API integration development",
    "web application development for enterprises",
    "custom software platform development",
    "vertical CRM development",
  ],
  desktop: [
    "custom desktop software development",
    "desktop application development company",
    "executable software development",
    "cross-platform desktop app development",
    "internal business tools development",
    "offline software development",
    "desktop software for enterprises",
    "custom software packaging and distribution",
    "vertical software development",
    "desktop app development agency",
    "custom Windows and macOS software",
  ],
  seo: [
    "SEO agency for businesses",
    "technical SEO services",
    "SEO indexing services",
    "organic visibility optimization",
    "Core Web Vitals optimization",
    "on-page SEO services",
    "SEO content strategy agency",
    "schema markup optimization",
    "search engine optimization company",
    "SEO for multilingual websites",
    "keyword strategy agency",
    "SEO ranking monitoring service",
  ],
  marketing: [
    "digital marketing agency",
    "Meta Ads management agency",
    "Google Ads management services",
    "paid social media advertising agency",
    "organic social media management",
    "content strategy agency",
    "B2B marketing agency",
    "full-funnel marketing agency",
    "paid and organic marketing agency",
    "social media growth agency",
    "performance marketing agency",
  ],
};

export const BRAND_KEYWORDS_EN: string[] = [
  "CORE829",
  "CORE829 digital agency",
  "custom software agency Romania",
  "digital agency Italy",
  "software house Romania",
  "web development agency Europe",
  "enterprise software partner",
  "custom technology solutions company",
  "digital transformation agency",
  "IT agency for enterprises",
  "CORE829 Servers custom hardware department",
  "software development and marketing agency",
  "full-stack digital agency",
  "one-stop-shop software and marketing partner",
];

export const SERVICE_KEYWORDS_IT: Record<ServiceKey, string[]> = {
  server: [
    "server personalizzati su misura",
    "azienda costruzione server custom",
    "server per intelligenza artificiale",
    "server per rendering 3D",
    "server GPU personalizzato",
    "soluzioni server enterprise",
    "partner Intel per server custom",
    "partner NVIDIA per server custom",
    "server hosting personalizzato",
    "server gaming su misura",
    "server storage personalizzato",
    "gestione build server su richiesta",
    "approvvigionamento server gestito",
    "server personalizzati spedizione Europa",
    "fornitore infrastrutture AI su misura",
    "progettazione e costruzione server dedicati",
  ],
  automations: [
    "automazione processi aziendali",
    "automazione workflow B2B",
    "automazione CRM",
    "integrazione automazione ERP",
    "automazione email aziendale",
    "software automazione fatturazione",
    "agenzia automazioni aziendali",
    "sviluppo automazioni su misura",
    "consulenza automazione processi",
    "riduzione attività ripetitive azienda",
    "integrazione sistemi aziendali",
    "automazioni basate su trigger",
    "automazione notifiche interne",
    "agenzia automazioni per aziende enterprise",
  ],
  webdesign: [
    "agenzia web design su misura",
    "web design guidato dal brand",
    "design sito web orientato alla conversione",
    "agenzia UI UX design",
    "azienda design siti web personalizzati",
    "servizi web design su misura",
    "web design per aziende",
    "studio web design premium",
    "sviluppo design system",
    "agenzia restyling sito web",
    "web design orientato alle performance",
    "web design B2B",
    "agenzia design e sviluppo siti web",
  ],
  webapp: [
    "sviluppo applicazioni web personalizzate",
    "sviluppo webapp full-stack",
    "sviluppo piattaforme B2B",
    "agenzia sviluppo SaaS",
    "azienda sviluppo web app",
    "sviluppo CRM personalizzato",
    "sviluppo strumenti interni aziendali",
    "sviluppo dashboard e reportistica",
    "sviluppo integrazioni API",
    "sviluppo applicazioni web per aziende",
    "sviluppo piattaforme software su misura",
    "sviluppo CRM verticale",
  ],
  desktop: [
    "sviluppo software desktop personalizzato",
    "azienda sviluppo applicazioni desktop",
    "sviluppo software eseguibili",
    "sviluppo app desktop multipiattaforma",
    "sviluppo strumenti aziendali interni",
    "sviluppo software offline",
    "software desktop per aziende",
    "packaging e distribuzione software su misura",
    "sviluppo software verticale",
    "agenzia sviluppo software desktop",
  ],
  seo: [
    "agenzia SEO per aziende",
    "servizi SEO tecnica",
    "servizi indicizzazione SEO",
    "ottimizzazione visibilità organica",
    "ottimizzazione Core Web Vitals",
    "servizi SEO on-page",
    "agenzia content strategy SEO",
    "ottimizzazione schema markup",
    "azienda ottimizzazione motori di ricerca",
    "SEO per siti multilingua",
    "agenzia strategia keyword",
    "monitoraggio posizionamento SEO",
  ],
  marketing: [
    "agenzia marketing digitale",
    "agenzia gestione Meta Ads",
    "servizi gestione Google Ads",
    "agenzia advertising social a pagamento",
    "gestione social media organico",
    "agenzia content strategy",
    "agenzia marketing B2B",
    "agenzia marketing full-funnel",
    "agenzia marketing organico e a pagamento",
    "agenzia crescita social media",
  ],
};

export const BRAND_KEYWORDS_IT: string[] = [
  "CORE829",
  "CORE829 agenzia digitale",
  "agenzia software su misura Romania",
  "agenzia digitale Italia",
  "software house Romania",
  "agenzia sviluppo web Europa",
  "partner software enterprise",
  "azienda soluzioni tecnologiche su misura",
  "agenzia trasformazione digitale",
  "agenzia IT per aziende enterprise",
  "CORE829 Servers dipartimento hardware su misura",
  "agenzia sviluppo software e marketing",
  "agenzia digitale full-stack",
  "partner unico per software e marketing",
];

/**
 * Modificatori tradotti usati per generare keyword localizzate nelle
 * lingue senza un cluster curato a mano: combinati con il titolo del
 * servizio già tradotto (es. "Custom Servers"), producono frasi
 * pertinenti anche se non stilisticamente perfette — accettabile per un
 * campo che i motori di ricerca non usano ai fini del ranking.
 */
export const KEYWORD_MODIFIERS: Partial<Record<Locale, string[]>> = {
  ro: ["agenție", "companie", "servicii", "personalizat", "pentru afaceri", "dezvoltare"],
  fr: ["agence", "entreprise", "services", "sur mesure", "pour entreprises", "développement"],
  de: ["Agentur", "Unternehmen", "Dienstleistungen", "individuell", "für Unternehmen", "Entwicklung"],
  nl: ["bureau", "bedrijf", "diensten", "op maat", "voor bedrijven", "ontwikkeling"],
  es: ["agencia", "empresa", "servicios", "a medida", "para empresas", "desarrollo"],
  pt: ["agência", "empresa", "serviços", "personalizado", "para empresas", "desenvolvimento"],
  pl: ["agencja", "firma", "usługi", "na zamówienie", "dla firm", "tworzenie"],
  cs: ["agentura", "firma", "služby", "na míru", "pro firmy", "vývoj"],
  sk: ["agentúra", "firma", "služby", "na mieru", "pre firmy", "vývoj"],
  hu: ["ügynökség", "vállalat", "szolgáltatások", "egyedi", "vállalatoknak", "fejlesztés"],
  ru: ["агентство", "компания", "услуги", "индивидуальный", "для бизнеса", "разработка"],
  uk: ["агентство", "компанія", "послуги", "індивідуальний", "для бізнесу", "розробка"],
  bg: ["агенция", "компания", "услуги", "по поръчка", "за бизнеса", "разработка"],
  el: ["γραφείο", "εταιρεία", "υπηρεσίες", "κατά παραγγελία", "για επιχειρήσεις", "ανάπτυξη"],
  tr: ["ajans", "şirket", "hizmetler", "özel", "işletmeler için", "geliştirme"],
  sv: ["byrå", "företag", "tjänster", "skräddarsydd", "för företag", "utveckling"],
  da: ["bureau", "virksomhed", "tjenester", "skræddersyet", "til virksomheder", "udvikling"],
  no: ["byrå", "selskap", "tjenester", "skreddersydd", "for bedrifter", "utvikling"],
  fi: ["toimisto", "yritys", "palvelut", "räätälöity", "yrityksille", "kehitys"],
  zh: ["机构", "公司", "服务", "定制", "企业专用", "开发"],
  ja: ["エージェンシー", "会社", "サービス", "カスタム", "企業向け", "開発"],
  ko: ["에이전시", "회사", "서비스", "맞춤형", "기업용", "개발"],
};

export function getServiceKeywords(
  locale: string,
  serviceKey: string,
  serviceTitle: string
): string[] {
  if (locale === "en") {
    return [...(SERVICE_KEYWORDS_EN[serviceKey as ServiceKey] ?? []), serviceTitle];
  }
  if (locale === "it") {
    return [...(SERVICE_KEYWORDS_IT[serviceKey as ServiceKey] ?? []), serviceTitle];
  }
  const modifiers = KEYWORD_MODIFIERS[locale as Locale] ?? KEYWORD_MODIFIERS.en;
  if (!modifiers) return [serviceTitle];
  return [
    serviceTitle,
    ...modifiers.flatMap((m) => [`${m} ${serviceTitle}`, `${serviceTitle} ${m}`]),
  ];
}

export function getBrandKeywords(locale: string): string[] {
  if (locale === "en") return BRAND_KEYWORDS_EN;
  if (locale === "it") return BRAND_KEYWORDS_IT;
  return ["CORE829", "CORE829 Servers"];
}

export function getSiteKeywords(
  locale: string,
  serviceTitles: { key: string; title: string }[]
): string[] {
  const serviceHeadTerms = serviceTitles.map((s) => s.title);
  const topClusterTerms =
    locale === "en"
      ? Object.values(SERVICE_KEYWORDS_EN).flatMap((arr) => arr.slice(0, 2))
      : locale === "it"
        ? Object.values(SERVICE_KEYWORDS_IT).flatMap((arr) => arr.slice(0, 2))
        : [];
  return [...getBrandKeywords(locale), ...serviceHeadTerms, ...topClusterTerms];
}
