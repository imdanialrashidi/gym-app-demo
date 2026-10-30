import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Composes the deployed site:
 *   /            → landing page (landing/)
 *   /app/        → the React demo built by Vite with base "/app/"
 *
 * GitHub Pages still serves the custom domain from the root, while the app
 * remains live at /app/ with hash routes.
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const appDist = path.join(root, "dist-app");
const landing = path.join(root, "landing");
const publicDir = path.join(root, "public");

if (dist === root || path.dirname(dist) !== root) {
  throw new Error(`Refusing to clean unexpected path: ${dist}`);
}
if (!existsSync(path.join(landing, "index.html"))) {
  throw new Error("landing/index.html is missing");
}
if (!existsSync(path.join(appDist, "index.html"))) {
  throw new Error("dist-app/index.html is missing; build the app first");
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

await cp(landing, dist, { recursive: true });
await cp(path.join(publicDir, "CNAME"), path.join(dist, "CNAME"));
await cp(path.join(publicDir, ".nojekyll"), path.join(dist, ".nojekyll"));
await cp(path.join(publicDir, "robots.txt"), path.join(dist, "robots.txt"));
await cp(appDist, path.join(dist, "app"), { recursive: true });

const appHtmlPath = path.join(dist, "app", "index.html");
const appHtml = await readFile(appHtmlPath, "utf8");
if (!appHtml.includes("/app/assets/")) {
  throw new Error("App HTML does not reference /app/assets/ — base path is wrong");
}
if (!existsSync(path.join(dist, "app", "assets"))) {
  throw new Error("App assets were not copied to /app/assets/");
}

await writeFile(
  path.join(dist, "robots.txt"),
  [
    "User-agent: *",
    "Allow: /",
    "",
    "Sitemap: https://gym-app-demo.danialrashidi.ir/sitemap.xml",
    "",
  ].join("\n"),
);

await writeFile(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://gym-app-demo.danialrashidi.ir/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://gym-app-demo.danialrashidi.ir/app/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
`,
);

await rm(appDist, { recursive: true, force: true });

console.log("Built site:");
console.log("  /       landing");
console.log("  /app/   Amir’s Gym app");
