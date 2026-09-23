/* ==================================================================
   CONTENT — the only file you need to edit to update the portfolio.
   Everything the interface renders comes from here. No component
   changes required to add a project, a skill or a link.

   Grounded in Florent's 2026 CV and confirmed with him. Every figure
   and claim here is traceable to a source — keep it that way.
   ================================================================== */

export type Status = 'shipped' | 'live' | 'in-flight' | 'archived'

export interface Project {
  /** Stable id — used for routing (#/projects/<id>) and keys. */
  id: string
  /** Display name. */
  name: string
  /** Two to six words. Shown in the list. */
  role: string
  /** One paragraph. Shown when the project is selected. */
  summary: string
  year: string
  status: Status
  /** Tech badges, in the order you want them read. */
  stack: string[]
  /** Optional hard numbers. Rendered as an instrument row — keep to 3. */
  metrics?: { label: string; value: string }[]
  /**
   * The genuinely hard engineering problems and how they were solved.
   * This is what a technical buyer actually reads — two or three, each
   * a short title and a paragraph.
   */
  highlights?: { title: string; detail: string }[]
  /** Optional screenshot in /public. */
  image?: string
  /**
   * Several screenshots shown in one frame with a switcher, in place of
   * `image` — for a record that spans more than one surface. `label` is
   * the tab, `caption` sits under the shot.
   */
  gallery?: { src: string; label: string; caption: string }[]
  /**
   * 'beside' (default) puts the shot in a narrow column next to the
   * summary — right for a portrait phone capture. 'full' gives it the
   * panel's full width, which a dense landscape UI needs to stay
   * readable.
   */
  imageLayout?: 'beside' | 'full'
  links?: { label: string; href: string }[]
  /** 0–100. Drives the little completion meter. Use 100 for shipped. */
  progress: number
}

export interface StackGroup {
  label: string
  items: { name: string; level: number }[] // level: 0–100
}

export const identity = {
  callsign: 'DODITECH',
  name: 'Florent Fejzula',
  title: 'Product Engineer · Founder, Dodi Tech',
  location: 'Skopje, MK',
  timezone: 'Europe/Skopje',
  /** Map pin in the bottom bar. Skopje. */
  coords: { lat: 41.9981, lon: 21.4254 },
  tagline: 'I turn loosely defined business problems into deployed software.',
  intro: [
    'I am a product engineer with an Angular and TypeScript foundation, and a recent track record of taking real business problems from discovery all the way to working production software — deciding the scope, the UX, the architecture and the data model along the way.',
    'Dodi Tech is my studio. Most of what I build replaces a manual process: spreadsheets, paper, or a workflow somebody is holding together by hand. I work directly with the people who will use the thing, which is usually what decides whether it survives contact with a real working day.',
    'I use AI coding agents as a normal part of development, and I review, debug and validate what they produce. That is what lets me move across unfamiliar stacks quickly when the product problem calls for it.',
  ],
  availability: 'Accepting new engagements',
  availabilityState: 'open' as 'open' | 'limited' | 'closed',
}

export const education = {
  school: 'Ss. Cyril and Methodius University, Skopje',
  degree: "Bachelor's, Network Technologies",
  years: '2012 – 2018',
}

/** Four working languages is a commercial asset in this market. */
export const languages = [
  { name: 'Albanian', level: 'Native' },
  { name: 'English', level: 'Fluent' },
  { name: 'Macedonian', level: 'Fluent' },
  { name: 'Turkish', level: 'Fluent' },
]

/** Shown on the Profile panel. Your words, not a template. */
export const method =
  'I own the work end to end — problem framing, UX and scope tradeoffs, architecture, implementation, deployment, then the feedback and iteration after release. Fewer handoffs, and one person accountable for the result.'

export const contact = {
  email: 'fejzula.florent@hotmail.com',
  phone: '+389 70 302 376',
  links: [
    { label: 'GitHub', href: 'https://github.com/florent-fejzula', handle: 'florent-fejzula' },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/florent-fejzula/',
      handle: 'florent-fejzula',
    },
  ],
}

