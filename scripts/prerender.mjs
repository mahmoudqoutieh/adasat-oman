// Injects the server-rendered app into dist/index.html so the first paint is
// instant and crawlers see real content. Runs after `vite build` + SSR build.
import { readFile, rm, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const { render } = await import(pathToFileURL(path.join(root, "dist-ssr/entry-server.js")).href);

const indexPath = path.join(root, "dist/index.html");
const siteUrl = (process.env.SITE_URL ?? "").replace(/\/$/, "");
let html = await readFile(indexPath, "utf8");

html = html.replace("<!--app-html-->", render());
html = html.replaceAll("%SITE_URL%", siteUrl);
if (siteUrl) {
  html = html.replace(
    "</head>",
    `    <link rel="canonical" href="${siteUrl}/" />\n    <meta property="og:url" content="${siteUrl}/" />\n  </head>`,
  );
}

await writeFile(indexPath, html);
await rm(path.join(root, "dist-ssr"), { recursive: true, force: true });
console.log("prerendered dist/index.html" + (siteUrl ? ` for ${siteUrl}` : " (SITE_URL not set)"));
