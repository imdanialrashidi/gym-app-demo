# Amir’s Gym

**فراتر از حدها بساز. / BUILD BEYOND LIMITS.**

A photo-led, animation-driven bodybuilding training demo built as a mobile-first, bilingual web
app. It ships a cinematic dashboard, three complete Push/Pull/Legs programs, an interactive live
workout logger, and local progress analytics — with no backend, accounts, or runtime secrets.

The interface is Persian-first (RTL, Vazirmatn) with a full English version one tap away; the
choice is saved in `localStorage`.

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

The dev server serves the app from the root, matching the custom domain. To preview the bare
GitHub Pages project path instead:

```sh
VITE_BASE_PATH=/gym-app-demo/ npm run dev
```

### Verification commands

Run these from the repository root:

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

`npm run build` runs the TypeScript project build and emits the static site to `dist/`. The preview
server serves it at:

```text
http://localhost:4173/
```

## GitHub Pages deployment

The site is published to the custom domain:

```text
https://gym-app-demo.danialrashidi.ir/
```

The build uses Vite’s base `/` (the workflow pins `VITE_BASE_PATH: /`). Building with
`/gym-app-demo/` on a custom-domain root makes every asset 404 and the page render blank — if the
domain ever goes white again, check that base first.

The app uses **hash-based routing** (`#/workouts`, `#/progress`, `#/session`). Refreshing a deep
link never requires a server-side rewrite.

### Required repository settings

1. Push the repository to GitHub with `main` as the default branch (not done by this build).
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

The workflow pins the base to the custom-domain root:

```yaml
VITE_BASE_PATH: /
```

`public/CNAME` keeps `gym-app-demo.danialrashidi.ir` attached to the Pages artifact, and
**Settings → Pages → Custom domain** should match it with HTTPS enforced.

For a **user root site** (`<username>.github.io`) or a different **custom domain**, the base stays
`/`; only the CNAME, the canonical/Open Graph URLs in `index.html`, and DNS change.

Also update the absolute Open Graph image URLs in `index.html` if the public origin changes. See
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the full checklist and verification steps.

### Asset paths

- Vite’s `base` is `/` by default and can be overridden with `VITE_BASE_PATH`.
- Runtime image URLs come from `import.meta.env.BASE_URL`.
- The hero images are preloaded with Vite’s `%BASE_URL%` substitution.
- Font files are bundled by Vite with hashed URLs.
- `public/.nojekyll` is published by the workflow with `include-hidden-files: true`.
- `public/site.webmanifest` uses relative `start_url`, `scope`, and icon paths.

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
- GitHub Pages deployment was prepared but not pushed or published from this workspace.
