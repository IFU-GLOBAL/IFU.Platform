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
const roleCatalogPath = resolve(appRoot, "src", "lib", "role-catalog.ts");
const publicHomePath = resolve(publicRoot, "index.html");

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
    <a href="/api/auth/login?returnTo=%2Fdashboard">Login</a>
    <span aria-hidden="true">&nbsp; | &nbsp;</span>
    <a class="elementor-button elementor-button-link elementor-size-sm" href="/register">
      <span class="elementor-button-content-wrapper">
        <span class="elementor-button-text">Join IFU</span>
      </span>
    </a>
  </span>
</h4><!-- /.main-header__call__number -->`;
const joinButtonHrefPattern =
  /(<a class="elementor-button elementor-button-link elementor-size-sm" href=")[^"]*(">\s*<span class="elementor-button-content-wrapper">\s*<span class="elementor-button-text">Join IFU<\/span>)/g;
const discoverMoreButtonPattern = /<a href="home\.html#"\s+class="cherito-btn">/g;
const huManityCookiePopupPattern =
  /(?:<!--\s*Cookie Compliance\s*-->\s*)?(?:<!---?\s*Cookie compliance[\s\S]*?)?<link rel=["']dns-prefetch["'] href=["']https:\/\/cdn\.hu-manity\.co\/["']\s*\/>\s*<script[^>]*>var huOptions = [\s\S]*?<\/script>\s*<script[^>]*src=["']https:\/\/cdn\.hu-manity\.co\/hu-banner\.min\.js["'][^>]*><\/script>\s*(?:---?>)?/gi;
const accessibilityWidgetStylesPattern =
  /<link rel='stylesheet' id='ea11y-[^']+'[^>]*>\s*/g;
const accessibilityWidgetScriptPattern =
  /<script id="ea11y-widget-js-extra">[\s\S]*?<\/script>\s*<script id="ea11y-widget-js"[\s\S]*?<\/script>/g;
const accessibilitySkipLinkPattern =
  /<a class="ea11y-skip-to-content-link"[\s\S]*?<div class="ea11y-skip-to-content-backdrop"><\/div>\s*/g;
const socialHrefReplacements = [
  [/href="https:\/\/facebook\.com"/g, 'href="https://facebook.com/IFUPlatform" aria-label="Facebook placeholder"'],
  [/href="https:\/\/twitter\.com"/g, 'href="https://x.com/IFUPlatform" aria-label="X placeholder"'],
  [/href="https:\/\/instagram\.com"/g, 'href="https://instagram.com/IFUPlatform" aria-label="Instagram placeholder"'],
  [/href="https:\/\/youtube\.com"/g, 'href="https://youtube.com/@IFUPlatform" aria-label="YouTube placeholder"'],
  [/href="home\.html#"/g, 'href="https://instagram.com/IFUPlatform" aria-label="Instagram placeholder"'],
];
const staticContentReplacements = [
  [/\bai powered\b/g, "AI-powered"],
  [/\bAI powered\b/g, "AI-powered"],
  [/scalable\.How/g, "scalable. How"],
  [/roles roles/g, "roles"],
  [/Roles roles/g, "Roles"],
  [/Quantum Sphere/g, "AgriSphere"],
  [/Our Ecosystem\. 9 Engines\. One Mission/g, "Our Ecosystem. 10 Engines. One Mission"],
  [/190\+ Countries \| 2M\+ Farmers/g, "Official Placeholder: 190+ Countries | 2M+ Farmers"],
  [/500\+ Partners \| 50\+ Projects/g, "Official Placeholder: 500+ Partners | 50+ Projects"],
  [/(<span class="count-text" data-stop="190" data-speed="1500">)0(<\/span>)/g, "$1190$2"],
  [/(<span class="count-text" data-stop="2" data-speed="1500">)0(<\/span>)/g, "$12$2"],
  [/(<span class="count-text" data-stop="500" data-speed="1500">)0(<\/span>)/g, "$1500$2"],
  [/(<span class="count-text" data-stop="50" data-speed="1500">)0(<\/span>)/g, "$150$2"],
  [
    /function showCountry\(country, lat = null, lon = null\)\{/g,
    `function countryInsightsPath(country){
            const slug = String(country || "")
                .trim()
                .toLowerCase()
                .replace(/&/g, " and ")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");

            return "/country/" + (slug || "global");
        }

        function showCountry(country, lat = null, lon = null){`,
  ],
  [
    /<a href="home\.html#world-map" class="country-popup-link">/g,
    '<a href="${countryInsightsPath(country)}" class="country-popup-link">',
  ],
  [
    /(<li><span style="font-size: 19px;">● AgriCapital <\/span>to access funding and investment pathways<\/li>)(?!<li><span style="font-size: 19px;">● AgriFinance<\/span>)/g,
    '$1<li><span style="font-size: 19px;">● AgriFinance</span> to manage payments, accounting, and financial workflows</li>',
  ],
  [
    /<a href="https:\/\/www\.wpmapplugins\.com\/"[^>]*><tspan fill="#0066cc">wpmapplugins<\/tspan><\/a>/g,
    '<tspan fill="#667085">map source</tspan>',
  ],
];
const mainAgriFinanceNavItem =
  '\n\t<li id="menu-item-ifu-agrifinance" class="menu-item menu-item-type-custom menu-item-object-custom megamenu-hide menu-item-ifu-agrifinance"><a href="/discovery#role-matrix">AgriFinance</a></li>';
const footerAgriFinanceNavItem =
  '\n<li id="menu-item-ifu-agrifinance-footer" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-ifu-agrifinance-footer"><a href="/discovery#role-matrix">AgriFinance</a></li>';
const mainAgriFundsNavItemPattern =
  /(<li id="menu-item-6444" class="menu-item menu-item-type-post_type menu-item-object-page megamenu-hide menu-item-6444"><a href="index\.html%3Fp=6419\.html">AgriFunds<\/a><\/li>)(?!\n\t<li id="menu-item-ifu-agrifinance")/g;
const footerAgriFundsNavItemPattern =
  /(<li id="menu-item-6454" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-6454"><a href="index\.html%3Fp=6419\.html">AgriFunds<\/a><\/li>)(?!\n<li id="menu-item-ifu-agrifinance-footer")/g;
const homepageRoleSectionPattern =
  /<style>\s*\.agrisphere-dashboard \*[\s\S]*?renderRoleTab\(currentRole,currentTab\);\s*<\/script>\s*<\/div>/;

const homePersonas = [
  ["grow-or-produce", "I grow, raise, or harvest", "Farmers, ranchers, fishers, producers, and cooperative members"],
  ["buy-sell-or-move-food", "I buy, sell, process, or move food", "Buyers, importers, exporters, traders, processors, logistics, and storage"],
  ["fund-or-protect-agriculture", "I fund, insure, or invest", "Investors, donors, banks, grant providers, sponsors, and insurance partners"],
  ["teach-research-or-advise", "I teach, research, or advise", "Educators, researchers, agronomists, vets, advisors, data specialists, and trainers"],
  ["govern-or-lead-regions", "I govern, regulate, or lead regions", "Government, institutions, country representatives, compliance, legal, and governance roles"],
  ["support-communities", "I support communities or food security", "NGOs, foundations, volunteers, food security, nutrition, sustainability, and climate roles"],
  ["build-or-tell-the-story", "I build technology or tell the story", "Technology partners, founders, software teams, media, journalists, and creators"],
  ["visit-learn-or-participate", "I want to learn, visit, or participate", "Consumers, visitors, students, supporters, and public participants"],
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseSeedTuples(source, variableName, expectedLength) {
  const startMarker = `const ${variableName} = [`;
  const startIndex = source.indexOf(startMarker);

  if (startIndex === -1) {
    throw new Error(`Unable to find ${variableName} in role catalog.`);
  }

  const contentStart = startIndex + startMarker.length;
  const endIndex = source.indexOf("] as const;", contentStart);

  if (endIndex === -1) {
    throw new Error(`Unable to find the end of ${variableName} in role catalog.`);
  }

  const block = source.slice(contentStart, endIndex);
  const tuples = [];
  const tuplePattern = /^\s*\[(.+)\],?\s*$/gm;

  for (const tupleMatch of block.matchAll(tuplePattern)) {
    const values = [...tupleMatch[1].matchAll(/"((?:\\.|[^"\\])*)"/g)].map((match) =>
      JSON.parse(match[0]),
    );

    if (values.length === expectedLength) {
      tuples.push(values);
    }
  }

  return tuples;
}

function readRoleCatalog() {
  const source = readFileSync(roleCatalogPath, "utf8");
  const categoryRows = parseSeedTuples(source, "categorySeeds", 3);
  const roleRows = parseSeedTuples(source, "roleSeeds", 5);

  if (categoryRows.length === 0 || roleRows.length === 0) {
    throw new Error("Role catalog seed data is empty.");
  }

  return categoryRows.map(([slug, name, summary], categoryIndex) => {
    const roles = roleRows
      .filter(([, , categorySlug]) => categorySlug === slug)
      .map(([roleSlug, roleName, , categoryName, level], roleIndex) => ({
        slug: roleSlug,
        title: roleName,
        categoryName,
        pathway: level,
        sortOrder: roleIndex + 1,
      }));

    return {
      slug,
      name,
      summary,
      sortOrder: categoryIndex + 1,
      roles,
    };
  });
}

function buildHomepageRoleSection() {
  const categories = readRoleCatalog();
  const personaMarkup = homePersonas
    .map(
      ([slug, label, prompt]) => `<a class="ifu-home-persona-card" href="/discovery?persona=${encodeURIComponent(
        slug,
      )}#role-matrix">
        <strong>${escapeHtml(label)}</strong>
        <span>${escapeHtml(prompt)}</span>
      </a>`,
    )
    .join("");
  const categoryMarkup = categories
    .map(
      (category) => `<a class="ifu-home-role-category" href="/discovery#role-matrix">
        <strong>${escapeHtml(category.name)}</strong>
        <span><b>${category.roles.length}</b> roles</span>
      </a>`,
    )
    .join("");

  return `<style>
