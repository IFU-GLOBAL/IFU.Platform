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
const homepageRoleSectionPattern =
  /<style>\s*\.agrisphere-dashboard \*[\s\S]*?renderRoleTab\(currentRole,currentTab\);\s*<\/script>\s*<\/div>/;

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
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: end;
  margin-bottom: 24px;
}

.ifu-home-role-eyebrow {
  margin: 0 0 10px;
  color: #0b7d35;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .14em;
  text-transform: uppercase;
}

.ifu-home-role-header h2 {
  margin: 0;
  color: #08233b;
  font-size: clamp(30px, 4vw, 48px);
  line-height: 1.05;
}

.ifu-home-role-header p {
  max-width: 760px;
  margin: 14px 0 0;
  color: #55616f;
  font-size: 16px;
  line-height: 1.7;
}

.ifu-home-role-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(94px, 1fr));
  gap: 10px;
}

.ifu-home-role-stat {
  min-width: 110px;
  border: 1px solid rgba(8, 35, 59, .1);
  border-radius: 16px;
  background: #fff;
  padding: 14px;
  box-shadow: 0 12px 30px rgba(8, 35, 59, .06);
}

.ifu-home-role-stat strong {
  display: block;
  color: #0b7d35;
  font-size: 26px;
  line-height: 1;
}

.ifu-home-role-stat span {
  display: block;
  margin-top: 6px;
  color: #667085;
  font-size: 12px;
  font-weight: 700;
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

.ifu-home-role-categories {
  display: grid;
  gap: 12px;
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
}

@media (max-width: 560px) {
  .ifu-home-role-catalog {
    padding: 44px 14px;
  }

  .ifu-home-role-stats {
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
      <div>
        <p class="ifu-home-role-eyebrow">Role-Based Discovery Center</p>
        <h2 id="ifu-home-role-title">Discover IFU Based on Your Role</h2>
        <p>Explore the current IFU role catalog from the platform database seed: ${categories.length} role categories and ${roleCount} role pathways for producers, buyers, institutions, educators, funders, partners, and public visitors.</p>
      </div>
      <div class="ifu-home-role-stats" aria-label="IFU role catalog metrics">
        <div class="ifu-home-role-stat"><strong>${categories.length}</strong><span>Categories</span></div>
        <div class="ifu-home-role-stat"><strong>${roleCount}</strong><span>Roles</span></div>
        <div class="ifu-home-role-stat"><strong>9</strong><span>Ecosystems</span></div>
      </div>
    </div>

    <div class="ifu-home-role-controls">
      <input class="ifu-home-role-search" id="ifu-home-role-search" type="search" placeholder="Search all ${roleCount} roles" autocomplete="off">
      <a class="ifu-home-role-cta" href="/discovery#role-matrix">Open full role discovery</a>
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

  if (filePath === publicHomePath) {
    updatedHtml = updateHomepageRoleSection(updatedHtml);
  }

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
