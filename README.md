# Amir’s Gym

**فراتر از حدها بساز. / BUILD BEYOND LIMITS.**

A photo-led, animation-driven bodybuilding training demo built as a mobile-first, bilingual web
app. It ships a cinematic dashboard, three complete Push/Pull/Legs programs, an interactive live
workout logger, and local progress analytics — with no backend, accounts, or runtime secrets.

The interface is Persian-first (RTL, Vazirmatn) with a full English version one tap away; the
choice is saved in `localStorage`.

## Site layout

The deployed site has two parts:

| URL | What it is |
| --- | --- |
| `https://gym-app-demo.danialrashidi.ir/` | A static, Persian-first landing page that introduces the demo, its features, screenshots, and the download. |
| `https://gym-app-demo.danialrashidi.ir/app/` | The React training app. Hash routes live under this path (`/app/#/workouts`, `/app/#/progress`, `/app/#/session`). |

The landing is plain HTML/CSS/JS in [`landing/`](landing/) and is composed with the app by
`npm run build:site`. The app itself still runs at `/` during local development.

> Amir’s Gym is a fictional product demo. Its training data, athlete, and records are sample data,
> not medical or coaching advice. Finished sessions and active timer state live only in the
> visitor’s browser via `localStorage`.

## What is in the demo

- **Home** — full-bleed editorial hero, personalized greeting, working start/resume CTA, animated
  weekly volume chart, streak and consistency modules, photo program rail, and a field-note section.
- **Workouts** — today’s split, expandable Push/Pull/Legs cards, exercise library with search and
  muscle filters, exercise detail sheets, coach cues, and editable working sets.
- **Live session** — persisted workout timer with pause/resume, editable weight and reps, per-set
  completion, exercise jump navigation, saved progress, finish review, a celebration state, and a
  guarded discard path.
- **Progress** — 7D / 4W / 12W filters, animated Recharts volume graph, matched-period comparison,
  animated personal records, weekly consistency visualization, and expandable recent sessions.
- **Demo utilities** — reset-to-seed with confirmation, browser-local persistence, corrupt-storage
  fallback, photo credits, and reduced-motion support.

The interface is designed for a 390px phone first, with safe-area awareness, a fixed mobile tab
bar, 44px+ primary touch targets, keyboard-safe search, and a desktop composition that adds a
top navigation and editorial side panel without compromising the mobile layout.

## Stack

