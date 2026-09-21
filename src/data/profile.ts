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
      { label: 'Repo', href: 'https://github.com/florent-fejzula/combo-mk' },
    ],
    // Distance to a production release, not to the demo scope — the demo
    // itself is complete. Order submission, accounts, live loyalty and
    // push notifications are the remainder.
    progress: 40,
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
