# Deploying REP//LAB to GitHub Pages

This project is configured for a **GitHub Pages project site** at:

```text
https://imdanialrashidi.github.io/gym-app-demo/
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
5. Actions must be enabled for the repository. No personal access token is needed.

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
2. Select **Deploy REP//LAB to GitHub Pages**.
3. Choose **Run workflow**, select `main`, and confirm.
4. Open the completed `github-pages` environment deployment to get the site URL.

Expected URL:

```text
https://imdanialrashidi.github.io/gym-app-demo/
```

## 3. Base path behavior

Vite's default base is `/gym-app-demo/`. The workflow computes the project-site base from the
repository name unless a repository variable overrides it:

```yaml
VITE_BASE_PATH: ${{ vars.VITE_BASE_PATH || format('/{0}/', github.event.repository.name) }}
```

For a **root site** or **custom domain**:

1. Go to **Settings → Secrets and variables → Actions → Variables**.
2. Add `VITE_BASE_PATH` with value `/`.
3. Re-run the deploy workflow.
4. Configure the custom domain under **Settings → Pages → Custom domain**.
5. Update the absolute Open Graph/Twitter image URLs in `index.html` to the new origin.

For local development with a root base:

```sh
VITE_BASE_PATH=/ npm run dev
VITE_BASE_PATH=/ npm run build
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
/gym-app-demo/#/
/gym-app-demo/#/workouts
/gym-app-demo/#/progress
/gym-app-demo/#/session
```

The fragment is never sent to GitHub Pages, so browser refresh and direct links resolve to
`index.html` without needing a server rewrite or a `404.html` SPA fallback.

## 6. Post-deploy verification

After the first successful deployment:

- Load `/gym-app-demo/` and verify the hero photograph loads.
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
