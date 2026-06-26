import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(projectRoot, "..");
const sourceDir = path.join(repoRoot, "internationalfarmunion.com");
const distDir = path.join(projectRoot, "dist");

const excludedNames = new Set([".DS_Store"]);

function shouldCopy(sourcePath) {
  const baseName = path.basename(sourcePath);
  if (excludedNames.has(baseName)) return false;
  return true;
}

async function mirrorExport() {
  if (!existsSync(sourceDir)) {
    throw new Error(`Missing source export: ${sourceDir}`);
  }

  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
  await cp(sourceDir, distDir, {
    recursive: true,
    filter: (sourcePath) => shouldCopy(sourcePath),
  });
}

async function addHomeRoute() {
  const sourceHome = path.join(distDir, "home.html");
  const fallbackHome = path.join(distDir, "index.html");
  const homeFile = existsSync(sourceHome) ? sourceHome : fallbackHome;
  const homeDir = path.join(distDir, "home");
  const homeIndex = path.join(homeDir, "index.html");
  let html = await readFile(homeFile, "utf8");

  // /home/index.html is nested one level below the original root page.
  // A base tag preserves the original root-relative behavior of exported assets and links.
  if (!html.includes("<base href=\"../\">")) {
    html = html.replace(/<head>/i, "<head>\n\t<base href=\"../\">");
  }

  await mkdir(homeDir, { recursive: true });
  await writeFile(homeIndex, html, "utf8");
}

async function addFallbacks() {
  const indexHtml = await readFile(path.join(distDir, "index.html"), "utf8");
  await writeFile(path.join(distDir, "404.html"), indexHtml, "utf8");
}

async function collectHtmlRoutes(dir = distDir, routes = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectHtmlRoutes(fullPath, routes);
      continue;
    }
    if (entry.name !== "index.html") continue;
    const route = `/${path.relative(distDir, path.dirname(fullPath)).split(path.sep).filter(Boolean).join("/")}`;
    routes.push(route === "/" ? "/" : `${route}/`);
  }
  return routes;
}

async function writeSitemap() {
  const routes = await collectHtmlRoutes();
  routes.sort();
  const sitemap = routes.map((route) => `https://internationalfarmunion.com${route}`).join("\n") + "\n";
  await writeFile(path.join(distDir, "sitemap.txt"), sitemap, "utf8");
}

async function main() {
  await mirrorExport();
  await addHomeRoute();
  await addFallbacks();
  await writeSitemap();

  console.log(`Mirrored WordPress export into ${distDir}`);
  console.log("Added /home/ route for https://internationalfarmunion.com/home/");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