.ifu-home-role-catalog,
.ifu-home-role-catalog * {
  box-sizing: border-box;
  font-family: Inter, Arial, sans-serif;
}

.ifu-home-role-catalog {
  background: #eef3f8;
  padding: 64px 20px;
}

.ifu-home-role-shell {
  max-width: 1220px;
  margin: 0 auto;
}

.ifu-home-role-intro {
  max-width: 980px;
  margin: 0 auto;
  text-align: center;
}

.ifu-home-role-intro h2 {
  margin: 0;
  color: #08233b;
  font-size: clamp(26px, 3vw, 40px);
  line-height: 1.2;
}

.ifu-home-role-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: center;
  margin: 22px 0;
}

.ifu-home-role-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  border-radius: 999px;
  background: #0b7d35;
  color: #fff !important;
  padding: 0 20px;
  font-weight: 800;
  text-decoration: none !important;
}

.ifu-home-persona-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 24px 0 18px;
}

.ifu-home-persona-card {
  display: flex;
  min-height: 126px;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid rgba(8, 35, 59, .1);
  border-radius: 16px;
  background: #fff;
  padding: 16px;
  color: #08233b !important;
  text-decoration: none !important;
  box-shadow: 0 12px 30px rgba(8, 35, 59, .06);
  transition: transform .2s ease, border-color .2s ease, background .2s ease;
}

