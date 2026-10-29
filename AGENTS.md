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
| Production build | `npm run build` |
| Preview build | `npm run preview` |

The app is served from the root of the custom domain
(`https://gym-app-demo.danialrashidi.ir/`). Use `VITE_BASE_PATH=/gym-app-demo/` only when building
for the bare `imdanialrashidi.github.io/gym-app-demo/` project-site URL.

Copy is bilingual: English strings are the source and every new string needs a Persian twin via
`t('English', 'فارسی')` from `src/lib/i18n.tsx`. Persian layout runs RTL and uses Vazirmatn.

## Working rules

- Keep the mobile 390px experience primary. Test at 320, 360, 390, 430, 768, and 1440px.
- Preserve safe-area handling and do not place interactive content under the fixed mobile tab bar.
- Demo state lives in `localStorage` under `rep-lab-demo-v1`. Never replace persistence with
  in-memory-only state or add a backend.
- Keep imagery local under `public/media`, use the AVIF/WebP sources, and update `CREDITS.md`
  and the in-app credits when adding photography.
- Respect `prefers-reduced-motion`; use transform/opacity motion and avoid continuous animation.
- Do not commit, push, deploy, or publish without explicit user authorization.

See `README.md` for product and deployment documentation and `docs/DEPLOYMENT.md` for the exact
GitHub Pages setup.
