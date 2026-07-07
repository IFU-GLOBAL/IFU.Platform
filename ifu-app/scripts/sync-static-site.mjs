import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(appRoot, "..");
const sourceRoot = resolve(repoRoot, "ifu-static-site", "dist");
const publicRoot = resolve(appRoot, "public");

if (!existsSync(sourceRoot)) {
  throw new Error(`Static site export not found at ${sourceRoot}`);
}

mkdirSync(publicRoot, { recursive: true });

const discoveryNavItem =
  '<li id="menu-item-ifu-discovery" class="menu-item menu-item-type-custom megamenu-hide menu-item-ifu-discovery"><a href="/discovery">Discovery Center</a></li>';
const navClosingPattern = /(<\/ul><\/div>\s*<\/nav><!-- \/.main-header__nav -->)/;
const injectedDiscoveryNavPattern =
  /<li id="menu-item-ifu-discovery"[^>]*><a href="[^"]*">Discovery Center<\/a><\/li>/;
const headerActionsPattern =
  /<h4 class="main-header__call__number">[\s\S]*?<span class="elementor-button-text">Join IFU<\/span>[\s\S]*?<\/h4><!-- \/.main-header__call__number -->/;
const headerActionsHtml = `<h4 class="main-header__call__number">
  <span class="ifu-header-action-links">
    <a href="/login">Login</a>
    <span aria-hidden="true">&nbsp; | &nbsp;</span>
    <a class="elementor-button elementor-button-link elementor-size-sm" href="/discovery#preview-application">
      <span class="elementor-button-content-wrapper">
        <span class="elementor-button-text">Join IFU</span>
      </span>
    </a>
  </span>
</h4><!-- /.main-header__call__number -->`;
const joinButtonHrefPattern =
  /(<a class="elementor-button elementor-button-link elementor-size-sm" href=")[^"]*(">\s*<span class="elementor-button-content-wrapper">\s*<span class="elementor-button-text">Join IFU<\/span>)/g;

function updateStaticHtml(filePath) {
  const html = readFileSync(filePath, "utf8");
  let updatedHtml = html;

  if (updatedHtml.includes("menu-item-ifu-discovery")) {
    updatedHtml = updatedHtml.replace(injectedDiscoveryNavPattern, discoveryNavItem);
  } else {
    updatedHtml = updatedHtml.replace(navClosingPattern, `${discoveryNavItem}\n$1`);
  }

  updatedHtml = updatedHtml
    .replace(headerActionsPattern, headerActionsHtml)
    .replace(joinButtonHrefPattern, "$1/discovery#preview-application$2");

  if (updatedHtml === html) {
    return false;
  }

  writeFileSync(filePath, updatedHtml);
  return true;
}

function updateStaticHtmlFiles(directory) {
  let updateCount = 0;

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      updateCount += updateStaticHtmlFiles(entryPath);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".html")) {
      updateCount += updateStaticHtml(entryPath) ? 1 : 0;
    }
  }

  return updateCount;
}

for (const entry of readdirSync(sourceRoot, { withFileTypes: true })) {
  if (entry.name === ".DS_Store") {
    continue;
  }

  const sourcePath = resolve(sourceRoot, entry.name);
  const destinationPath = resolve(publicRoot, entry.name);

  rmSync(destinationPath, { recursive: true, force: true });
  cpSync(sourcePath, destinationPath, { recursive: true, force: true });
}

console.log(
  `Synced static marketing site from ${relative(appRoot, sourceRoot)} to ${relative(
    appRoot,
    publicRoot,
  )}.`,
);

const updatedCount = updateStaticHtmlFiles(publicRoot);
console.log(`Updated static navigation and account links in ${updatedCount} HTML files.`);
