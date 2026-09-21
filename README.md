# DodiTech Portfolio

A single-screen HUD cockpit for Florent Fejzula / DodiTech. The reactor at the
centre is mounted once and never unmounts — panels open in front of it and it
recedes — so navigation costs nothing and the interface holds 60fps throughout.

React 19 · TypeScript · Vite 8 · Tailwind 4 · Canvas 2D · Firebase Hosting

---

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # serve the built output
```

---

## Editing the content

**Everything a visitor reads lives in [`src/data/profile.ts`](src/data/profile.ts).**
No component changes are needed to add a project, change a skill level, or
update a link. The file is typed, so a mistake shows up as a red squiggle
rather than a blank panel.

| Export | What it drives |
| --- | --- |
| `identity` | Name, title, location, tagline, intro paragraphs, availability |
| `contact` | Email and social links |
| `stats` | The four counters on the idle screen and the About panel |
| `services` | The Services list in the left rail |
| `projects` | The archive, the project index, the dossiers, and the radar blips |
| `stackGroups` | The capability meters |
| `timeline` | The career trace on the About panel |
| `ticker` | The scrolling strip along the bottom |

### Adding a project

Append to the `projects` array. `id` becomes the deep link (`#/projects/<id>`),
so keep it short and stable — a link you have sent to a client should not break.

```ts
{
  id: 'northwind',
  name: 'Northwind Portal',
  role: 'Full build',
  summary: 'One paragraph. What it is, who it is for, what was hard.',
  year: '2026',
  status: 'live',              // live | shipped | in-flight | archived
  stack: ['React', 'Go', 'PostgreSQL'],
  metrics: [                    // optional, keep to exactly three
    { label: 'Load time', value: '0.8s' },
    { label: 'Active users', value: '2.1k' },
    { label: 'Uptime', value: '99.9%' },
  ],
  image: '/shots/northwind.png', // optional, put the file in public/
  links: [{ label: 'Live site', href: 'https://…' }],
  progress: 100,
}
```

Screenshots go in `public/` and are referenced from the project root
(`/shots/name.png`). Export them at roughly 16:10 or wider; they render at the
full width of the dossier's left column.

---

## The contact form

Out of the box the form opens the visitor's mail client with the message
pre-filled. That works on day one with no backend.

To collect messages in Firestore instead, copy `.env.example` to `.env` and
fill in the four values from your Firebase console:

```
VITE_FIREBASE_API_KEY=…
VITE_FIREBASE_AUTH_DOMAIN=…
VITE_FIREBASE_PROJECT_ID=…
VITE_FIREBASE_APP_ID=…
```

Submissions land in an `enquiries` collection. The Firebase SDK is imported
dynamically, so when the env vars are absent none of it reaches the bundle a
visitor downloads.

You will also need a Firestore rule that allows anonymous creates but no reads:

```
match /enquiries/{id} {
  allow create: if request.resource.data.keys().hasOnly(
    ['name','email','company','body','receivedAt','referrer','locale']
  );
  allow read, update, delete: if false;
}
```

---

## Deploying

```bash
npm run build
firebase login          # once
firebase use --add      # once, pick the project
firebase deploy --only hosting
```

`firebase.json` is already set up: SPA rewrites for hash routes, immutable
caching on hashed assets and fonts, and `no-cache` on `index.html` so a deploy
is live immediately.

### Social preview image

`public/og.png` is a real screenshot of the idle screen. Regenerate it after a
visual change by running the dev server and capturing
`http://localhost:5173/#/` at 1200×630.

---

## How it is put together

```
src/
  data/profile.ts          all content — the only file you normally edit
  lib/
    frameBus.ts            one shared rAF loop for every animated surface
    useCanvas.ts           DPR-correct canvas wiring + reduced-motion handling
    telemetry.ts           real device metrics, sampled at 2Hz
    useRoute.ts            hash routing
    math.ts                deterministic noise and polar helpers
  components/
    canvas/                ReactorCore, Backdrop, Waveform, Sparkline
    hud/                   primitives, rails, bars, navigation
    panels/                one file per section
    stage/                 the panel container and the reactor mount
    boot/                  the startup sequence
  styles/
    tokens.css             colour, type and rhythm — change the palette here
    hud.css                the visual language: notched panels, meters, motion
```

### Three decisions worth knowing about

**One frame loop.** Every canvas subscribes to `frameBus` rather than calling
`requestAnimationFrame` itself. Ten independent loops is how a page like this
starts dropping frames. The loop parks itself when the tab is hidden.

**Glow without `shadowBlur`.** The reactor strokes every path twice — wide and
faint, then tight and bright. It looks the same as a blurred shadow and costs
roughly a tenth as much, which is why this runs on integrated graphics.

**Real telemetry.** The rails show actual frame rate, paint cost, heap,
network quality and battery. Where a browser will not expose a value the panel
prints `N/A` instead of inventing one.

### Accessibility

Navigation is real buttons and links, so it works from the keyboard. `1`–`5`
jump between sections and `Escape` returns to the idle screen. Every canvas is
`aria-hidden` — they are decoration, and nothing is communicated only through
them. `prefers-reduced-motion` freezes the animation loops and paints each
surface once; the composition survives, the motion does not.