/**
 * Headline counters on the idle screen. Empty hides the row; the grid
 * adapts to however many you give it.
 *
 * Every figure here is traceable to the CV. Nothing is estimated.
 */
export const stats: { label: string; value: number; prefix?: string; suffix: string }[] = [
  // Derived, so it never goes stale: first professional role was 2018.
  { label: 'Years building', value: new Date().getFullYear() - 2018, suffix: '' },
  // Measured, not projected: Maison de Parfum's purchase history stopped
  // blanket discounting. Confirmed with the client.
  { label: 'Client savings delivered', value: 300, prefix: '€', suffix: '/mo' },
  { label: 'Working languages', value: 4, suffix: '' },
]

export const services = [
  {
    code: 'SVC-01',
    name: 'Product engineering',
    detail: 'A loosely defined business problem taken to deployed software — scope, UX, architecture and release.',
  },
  {
    code: 'SVC-02',
    name: 'Operations systems',
    detail: 'Replacing spreadsheets and manual workflows with something the team will actually keep using.',
  },
  {
    code: 'SVC-03',
    name: 'Mobile & PWA',
    detail: 'React Native apps, installable web apps, service workers and push — built for real devices.',
  },
  {
    code: 'SVC-04',
    name: 'AI-native delivery',
    detail: 'Coding agents used as normal tooling, with the output reviewed, debugged and validated before it ships.',
  },
]

/* ---- PROJECTS -----------------------------------------------------
   Real work only. The archive rail, the radar blips and the capability
   panel's "deployed in shipped work" list are all derived from this
   array, so adding a project here updates the whole interface.
   ------------------------------------------------------------------ */
