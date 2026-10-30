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

## 3. Site layout and base paths

The artifact has two parts:

```text
/            static landing page from landing/
/app/        React app built with Vite base /app/
```

The landing references app photography as `/app/media/...`. The app’s JS, CSS, fonts, and media
all resolve under `/app/`. Keep those paths in sync when editing either side.

`npm run build:site` performs the composition:

1. `vite build --base=/app/ --outDir=dist-app`
2. copy `landing/` to `dist/`
3. copy `dist-app/` to `dist/app/`
4. copy `public/CNAME`, `public/.nojekyll`, `public/robots.txt`, and generate `sitemap.xml`

There is no longer a root-level `/assets/` app bundle; the app bundle lives at `/app/assets/`.

### Serving the bare github.io project URL

The custom domain is the supported target. Serving the site from
`imdanialrashidi.github.io/gym-app-demo/` would require rebuilding both the landing links and the
app base for `/gym-app-demo/`; the committed workflow targets the custom-domain root.

## 4. Build contract

The workflow runs the verified project commands:

```sh
npm ci --no-audit --no-fund
npm test
npm run build:site
```

`npm run build:site` executes the TypeScript build and the app Vite build with base `/app/`, then
composes the landing and app into `dist/`. The artifact step uploads `./dist` including hidden
files such as `.nojekyll`.

## 5. Routing and refresh behavior

The app uses hash routes under `/app/`:

```text
/app/#/
/app/#/workouts
/app/#/progress
/app/#/session
```

The fragment is never sent to GitHub Pages, so browser refresh and direct links resolve to
`/app/index.html` without needing a server rewrite or a `404.html` SPA fallback. The landing is a
static `/index.html` with in-page anchors.

## 6. Post-deploy verification

After a successful deployment:

- Load `/` and verify the landing hero photograph, fonts, and screenshots load.
- Confirm the landing’s **ورود به اپ** buttons reach `/app/`.
- Open `/app/`, verify the hero photograph loads, and switch between فارسی and EN: the choice
  persists on refresh.
- Open `/app/#/workouts`, refresh, and verify the route survives.
- Open `/app/#/progress`, refresh, and verify lazy-loaded JavaScript and the chart render.
- Start a workout, log a set, refresh, and verify the active session returns.
- Finish the session and verify the recent activity row appears.
- Use **Reset demo data** and verify seed data returns.
- Click **دانلود از گیت‌هاب** on the landing and confirm the GitHub ZIP downloads.
- Test a phone-sized viewport at 390px and confirm the landing CTAs, app fixed tab bar, and hero
  content do not overlap.

A successful local build does not prove the remote deployment succeeded. Confirm the workflow run
and the page URL in GitHub before treating the site as published.

## 7. Authorization

Nothing in this repository authorizes a commit, push, or deployment by itself. Publish only after
explicit approval.