.ifu-home-persona-card:hover {
  transform: translateY(-2px);
  border-color: rgba(11, 125, 53, .35);
  background: #f0fbf4;
}

.ifu-home-persona-card strong {
  font-size: 15px;
  line-height: 1.25;
}

.ifu-home-persona-card span {
  margin-top: 12px;
  color: #667085;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
}

.ifu-home-role-categories {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.ifu-home-role-category {
  display: grid;
  min-height: 102px;
  align-content: space-between;
  border: 1px solid rgba(8, 35, 59, .1);
  border-radius: 18px;
  background: #fff;
  padding: 18px;
  color: #08233b !important;
  text-decoration: none !important;
  box-shadow: 0 12px 30px rgba(8, 35, 59, .06);
  transition: transform .2s ease, border-color .2s ease, background .2s ease;
}

.ifu-home-role-category:hover {
  transform: translateY(-2px);
  border-color: rgba(11, 125, 53, .35);
  background: #f0fbf4;
}

.ifu-home-role-category strong {
  display: block;
  font-size: 17px;
  line-height: 1.25;
}

.ifu-home-role-category span {
  display: block;
  margin-top: 14px;
  color: #667085;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.3;
}

.ifu-home-role-category b {
  color: #0b7d35;
  font-size: 18px;
}

@media (max-width: 900px) {
  .ifu-home-persona-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ifu-home-role-categories {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .ifu-home-role-catalog {
    padding: 44px 14px;
  }

  .ifu-home-persona-grid {
    grid-template-columns: 1fr;
  }

  .ifu-home-role-categories {
    grid-template-columns: 1fr;
  }
}
</style>

<section class="ifu-home-role-catalog" aria-labelledby="ifu-home-role-title">
  <div class="ifu-home-role-shell">
    <div class="ifu-home-role-intro">
      <h2 id="ifu-home-role-title">Search and select your IFU roles below</h2>
    </div>
    <div class="ifu-home-persona-grid" aria-label="Choose your IFU role path">
      ${personaMarkup}
    </div>
    <div class="ifu-home-role-controls">
      <a class="ifu-home-role-cta" href="/discovery#role-matrix">View matching roles</a>
    </div>
    <div class="ifu-home-role-categories" aria-label="IFU role category counts">
      <a class="ifu-home-role-category" href="/discovery#role-matrix">
        <strong>All categories</strong>
        <span><b>${categories.length}</b> categories</span>
      </a>
      ${categoryMarkup}
    </div>
  </div>
</section>`;
}

function updateHomepageRoleSection(html) {
  if (!homepageRoleSectionPattern.test(html)) {
    throw new Error("Homepage role section was not found in public/index.html.");
  }

  return html.replace(homepageRoleSectionPattern, buildHomepageRoleSection());
}

function commentOutRegulatoryPopups(html) {
  return html
    .replace(
      huManityCookiePopupPattern,
      "\n<!-- Regulatory cookie/privacy popup disabled for this development milestone. -->\n",
    )
    .replace(
      accessibilityWidgetStylesPattern,
      "<!-- Regulatory accessibility widget stylesheet disabled for this development milestone. -->\n",
    )
    .replace(
      accessibilitySkipLinkPattern,
      "<!-- Regulatory accessibility skip-link overlay disabled for this development milestone. -->\n",
    )
    .replace(
      accessibilityWidgetScriptPattern,
      "<!-- Regulatory accessibility widget script disabled for this development milestone. -->",
    );
}

function addAgriFinancePlatformLinks(html) {
  return html
    .replace(mainAgriFundsNavItemPattern, `$1${mainAgriFinanceNavItem}`)
    .replace(footerAgriFundsNavItemPattern, `$1${footerAgriFinanceNavItem}`);
}

function shouldUpdateStaticTextFile(filePath, fileName) {
  return (
    fileName.endsWith(".html") ||
    fileName.endsWith(".css") ||
    fileName.endsWith(".json") ||
    filePath.includes("/wp-json/")
  );
}

function updateStaticText(filePath) {
  const html = readFileSync(filePath, "utf8");
  let updatedHtml = commentOutRegulatoryPopups(html);

  if (updatedHtml.includes("menu-item-ifu-discovery")) {
    updatedHtml = updatedHtml.replace(injectedDiscoveryNavPattern, discoveryNavItem);
  } else {
    updatedHtml = updatedHtml.replace(navClosingPattern, `${discoveryNavItem}\n$1`);
  }

  updatedHtml = updatedHtml
    .replace(headerActionsPattern, headerActionsHtml)
    .replace(joinButtonHrefPattern, "$1/register$2")
    .replace(
      discoverMoreButtonPattern,
      '<a href="javascript:void(0)" aria-disabled="true" class="cherito-btn">',
    )
    .replaceAll("Watch Video", "Video Coming Soon");

  for (const [pattern, replacement] of socialHrefReplacements) {
    updatedHtml = updatedHtml.replace(pattern, replacement);
  }

  for (const [pattern, replacement] of staticContentReplacements) {
    updatedHtml = updatedHtml.replace(pattern, replacement);
  }

  updatedHtml = addAgriFinancePlatformLinks(updatedHtml);

  if (filePath === publicHomePath) {
    updatedHtml = updateHomepageRoleSection(updatedHtml);
  }

  if (updatedHtml === html) {
    return false;
  }

  writeFileSync(filePath, updatedHtml);
  return true;
}

function updateStaticTextFiles(directory) {
  let updateCount = 0;

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      updateCount += updateStaticTextFiles(entryPath);
      continue;
    }

    if (entry.isFile() && shouldUpdateStaticTextFile(entryPath, entry.name)) {
      updateCount += updateStaticText(entryPath) ? 1 : 0;
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

const updatedCount = updateStaticTextFiles(publicRoot);
console.log(`Updated static navigation, placeholders, and account links in ${updatedCount} text files.`);
