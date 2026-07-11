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
    <a class="elementor-button elementor-button-link elementor-size-sm" href="/api/auth/register?returnTo=%2Fdashboard">
      <span class="elementor-button-content-wrapper">
        <span class="elementor-button-text">Join IFU</span>
      </span>
    </a>
  </span>
</h4><!-- /.main-header__call__number -->`;
const joinButtonHrefPattern =
  /(<a class="elementor-button elementor-button-link elementor-size-sm" href=")[^"]*(">\s*<span class="elementor-button-content-wrapper">\s*<span class="elementor-button-text">Join IFU<\/span>)/g;
const discoverMoreButtonPattern = /<a href="home\.html#"\s+class="cherito-btn">/g;
const socialHrefReplacements = [
  [/href="https:\/\/facebook\.com"/g, 'href="https://facebook.com/IFUPlatform" aria-label="Facebook placeholder"'],
  [/href="https:\/\/twitter\.com"/g, 'href="https://x.com/IFUPlatform" aria-label="X placeholder"'],
  [/href="https:\/\/instagram\.com"/g, 'href="https://instagram.com/IFUPlatform" aria-label="Instagram placeholder"'],
  [/href="https:\/\/youtube\.com"/g, 'href="https://youtube.com/@IFUPlatform" aria-label="YouTube placeholder"'],
  [/href="home\.html#"/g, 'href="https://instagram.com/IFUPlatform" aria-label="Instagram placeholder"'],
];
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
  const roleCount = categories.reduce((total, category) => total + category.roles.length, 0);
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
    .map((category, index) => {
      const roleMarkup = category.roles
        .map((role) => {
          const searchText = `${role.title} ${role.categoryName} ${role.pathway}`.toLowerCase();

          return `<a class="ifu-home-role-card" href="/discovery?role=${encodeURIComponent(
            role.slug,
          )}#role-matrix" data-role-card data-role-text="${escapeHtml(searchText)}">
            <span class="ifu-home-role-title">${escapeHtml(role.title)}</span>
            <span class="ifu-home-role-meta">${escapeHtml(role.pathway)}</span>
          </a>`;
        })
        .join("");

      return `<details class="ifu-home-role-category" ${
        index === 0 ? "open" : ""
      } data-role-category>
        <summary>
          <span>
            <strong>${escapeHtml(category.name)}</strong>
            <em>${escapeHtml(category.summary)}</em>
          </span>
          <b>${category.roles.length} roles</b>
        </summary>
        <div class="ifu-home-role-list">${roleMarkup}</div>
      </details>`;
    })
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

.ifu-home-role-header {
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  justify-items: center;
  margin-bottom: 28px;
  text-align: center;
}

.ifu-home-role-intro {
  max-width: 980px;
  margin: 0 auto;
}

.ifu-home-role-intro h2 {
  margin: 0;
  color: #08233b;
  font-size: clamp(30px, 4vw, 48px);
  line-height: 1.08;
}

.ifu-home-role-intro p {
  margin: 16px auto 0;
  color: #55616f;
  font-size: 16px;
  line-height: 1.7;
}

.ifu-home-role-intro h3 {
  margin: 22px auto 0;
  color: #08233b;
  font-size: clamp(20px, 2.6vw, 30px);
  line-height: 1.2;
}

.ifu-home-role-intro strong {
  color: #08233b;
}

.ifu-home-role-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
}

.ifu-home-role-search {
  min-width: min(100%, 440px);
  flex: 1;
  border: 1px solid rgba(8, 35, 59, .16);
  border-radius: 999px;
  background: #fff;
  padding: 15px 20px;
  color: #08233b;
  font-size: 15px;
  outline: none;
  box-shadow: 0 12px 30px rgba(8, 35, 59, .06);
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
  margin-bottom: 18px;
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
  gap: 12px;
  max-height: 380px;
  overflow: auto;
}

.ifu-home-role-category {
  overflow: hidden;
  border: 1px solid rgba(8, 35, 59, .1);
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(8, 35, 59, .06);
}

.ifu-home-role-category[hidden] {
  display: none;
}

.ifu-home-role-category summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  cursor: pointer;
  padding: 18px 20px;
  list-style: none;
}

.ifu-home-role-category summary::-webkit-details-marker {
  display: none;
}

.ifu-home-role-category summary strong {
  display: block;
  color: #08233b;
  font-size: 18px;
}

.ifu-home-role-category summary em {
  display: block;
  margin-top: 5px;
  color: #667085;
  font-size: 13px;
  font-style: normal;
  line-height: 1.5;
}

.ifu-home-role-category summary b {
  border-radius: 999px;
  background: #e9f7ee;
  color: #0b7d35;
  padding: 8px 12px;
  font-size: 12px;
}

.ifu-home-role-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 10px;
  padding: 0 20px 20px;
}

.ifu-home-role-card {
  display: flex;
  min-height: 82px;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid rgba(8, 35, 59, .08);
  border-radius: 14px;
  background: #f8faf9;
  padding: 13px;
  color: #08233b !important;
  text-decoration: none !important;
  transition: transform .2s ease, border-color .2s ease, background .2s ease;
}

.ifu-home-role-card:hover {
  transform: translateY(-2px);
  border-color: rgba(11, 125, 53, .35);
  background: #f0fbf4;
}

.ifu-home-role-card[hidden] {
  display: none;
}

.ifu-home-role-title {
  font-size: 14px;
  font-weight: 800;
  line-height: 1.3;
}

.ifu-home-role-meta {
  margin-top: 10px;
  color: #0b7d35;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.ifu-home-role-empty {
  display: none;
  border: 1px dashed rgba(8, 35, 59, .25);
  border-radius: 16px;
  background: #fff;
  padding: 18px;
  color: #667085;
  font-weight: 700;
}

.ifu-home-role-empty[data-visible="true"] {
  display: block;
}

@media (max-width: 900px) {
  .ifu-home-role-header {
    grid-template-columns: 1fr;
  }

  .ifu-home-role-stats {
    grid-template-columns: repeat(3, 1fr);
  }

  .ifu-home-persona-grid {
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

  .ifu-home-role-category summary {
    grid-template-columns: 1fr;
  }
}
</style>

<section class="ifu-home-role-catalog" id="ifu-home-role-catalog" aria-labelledby="ifu-home-role-title">
  <div class="ifu-home-role-shell">
    <div class="ifu-home-role-header">
      <div class="ifu-home-role-intro">
        <h2 id="ifu-home-role-title">🌍 Discover Your Place in the Global Agriculture ecosystem</h2>
        <p>The International Farm Union (IFU) Platform is built for everyone in the global food and agriculture value chain. Whether you're a farmer, buyer, investor, researcher, student, government official, nonprofit leader, or simply exploring agriculture, IFU brings together people, organizations, and the world agricultural communities across the entire food and agriculture value chain in one platform.</p>
        <p>IFU helps you discover the right people, programs, funding, markets, training, and opportunities in 190+ countries, 2Million+ farmers, 500+ partners in the world—all from one ai powered intelligent global platform.</p>
        <h3><strong>Who are you in agriculture?</strong></h3>
        <p>Simply choose your role from 20+ categories and 260+ real agricultural roles roles below, and in less than one minute we'll personalize your IFU experience and we'll instantly show you the opportunities, tools, training, funding, intelligence, networking and global connections created specifically for you in your own Private Personalized Command Center Dashboard.</p>
        <h3><strong>WELCOME TO THE INTERNATIONAL FARM UNION (IFU) PLATFORM ROLES BASED DISCOVERY CENTER</strong></h3>
        <p><strong>🌍 IFU Is Live. 🌎 IFU Is Global. 📍 Yet IFU Is Local.</strong></p>
        <p><strong>Powered by 10 AI Unified Ecosystems. One Platform. Endless Opportunities.</strong> Real-Time Intelligence • Global Connections • Local Opportunities</p>
        <p>➡️ Choose your role to get started.</p>
        <h3><strong>Search and select your IFU roles below</strong></h3>
      </div>
    </div>

    <div class="ifu-home-persona-grid" aria-label="Choose your IFU role path">${personaMarkup}</div>

    <div class="ifu-home-role-controls">
      <input class="ifu-home-role-search" id="ifu-home-role-search" type="search" placeholder="Search all ${roleCount} roles" autocomplete="off">
    </div>

    <div class="ifu-home-role-categories" id="ifu-home-role-categories">${categoryMarkup}</div>
    <p class="ifu-home-role-empty" id="ifu-home-role-empty">No matching roles found.</p>
  </div>
</section>

<script>
(function(){
  const search = document.getElementById('ifu-home-role-search');
  const empty = document.getElementById('ifu-home-role-empty');
  const categories = Array.from(document.querySelectorAll('[data-role-category]'));
  const cards = Array.from(document.querySelectorAll('[data-role-card]'));

  if (!search || !empty) {
    return;
  }

  search.addEventListener('input', function(){
    const query = search.value.trim().toLowerCase();
    let visibleCardCount = 0;

    cards.forEach(function(card){
      const matches = !query || card.dataset.roleText.includes(query);
      card.hidden = !matches;

      if (matches) {
        visibleCardCount += 1;
      }
    });

    categories.forEach(function(category){
      const visibleInCategory = Array.from(category.querySelectorAll('[data-role-card]')).some(function(card){
        return !card.hidden;
      });

      category.hidden = !visibleInCategory;

      if (query && visibleInCategory) {
        category.open = true;
      }
    });

    empty.dataset.visible = visibleCardCount === 0 ? 'true' : 'false';
  });
})();
</script>`;
}

function updateHomepageRoleSection(html) {
  if (!homepageRoleSectionPattern.test(html)) {
    throw new Error("Homepage role section was not found in public/index.html.");
  }

  return html.replace(homepageRoleSectionPattern, buildHomepageRoleSection());
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
  let updatedHtml = html;

  if (updatedHtml.includes("menu-item-ifu-discovery")) {
    updatedHtml = updatedHtml.replace(injectedDiscoveryNavPattern, discoveryNavItem);
  } else {
    updatedHtml = updatedHtml.replace(navClosingPattern, `${discoveryNavItem}\n$1`);
  }

  updatedHtml = updatedHtml
    .replace(headerActionsPattern, headerActionsHtml)
    .replace(joinButtonHrefPattern, "$1/api/auth/register?returnTo=%2Fdashboard$2")
    .replace(
      discoverMoreButtonPattern,
      '<a href="javascript:void(0)" aria-disabled="true" class="cherito-btn">',
    )
    .replaceAll("Watch Video", "Video Coming Soon");

  for (const [pattern, replacement] of socialHrefReplacements) {
    updatedHtml = updatedHtml.replace(pattern, replacement);
  }

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
