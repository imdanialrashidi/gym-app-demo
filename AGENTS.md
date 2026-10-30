# Amir’s Gym project instructions

## What this project is

Amir’s Gym (formerly REP//LAB) is a frontend-only, mobile-first, bilingual bodybuilding training
demo. It contains a cinematic home dashboard, Push/Pull/Legs programs, a live workout logger, and
local progress analytics. Persian is the default language; English is one toggle away. There is no
backend, authentication, or external API integration.

## Stack and commands

- React 19 + TypeScript + Vite 8
- Tailwind CSS 4 (plus hand-authored component CSS in `src/index.css`)
- Motion for React, Lucide React, Recharts (lazy-loaded with the Progress route)
- Vitest for state/selector tests
- Package manager: npm

Run commands from the repository root:

| Purpose | Command |
| --- | --- |
| Install | `npm ci` |
| Run locally | `npm run dev` |
| Type check | `npm run typecheck` |
| Unit tests | `npm test` |
| App-only production build | `npm run build` |
| Deployed-site build (landing + app) | `npm run build:site` |
| Preview app build | `npm run preview` |
| Preview composed site | `npm run preview:site` |

The deployed site is a landing page at the root of the custom domain
(`https://gym-app-demo.danialrashidi.ir/`) with the React demo at `/app/`. The landing lives in
`landing/` as dependency-free HTML/CSS/JS. `npm run build:site` builds the app with Vite’s base
`/app/`, then composes `dist/` from `landing/` and the app build. Keep `/app/` links and
`/app/media/...` asset paths intact.

Copy is bilingual: English strings are the source and every new string needs a Persian twin via
`t('English', 'فارسی')` from `src/lib/i18n.tsx`. Persian layout runs RTL and uses Vazirmatn.

## Working rules

- Keep the mobile 390px experience primary. Test at 320, 360, 390, 430, 768, and 1440px.
- The landing page has its own visual language in `landing/`; do not add a framework or build
  dependency to it. Keep it static and reduce motion through CSS/`prefers-reduced-motion`.
- Preserve safe-area handling and do not place interactive content under the fixed mobile tab bar.
- Demo state lives in `localStorage` under `rep-lab-demo-v1`. Never replace persistence with
  in-memory-only state or add a backend.
- Keep imagery local under `public/media`, use the AVIF/WebP sources, and update `CREDITS.md`
  and the in-app credits when adding photography.
- Respect `prefers-reduced-motion`; use transform/opacity motion and avoid continuous animation.
- Do not commit, push, deploy, or publish without explicit user authorization.

See `README.md` for product and deployment documentation and `docs/DEPLOYMENT.md` for the exact
GitHub Pages setup.