export const projects: Project[] = [
  {
    id: 'maison',
    name: 'Maison Loyalty',
    role: 'Architecture · Full build',
    summary:
      "The point-of-sale and stock system Maison de Parfum, a perfume shop in Skopje, runs its daily trading on. Barcode checkout, cash, card and split payments, client loyalty tiers, phone-based inventory counting, supplier receiving, invoices and Macedonian fiscal receipt printing — in Macedonian, Albanian and English. Because the system holds each client's purchase history, the shop stopped discounting customers who would have bought anyway, which is worth about €300 a month. Underneath it, the engineering problem is correctness under concurrency: one Windows till drives a legally regulated fiscal printer while staff phones mutate the same stock records.",
    year: '2026',
    status: 'live',
    stack: [
      'Angular',
      'TypeScript',
      'Firestore',
      'Firebase Auth',
      'RxJS',
      'SCSS',
      'Node.js',
      'Express',
      'Service Worker (PWA)',
      'Firebase Hosting',
      'Firebase Storage',
      'SheetJS',
      'Vitest',
    ],
    metrics: [
      { label: 'Client savings delivered', value: '€300/mo' },
      { label: 'Automated tests passing', value: '149' },
      { label: 'Initial JS transfer', value: '178 kB' },
    ],
    highlights: [
      {
        title: 'Exactly-once stock mutation across a till and phones',
        detail:
          'Staff count inventory on their phones while the till sells the same items. Every stock write runs inside a transaction that reads an idempotency receipt keyed by request ID and checks the quantity and revision against what the client last saw — a replayed request finds its receipt and succeeds, while a genuinely stale one raises a conflict and forces a recount. There is a second-order case underneath: cross-document security rules can reject a losing commit as permission-denied before the SDK reports a version conflict, so the code retries once with the identical request to tell “already committed” apart from a real conflict.',
      },
      {
        title: 'A fiscal printer you cannot roll back',
        detail:
          'Under Macedonian fiscal law a printed receipt is a legal event. There is no undo, and a blind retry double-prints. The bridge drives the vendor’s binary by writing CP1251-encoded command files and spawning it with a timeout, serialised through a queue so two operations can never interleave, and the browser takes a lock before any fiscal operation begins. The design deliberately separates “save failed” from “may have printed”: the second is held for a human to review rather than silently retried, and a cleanup failure is never allowed to turn a completed sale into a retry.',
      },
      {
        title: 'Reversal as a verified reversal, not a refund button',
        detail:
          'Reversing a sale re-checks the original receipt number, date and every line item against the cart before anything prints, refuses a second reversal, then atomically restores stock, reverses the client’s spending total and recomputes their loyalty tier. Product identity is re-verified inside the transaction, so a barcode reassigned since the original sale aborts the reversal rather than crediting stock to the wrong item.',
      },
    ],
    image: '/shots/maison-loyalty.webp',
    imageLayout: 'full',
    links: [
      // Staff-only login. Labelled so nobody clicks expecting a demo.
      { label: 'Live app (staff login)', href: 'https://maison-loyalty-5bc38.web.app' },
    ],
    progress: 100,
  },
  {
    id: 'e-faktura',
    name: 'e-Faktura',
    role: 'Architecture · Full build',
    summary:
      'An invoicing product for North Macedonia, built to the УЈП e-Фактура specification. A company enters its details once, then creates, numbers, validates, prints and exports invoices; the operator runs it as a subscription, with an admin screen that provisions a new customer — auth account, company record and subscription — in a single call. It is the web successor to an offline desktop invoicing tool I built earlier, which has seven active business users moving across to this version. Submission to УЈП is deliberately not wired yet: it needs a JWS signed by a smart-card certificate that no browser tab can reach, so signing and transport are abstract seams rather than a half-working implementation.',
    year: '2026',
    status: 'live',
    stack: [
      'Angular',
      'TypeScript',
      'Angular Material',
      'Firebase Auth',
      'Firestore',
      'Firestore Security Rules',
      'Cloud Functions',
      'RxJS',
      'Firebase Hosting',
    ],
    metrics: [
      { label: 'Users on the predecessor', value: '7' },
      { label: 'Tests & E2E assertions', value: '129' },
      { label: 'Initial bundle', value: '273 kB' },
    ],
    highlights: [
      {
        title: 'Getting the tax spec right, where public write-ups get it wrong',
        detail:
          'It is JSON and JWS, not UBL 2.1. Line amounts carry four decimals while document totals carry two, so rounding has to happen at one specific point or the totals disagree with the sum of the lines. A reverse-charge line keeps its VAT rate but reports zero VAT, while still declaring a notional amount in the totals. The seller VAT number takes a Cyrillic МК prefix beside a Latin MK country code. It is handled by a dedicated totals engine with more test code than implementation, plus a separate document builder and validator, and an 87-entry tax-indicator codebook generated from the official source rather than typed by hand.',
      },
      {
        title: 'Immutability enforced in rules, not in the interface',
        detail:
          'A tax record that the UI merely declines to edit is not immutable. 165 lines of Firestore rules with nine helpers do the real work: access is scoped by member UID so no query can reach another company’s data; an issued invoice freezes on its issued timestamp rather than its status, because a status check would leave issued-but-unsubmitted invoices editable; after issue only payment tracking and the tax receipt may change; deletion is allowed only while the authority holds no copy. The subscription date is unwritable from any browser, and admin rights live in a document no client can write. The end-to-end suite asserts each of these against a real emulator rather than trusting them.',
      },
      {
        title: 'Two places where the platform fights the requirement',
        detail:
          'Signing needs a qualified certificate on a smart card behind a PIN, and the authority’s host sends no CORS headers — so the signer and transport are abstract, currently bound to implementations that refuse and explain why, swappable for an extension bridge, a server-held certificate or a desktop shell. Separately, provisioning a customer from the browser is impossible, because creating the auth account replaces the operator’s own session — they would be signed in as the customer they just created. That moved to an Admin-SDK callable that writes profile and company in one batch and deletes the auth account if the batch fails, so a half-failed run cannot leave an orphan that makes the next attempt fail on “email already in use”.',
      },
    ],
    image: '/shots/e-faktura.webp',
    imageLayout: 'full',
    links: [
      { label: 'Live app', href: 'https://e-faktura-1e6d0.web.app' },
      { label: 'Repo', href: 'https://github.com/florent-fejzula/e-faktura' },
    ],
    // Invoicing works end to end and is deployed; submission to УЈП
    // is the remaining piece, hence live-but-not-100.
    progress: 75,
  },
  {
    // One record for two systems: the internal stock app and the public
    // website it feeds. The connection between them is the story.
    id: 'rera',
    name: 'Rera Hair Fashion',
    role: 'Architecture · Full build',
    summary:
      'Two connected systems for Rera Hair Fashion Group, a salon and barber equipment wholesaler in Skopje that also runs two salons: the stock app its staff use every day, and the four-language public website that shows its catalogue. Staff run the stock app from their phones as an installable PWA — inventory, sales at full or discounted price, categories — with an owner role that also sees sales history and total stock value. Publishing a product means adding it there: it appears on the public site automatically with its name, category and photo, never its price or stock level, and a visitor’s enquiry hands off to WhatsApp or Viber with the product already named. Both are delivered and actively in use.',
    year: '2026',
    status: 'live',
    stack: [
      'Firestore',
      'React',
      'Vanilla JavaScript',
      'Firebase Auth',
      'Firebase Storage',
      'PWA (Workbox)',
      'Vite',
      'schema.org JSON-LD',
      'Firebase Hosting',
    ],
    metrics: [
      { label: 'Fields the public site can read', value: '3' },
      { label: 'Products published by staff', value: '250' },
      { label: 'Languages on the public site', value: '4' },
    ],
    highlights: [
      {
        title: 'One product, two audiences, no server in between',
        detail:
          'The website needs product names and photos; prices and stock levels are commercially sensitive. Firestore security rules grant access per document, not per field — so no rule can let the public read a product while hiding its price. With no backend to mediate, every product create, edit and delete in the stock app also writes a sanitised mirror carrying only name, category and image, and the website reads only the mirror. The confidential fields are not hidden from the public client; they are absent from anything it can reach, so devtools or a crafted query have nothing to find.',
      },
      {
        title: 'A save that showed success, then quietly vanished',
        detail:
          'Firestore applies a write to the local cache before the server confirms it, so a write the rules reject renders as success and then silently rolls back. Combined with error handling that caught nothing, staff watched categories save and disappear with no error ever shown. It surfaced from a real user complaint, not a test — and it is a whole class of bug worth designing against, not a one-off.',
      },
      {
        title: 'Focus stolen by the browser’s own click',
        detail:
          'The enquiry dialog would not take keyboard focus on open. Instrumented, the focus call fired and returned with the active element unchanged: a real click or Enter press carries the browser’s own “return focus to the activated control” step, which outlived a synchronous call, a zero timeout and two animation frames — measured at five. Rather than guess a delay that might be too short on slower hardware, the dialog retries each frame until the active element confirms focus landed. It only reproduced under genuine activation; a scripted click worked fine, so mouse-only testing would have passed it.',
      },
      {
        title: 'A login that failed on every first attempt',
        detail:
          'Sign-in resolves before the auth listener finishes looking up the user’s role, so navigating on that promise hit a route guard that still saw no user and bounced straight back to the login form, cleared. Every user logged in twice, every time. Navigation now reacts to the auth state itself rather than to the sign-in call returning.',
      },
    ],
    // The same products on both surfaces — flipping between them shows
    // note 01 working. The staff shot is production data with prices,
    // quantities, units and stock value redacted; the unredacted
    // original lives in the gitignored design/private/.
    gallery: [
      {
        src: '/shots/rera-stock.webp',
        label: 'Staff app',
        caption:
          'The stock app, signed in as the owner. Prices, quantities and stock value redacted for publication.',
      },
      {
        src: '/shots/rera-website.webp',
        label: 'Public site',
        caption:
          'rera.mk — the same products, published straight from the stock app. No price or quantity ever reaches this page.',
      },
    ],
    imageLayout: 'full',
    links: [
      { label: 'Live site', href: 'https://rera.mk' },
      { label: 'Source · stock app', href: 'https://github.com/florent-fejzula/rera-stock' },
    ],
    progress: 100,
  },
  {
    id: 'combo',
    name: 'COMBO Mobile App',
    role: 'Architecture · Full build',
    summary:
      "A React Native app for COMBO, a Macedonian hardware and home-goods retailer. It reads the shop's live WooCommerce catalogue — around 12,800 products — straight from the public Store API with no backend of its own, covering browsing, Cyrillic search, cart, checkout and a digital loyalty card. Built as a working demo for a pitch to the store owners and delivered as an installable Android build.",
    year: '2026',
    status: 'in-flight',
    stack: [
      'React Native',
      'Expo',
      'TypeScript',
      'Expo Router',
      'TanStack Query',
      'WooCommerce Store API',
      'react-native-svg',
      'EAS Build',
    ],
    metrics: [
      { label: 'Live catalogue', value: '~12,800' },
      { label: 'Screens shipped', value: '10' },
      { label: 'Custom backend', value: 'none' },
    ],
    highlights: [
      {
        title: 'Undocumented API limits, found by probing',
        detail:
          'The Store API silently caps page size at 100, so a single request for the shop’s 192 categories drops four top-level ones with no error at all. Totals are returned only in response headers, never the body. Around a thousand products have no price configured and would render as “0 ден”. Each of those ships as a visible bug if you trust the documentation — none of them are in it.',
      },
      {
        title: 'A barcode that actually scans',
        detail:
          'The loyalty card needed a real EAN-13, not a picture of one. Implemented from the specification on-device — L/G/R code tables, first-digit parity selection, mod-10 check digit — and rendered as SVG with correct quiet zones and extended guard bars. Verified structurally at 95 modules and 30 bars, and the check-digit algorithm against known-good retail codes.',
      },
      {
        title: 'No backend, and the reason why',
        detail:
          'Reading WooCommerce directly works from React Native because native fetch has no same-origin policy. The API sends no CORS headers at all, so identical code fails in a browser. That makes the web a deliberate non-target from this codebase rather than a free third platform — a constraint worth stating up front rather than discovering late.',
      },
    ],
    image: '/shots/combo-mk.webp',
    links: [
      { label: 'Client site', href: 'https://combo.mk' },
      // Repo link pulled: github.com/florent-fejzula/combo-mk returns 404
      // to anonymous visitors. Make it public and this goes back in.
    ],
    // Distance to a production release, not to the demo scope — the demo
    // itself is complete. Order submission, accounts, live loyalty and
    // push notifications are the remainder.
    progress: 40,
  },
  {
    id: 'servis-auto',
    name: 'Servis Auto',
    role: 'Architecture · Full build',
    summary:
      'A work-order system for Auto Servis Bosch, a car repair shop in Kumanovo. Staff record the client, the vehicle, what the client reported and what was actually replaced, then print a signed sheet stating the guarantee — the point is to settle “you broke something else” arguments with a dated document rather than with memory. The shop serves Albanian and Macedonian clients, so the printed sheet has to come out in the client’s language regardless of which language the mechanic has the app set to. That one requirement ruled out Angular’s built-in i18n and shaped the rest of the build.',
    year: '2026',
    status: 'live',
    stack: [
      'Angular',
      'TypeScript',
      'Firestore',
      'Firebase Auth',
      'Firebase Hosting',
      'PWA / Service Worker',
      'SCSS',
      'Vitest',
    ],
    metrics: [
      { label: 'Languages in one build', value: '3' },
      { label: 'Unit tests passing', value: '24' },
      { label: 'Initial bundle, gzipped', value: '241 kB' },
    ],
    highlights: [
      {
        title: 'Print language decoupled from interface language',
        detail:
          'The sheet a client signs must be in their language while the mechanic keeps the app in his — one build, two languages live at the same time. Angular’s built-in i18n compiles one bundle per locale and structurally cannot do that. It runs on runtime dictionaries instead, with a service exposing two lookups: one for the current interface language, one for an explicitly named language, and the print view resolving the client’s language off the job itself. A test fails the build if the three dictionaries ever drift out of sync.',
      },
      {
        title: 'The document is evidence, so it cannot change retroactively',
        detail:
          'A job copies the client name, phone, plate and guarantee term onto itself when it is created, rather than referencing them. A client changing their phone number, or the shop changing its default guarantee term, must never silently rewrite what a sheet printed last March actually promised. Work orders get human-readable per-year sequential numbers through a transactional counter, and Firestore runs with a persistent local cache so the shop’s unreliable wifi does not block intake.',
      },
      {
        title: 'The Print button that did nothing on iPhone',
        detail:
          'Reported as a dead button, and it was not application code: in an iOS home-screen web app there is no Safari chrome to host a print or share sheet, so the print call is silently ignored. The fix detects standalone mode and reopens the same route in a real Safari tab, carrying a flag that fires the dialog once and then scrubs itself out of the URL.',
      },
    ],
    image: '/shots/servis-auto.webp',
    imageLayout: 'full',
    links: [{ label: 'Source', href: 'https://github.com/florent-fejzula/auto-service-bosch' }],
    progress: 100,
  },
  {
    id: 'perfumery',
    name: 'Perfumery In-Store',
    role: 'Architecture · Full build',
    summary:
      'A touchscreen catalogue built to stand on a tablet inside a niche perfume shop. Customers narrow 377 bottles by gender, scent family and main note, tap one to read its brand, notes and description, or open a curated seasonal gallery; staff add stock and choose which brands appear from a separate admin screen. Two constraints shaped it: a kiosk has no back button and nobody to ask, so the filters must never lead to an empty screen — and shop wifi drops, so the device has to keep working when it does.',
    year: '2024–2026',
    status: 'live',
    stack: [
      'Angular 20',
      'TypeScript',
      'Angular Signals',
      'Firestore',
      'Firebase Storage',
      'PWA / Service Worker',
      'RxJS',
      'SCSS',
      'Firebase Hosting',
      'Claude API',
    ],
    metrics: [
      { label: 'Perfumes across 30 brands', value: '377' },
      { label: 'Filter tags on three axes', value: '49' },
      { label: 'Filter paths ending on an empty screen', value: '0' },
    ],
    highlights: [
      {
        title: 'Filters that cannot dead-end',
        detail:
          'Tags combine with AND, and across 49 of them most pairs match nothing. On every render the catalogue runs a speculative pass: for each tag not yet selected it simulates adding it, filters the full list, and disables the tag if nothing would survive. Select Aquatic and Citrus and 377 bottles narrow to 9 while 38 tags grey out. A customer physically cannot reach an empty grid — which matters on a kiosk, where an empty screen reads as broken.',
      },
      {
        title: 'Working through wifi drops without a sync layer',
        detail:
          'Firestore runs with a persistent IndexedDB cache, and the stores load once and hold the catalogue in memory, so moving between screens never refetches. After the first read, a background pass quietly requests every bottle image, pushing the whole catalogue into the browser cache. With the service worker on top, the device keeps browsing when the connection goes.',
      },
      {
        title: 'Brand visibility: instant, and never wrong',
        detail:
          'Staff toggling a brand — or all 30 at once — need immediate feedback, but a failed write must not leave the kiosk showing something the database does not. The toggle updates the interface first, commits one batched write, and restores the previous state if the write throws. The catalogue reacts to the change and re-applies the active filters without a refetch.',
      },
      {
        title: 'Descriptions that do not all sound the same',
        detail:
          'The bottle descriptions are generated at build time with Claude, in batches, by a Node script. Left alone, 377 perfume descriptions converge on one voice — every scent “whispers”, “unfolds” into a “tapestry”. The prompt bans 22 of those stock words outright, which is what keeps the catalogue readable end to end.',
      },
    ],
    // Same bottle in both frames: Citrus Riviera survives the filter in
    // the catalogue shot and leads the seasonal gallery. Both captured
    // from the live site.
    gallery: [
      {
        src: '/shots/perfumery-catalog.webp',
        label: 'Catalogue',
        caption:
          'Aquatic and Citrus selected: 377 bottles narrow to 9, and every tag that would lead to an empty screen is disabled.',
      },
      {
        src: '/shots/perfumery-gallery.webp',
        label: 'Seasonal gallery',
        caption:
          'The Summer 2026 gallery — 17 slides on a 30-second auto-advance, descriptions generated at build time.',
      },
    ],
    imageLayout: 'full',
    links: [
      { label: 'Live', href: 'https://perfume-filtering-app.web.app' },
      { label: 'Source', href: 'https://github.com/florent-fejzula/perfumery-in-store' },
    ],
    progress: 100,
  },
]

