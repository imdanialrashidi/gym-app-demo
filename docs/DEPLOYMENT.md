# Deploying Amir’s Gym to GitHub Pages

This project is configured for a **GitHub Pages custom domain** at:

```text
https://gym-app-demo.danialrashidi.ir/
```

Repository: `imdanialrashidi/gym-app-demo`

Default branch: `main`

No server, database, secrets, or environment variables are required.

## 1. Repository settings

In the GitHub repository:

1. Go to **Settings → Pages**.
2. Under **Build and deployment**, choose **Source: GitHub Actions**.
3. Do not choose “Deploy from a branch”; the committed workflow builds and uploads `dist/`.
4. Confirm `main` is the default branch under **Settings → General**.
5. Set **Custom domain** to `gym-app-demo.danialrashidi.ir` (the committed `public/CNAME`
   keeps it in the artifact) and enable **Enforce HTTPS**.
6. Actions must be enabled for the repository. No personal access token is needed.

The workflow uses the automatically provided `GITHUB_TOKEN` with these permissions:

- Build job: `contents: read`
- Deploy job: `pages: write`, `id-token: write`
- Environment: `github-pages`

## 2. Deploy

The workflow [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) runs on:

- pushes to `main`
- manual `workflow_dispatch`

To launch a deployment manually:

1. Open **Actions**.
2. Select **Deploy Amir’s Gym to GitHub Pages**.
3. Choose **Run workflow**, select `main`, and confirm.
4. Open the completed `github-pages` environment deployment to get the site URL.

Expected URL:

```text
https://gym-app-demo.danialrashidi.ir/
```

## 3. Base path behavior

The site is served from the **root** of the custom domain, so Vite’s base is `/`:

- `vite.config.ts` defaults to `/`.
- The workflow pins `VITE_BASE_PATH: /` so the deployed HTML references `/assets/...`,
  `/media/...` and `/favicon.svg` at the domain root.

### Why this matters

A base of `/gym-app-demo/` on a custom-domain root makes every asset request 404
(`https://gym-app-demo.danialrashidi.ir/gym-app-demo/assets/index-*.js`), which renders a blank
page. That was the production bug fixed here.

### Serving the bare github.io project URL

To preview the `imdanialrashidi.github.io/gym-app-demo/` path instead, build with:

```sh
VITE_BASE_PATH=/gym-app-demo/ npm run build
```

The default (`/`) already matches local development:

```sh
npm run dev
```

## 4. Build contract

The workflow runs the verified project commands:

```sh
npm ci --no-audit --no-fund
npm test
npm run build
```

`npm run build` executes `tsc -b && vite build` and writes the static site to `dist/`.
The artifact step uploads `./dist` including `.nojekyll`.

## 5. Routing and refresh behavior

Navigation uses hash routes:

```text
/#/
/#/workouts
/#/progress
/#/session
```

The fragment is never sent to GitHub Pages, so browser refresh and direct links resolve to
`index.html` without needing a server rewrite or a `404.html` SPA fallback.

## 6. Post-deploy verification

After the first successful deployment:

- Load `/` and verify the hero photograph loads.
- Switch between فارسی and EN with the header toggle and refresh: the choice persists.
- Open `#/workouts`, refresh, and verify the route survives.
- Open `#/progress`, refresh, and verify lazy-loaded JavaScript and the chart render.
- Start a workout, log a set, refresh, and verify the active session returns.
- Finish the session and verify the recent activity row appears.
- Use **Reset demo data** and verify seed data returns.
- Test a phone-sized viewport at 390px and confirm the fixed tab bar and hero CTA do not overlap.

A successful local build does not prove the remote deployment succeeded. Confirm the workflow run
and the page URL in GitHub before treating the site as published.

## 7. Authorization

Nothing in this repository authorizes a commit, push, or deployment by itself. Publish only after
explicit approval.
