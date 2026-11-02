# CORE829 — sito web

Sito ufficiale di CORE829 SRL (software, marketing e servizi digitali per eventi).
Produzione: https://core829.net — deploy automatico su Vercel da `main`; ogni branch/PR ha la sua anteprima.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 3 · next-intl 4 (24 lingue) ·
framer-motion · GSAP/ScrollTrigger · Lenis · Convex (backend) · Resend (email).

## Comandi

```bash
npm ci            # installa le dipendenze (il lockfile è allineato)
npm run build && npm run start   # test REALE: usare sempre la build di produzione
npm run lint
npm run typecheck
```

> `next dev` non è adatto a verificare il comportamento client: la CSP blocca `eval` e
> il JavaScript di pagina non parte. Per ogni verifica dinamica usare `build` + `start`.

Variabili d'ambiente: `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`.

## Architettura in breve

- **Home a tunnel** (`components/tunnel/`): `DepthStage` è una sezione alta (n × 115svh) con uno
  stage `sticky` a prospettiva 3D; lo scroll nativo muove la "camera" con pause di lettura.
  Le slide sono in `IntroSlide`, `MidSlides`, `CasesSlide`; l'ordine è in `HomeTunnel`.
  Il footer resta fuori dal tunnel.
- **Modalità piatta** (`flat`): attiva con `prefers-reduced-motion`, viewport bassa (<560px)
  o "versione semplice" scelta dall'utente (`lib/simpleMode.ts`, interruttore nel footer,
  persistente, con skip link da tastiera). Disattiva Lenis, parallax e WebGL.
- **Hero** (`components/ui/neural-noise.tsx`): shader WebGL a risoluzione ridotta, in pausa
  fuori schermo e a tab nascosta, con fallback CSS.
- **Design system** (`app/globals.css`, `tailwind.config.ts`): token colore con canali RGB
  (`rgb(var(--rgb-x) / <alpha>)`), font Unbounded / Space Grotesk / Inter / JetBrains Mono,
  pulsanti capsula in vetro (`.btn*`), pannelli (`.glass-panel`), card a raggio 24px.
  Regole Apple HIG: vetro solo su controlli/navigazione, area di tocco ≥44px, testo ≥11px,
  fallback per reduced transparency/contrast.
- **i18n** (`messages/*.json`, `i18n/request.ts`): EN è la lingua di fallback; i case study
  hanno fallback per singolo progetto. Lingue con testi completi: it, en, ro, fr, de, es, nl, pl.
- **Case study** (`lib/constants.ts` + `caseStudies.projects`): loghi, screenshot e ordine
  dei clienti sono in `CLIENTS_META`, `CLIENT_SCREENSHOTS`, `CLIENT_LOGOS`.

## Qualità

- Accessibilità: axe-core (WCAG 2.1 AA + best practice) senza violazioni su home e pagine
  interne, in modalità standard e semplice.
- Non aggiungere un secondo `<main>` nelle pagine: il landmark è nel layout.
- Titoli pagina: usare `title: { absolute: ... }` se si include già il brand.