export const stackGroups: StackGroup[] = [
  {
    label: 'Interface',
    items: [
      { name: 'Angular', level: 95 },
      { name: 'TypeScript / JavaScript', level: 93 },
      { name: 'HTML / CSS · responsive', level: 91 },
      { name: 'RxJS', level: 86 },
      { name: 'React / React Native', level: 84 },
      { name: 'PWA / service workers', level: 80 },
    ],
  },
  {
    label: 'Systems',
    items: [
      { name: 'Firebase', level: 90 },
      { name: 'REST API integration', level: 90 },
      { name: 'Data modelling', level: 83 },
      { name: 'Push notifications', level: 78 },
      { name: 'Deployment & release', level: 85 },
    ],
  },
  {
    label: 'Practice',
    items: [
      { name: 'AI-assisted development', level: 93 },
      { name: 'Problem framing & scope', level: 89 },
      { name: 'Client communication', level: 90 },
      { name: 'Operations & process design', level: 87 },
    ],
  },
]

/** Career log — rendered as a vertical trace on the Profile panel. */
export const timeline = [
  {
    year: '2018',
    title: 'Frontend intern, Xinerji Teknoloji',
    detail: 'Angular frontend work, responsive interfaces and performance.',
  },
  {
    year: '2019',
    title: 'Ministry of Environment & Physical Planning',
    detail: 'Multilingual support and a modernised design for the ministry’s official site.',
  },
  {
    year: '2020',
    title: 'Frontend developer, Vorteks ED',
    detail:
      'An Angular industrial air-filter control application for Nederman, plus queue-management interfaces deployed at Telekom and HalkBank.',
  },
  {
    year: '2022',
    title: 'Web applications developer, PhoenixNAP',
    detail:
      'Angular client and administration portals for Bare Metal Cloud, inside a JavaScript team with ticket, Git and peer-review workflow.',
  },
  {
    year: '2024',
    title: 'Technology & operations, Maison de Parfum',
    detail:
      'Running store operations while building the retail system that replaced the Excel workflows underneath them.',
  },
  {
    year: '2026',
    title: 'Founded Dodi Tech DOOEL',
    detail: 'Independent studio. Discovery to deployed product, for businesses with a real process problem.',
  },
]

/** Scrolling strip along the bottom of the cockpit. */
export const ticker = [
  'DODI TECH DOOEL · SKOPJE',
  'DISCOVERY TO DEPLOYED PRODUCT',
  'ANGULAR · REACT · REACT NATIVE · FIREBASE',
  `${projects.filter((p) => p.status !== 'archived').length} ACTIVE RECORDS`,
  'AVAILABLE FOR NEW ENGAGEMENTS',
]