- [React 19](https://react.dev/) + TypeScript
- [Vite 8](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/) with custom component CSS
- [Motion for React](https://motion.dev/) for interface motion
- [Lucide React](https://lucide.dev/) icons
- [Recharts](https://recharts.org/) on the lazy-loaded Progress route
- [Vitest](https://vitest.dev/) for focused state, persistence, and selector tests
- Dependency-free HTML/CSS/JS for the landing page in `landing/`

No UI framework or analytics SDK is included. All fonts and photographs are served locally.

## Run locally

Requires Node.js **>= 22.12**.

```sh
npm ci
npm run dev
```

Open:

```text
http://localhost:5173/
```

The dev server serves the app from the root. To preview the composed site (landing at `/`, app at
`/app/`) exactly as GitHub Pages receives it:

```sh
npm run build:site
npm run preview:site
```

Open `http://localhost:4175/`.

### Verification commands

Run these from the repository root:

```sh
npm run typecheck
npm test
npm run build
npm run build:site
```

`npm run build` emits the app-only static build to `dist/`. `npm run build:site` builds the app
with Vite base `/app/` into `dist-app/`, copies `landing/` to `dist/`, and places the app under
`dist/app/`. The preview server for the app build serves it at:

```text
http://localhost:4173/
```

## GitHub Pages deployment

The site is published to the custom domain:

```text
https://gym-app-demo.danialrashidi.ir/
```

The root is the landing page. The app is built with Vite base `/app/` and published at
`https://gym-app-demo.danialrashidi.ir/app/`. The workflow runs `npm run build:site`, which builds
both parts into `dist/`; the Pages artifact is that directory.

The app uses **hash-based routing** (`/app/#/workouts`, `/app/#/progress`, `/app/#/session`).
Refreshing a deep link never requires a server-side rewrite.

### Required repository settings

1. `main` is the default branch.
2. Open the repository and go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. If this is the first deployment, open **Actions** and allow Actions to run; no secrets are
   required.
5. Run the **Deploy Amir’s Gym to GitHub Pages** workflow automatically on a push to `main`, or
   manually via **Actions → Deploy Amir’s Gym to GitHub Pages → Run workflow**.
6. The workflow publishes `dist/` with the official Pages actions and reports the page URL in the
   deployment environment.

The committed workflow is [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). It uses
least-privilege job permissions (`contents: read` for the build; `pages: write` and
`id-token: write` only for deployment), pinned action commit SHAs, the `github-pages` environment,
and a non-cancelling Pages concurrency group.

`public/CNAME` keeps `gym-app-demo.danialrashidi.ir` attached to the Pages artifact, and
**Settings → Pages → Custom domain** should match it with HTTPS enforced.

For a **different custom domain**, update the landing’s canonical/Open Graph URLs in
`landing/index.html`, the app’s canonical/OG URLs in `index.html`, the CNAME, and DNS. The Vite
base stays `/app/` because the app lives under `/app/` on the deployed origin.

Also update the absolute Open Graph image URLs in `index.html` if the public origin changes. See
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the full checklist and verification steps.

### Asset paths

- `landing/` references the app’s images at `/app/media/...`; the composed build guarantees they
  exist.
- The app is built with `--base=/app/`, so its JS, CSS, fonts, and media resolve under `/app/`.
- `public/CNAME`, `public/.nojekyll`, and `public/robots.txt` are copied to the deployment root.
- `sitemap.xml` is generated by `scripts/build-site.mjs` and lists `/` and `/app/`.
- `public/site.webmanifest` uses relative `start_url`, `scope`, and icon paths under `/app/`.

## Architecture notes

```text
src/
  App.tsx                  app shell, hash routes, code splitting, settings sheet
  pages/                   Home, Workouts, Session, Progress
  components/              chrome, responsive photography, sheets, motion primitives
  demo/data.ts             programs, exercise library, seed metadata, credits
  demo/state.ts            typed reducer, validation, localStorage, session records
  demo/selectors.ts        weekly/streak/chart/record aggregation
  demo/AppState.tsx        provider, timer hook, start-training hook
  lib/                     base-aware media helpers, hash router, time formatting
landing/                   static Persian landing page (HTML, CSS, JS, screenshots, fonts)
scripts/build-site.mjs     composes dist/ from landing/ and the /app build
public/media/              locally optimized AVIF/WebP/JPG photography + app icons
```

### Demo state

- Storage key: `rep-lab-demo-v1`
- Seed data is generated relative to the current date so the dashboard remains plausible over time.
- Invalid JSON, unsupported schema, malformed sessions, and an invalid active session are handled
  without crashing the UI.
- Completed sessions, logged sets, active timer state, and updated records persist across refresh.
- Reset demo is available in the avatar menu and restores the seed state.
- A session with no logged sets can be discarded through **Finish session → Discard this session**;
  logged sessions are saved before celebration.

### Motion and accessibility

- Motion respects `prefers-reduced-motion` through `MotionConfig` and explicit checks.
- Confetti, parallax, count-ups, and chart animation are disabled for reduced motion.
- The bottom sheet traps focus, closes with `Escape`, restores focus, and locks background scroll.
- The mobile tab bar hides while a text search input is focused so the on-screen keyboard does not
  cover it.
- Images use reserved dimensions/aspect ratios, and below-the-fold photos lazy-load.

## Photography and fonts

Photography is sourced from Unsplash and stored locally as optimized AVIF/WebP assets. See
[`CREDITS.md`](CREDITS.md) for every photographer, photo link, and license. In-app credits and
license links are available from the avatar button → **Photography**.

Anton, Manrope, and Instrument Serif are self-hosted under the SIL Open Font License. Their OFL
files are in `src/assets/fonts/`.

## Limitations

- Frontend-only demo: no backend, authentication, payments, sync, or AI integration.
- Data is per-browser and per-origin; clearing site data removes the demo state.
- Sample records and history are fictional. The in-app workout plan is for demonstration only.
- Published by GitHub Actions on pushes to `main`; a local build alone does not prove the remote
  deployment succeeded.
