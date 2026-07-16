#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = new Set(process.argv.slice(2));
const json = args.has("--json");
const checks = [];

function addCheck(status, id, message, details = {}) {
  checks.push({ status, id, message, ...details });
}

function appPath(path) {
  return resolve(appRoot, path);
}

function relativePath(path) {
  return relative(appRoot, path);
}

function read(path) {
  return readFileSync(appPath(path), "utf8");
}

function fileExists(path) {
  return existsSync(appPath(path));
}

function walkFiles(root, predicate = () => true) {
  const rootPath = appPath(root);

  if (!existsSync(rootPath)) {
    return [];
  }

  const results = [];
  const stack = [rootPath];

  while (stack.length > 0) {
    const current = stack.pop();

    for (const entry of readdirSync(current)) {
      const fullPath = resolve(current, entry);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        if (entry === "node_modules" || entry === ".next" || entry === "generated") {
          continue;
        }

        stack.push(fullPath);
        continue;
      }

      if (stats.isFile() && predicate(fullPath)) {
        results.push(fullPath);
      }
    }
  }

  return results.sort();
}

function findMatches(files, patterns) {
  const matches = [];

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const lines = source.split(/\r?\n/);

    lines.forEach((line, index) => {
      for (const pattern of patterns) {
        pattern.lastIndex = 0;

        if (pattern.test(line)) {
          matches.push(`${relativePath(file)}:${index + 1}: ${line.trim()}`);
          break;
        }
      }
    });
  }

  return matches;
}

function assertFile(path, label = path) {
  addCheck(fileExists(path) ? "pass" : "fail", `file:${path}`, `${label} exists.`);
}

function assertContains({ file, id, label, expected }) {
  if (!fileExists(file)) {
    addCheck("fail", id, `${label} is missing because ${file} does not exist.`);
    return;
  }

  const source = read(file);
  addCheck(source.includes(expected) ? "pass" : "fail", id, label);
}

assertFile("src/app/sitemap.ts", "Sitemap route");
assertFile("src/app/robots.ts", "Robots route");
assertFile("src/lib/site-url.ts", "Site URL helper");
assertFile("docs/release-evidence-package.md", "Release evidence package");
assertFile("docs/api-inventory.md", "API inventory document");
assertFile("docs/amplify-release-checklist.md", "Amplify release checklist");
assertFile("docs/aws-evidence-screenshot-checklist.md", "AWS evidence screenshot checklist");
assertFile("scripts/audit-role-catalog.ts", "Role catalog database audit script");

const packageJson = JSON.parse(read("package.json"));
addCheck(
  packageJson.scripts?.["review:audit"] ? "pass" : "fail",
  "script:review-audit",
  "package.json exposes npm run review:audit.",
);
addCheck(
  packageJson.scripts?.["review:smoke"] ? "pass" : "fail",
  "script:review-smoke",
  "package.json exposes npm run review:smoke.",
);
addCheck(
  packageJson.scripts?.["roles:audit"] ? "pass" : "fail",
  "script:roles-audit",
  "package.json exposes npm run roles:audit.",
);

const publicHtmlFiles = walkFiles("public", (file) => file.endsWith(".html"));
const headerSources = [appPath("scripts/sync-static-site.mjs"), ...publicHtmlFiles].filter(existsSync);
const profileLoginMatches = findMatches(headerSources, [/\/api\/auth\/login\?returnTo=%2Fprofile/]);

addCheck(
  profileLoginMatches.length === 0 ? "pass" : "fail",
  "login-target:dashboard",
  "Synced public login links point to dashboard, not profile.",
  profileLoginMatches.length > 0 ? { matches: profileLoginMatches.slice(0, 20) } : {},
);

assertContains({
  file: "src/lib/site-url.ts",
  id: "site-url:current-review-url",
  label: "Default site URL points at the current dev Amplify review URL.",
  expected: "https://dev.d34plke7xvuysn.amplifyapp.com",
});
assertContains({
  file: "scripts/sync-static-site.mjs",
  id: "sync:dashboard-login",
  label: "Static sync source uses dashboard as the regular login return target.",
  expected: "/api/auth/login?returnTo=%2Fdashboard",
});
assertContains({
  file: "scripts/sync-static-site.mjs",
  id: "sync:role-catalog-homepage",
  label: "Homepage role section is generated from the same role catalog used by seeding.",
  expected: "readRoleCatalog()",
});
assertContains({
  file: "public/index.html",
  id: "homepage:role-catalog-copy",
  label: "Generated homepage role section states it comes from the IFU role catalog.",
  expected: "Generated from the same IFU role catalog used by Discovery Center and database seeding.",
});
assertContains({
  file: "public/index.html",
  id: "homepage:count-up-script",
  label: "Generated homepage includes IFU count-up animation script.",
  expected: 'id="ifu-count-up-script"',
});
assertContains({
  file: "public/index.html",
  id: "homepage:hero-fallback",
  label: "Generated homepage includes local hero-image fallback styling.",
  expected: 'id="ifu-home-hero-fallback"',
});
assertContains({
  file: "scripts/sync-static-site.mjs",
  id: "sync:country-route",
  label: "Static sync rewrites public country map clicks to IFU-owned country routes.",
  expected: "countryInsightsPath(country)",
});
assertContains({
  file: "scripts/sync-static-site.mjs",
  id: "sync:agrifinance",
  label: "Static sync inserts AgriFinance where matched.",
  expected: "AgriFinance",
});
assertContains({
  file: "scripts/sync-static-site.mjs",
  id: "sync:placeholder-metrics",
  label: "Static sync labels homepage metrics as official placeholders.",
  expected: "Official Placeholder: 190+ Countries | 2M+ Farmers",
});

const userFacingFiles = [
  ...walkFiles("src/app", (file) => file.endsWith(".tsx")),
  ...walkFiles("src/components", (file) => file.endsWith(".tsx")),
  appPath("src/lib/ses.ts"),
].filter(existsSync);
const staleCopyMatches = findMatches(userFacingFiles, [
  /preview applications?/i,
  /preview form/i,
  /preview submissions?/i,
]);

addCheck(
  staleCopyMatches.length === 0 ? "pass" : "fail",
  "copy:registration-language",
  "User-facing copy uses invitation/registration language instead of preview-application language.",
  staleCopyMatches.length > 0 ? { matches: staleCopyMatches.slice(0, 20) } : {},
);

const countryTabs = read("src/components/country-intelligence-tabs.tsx");
for (const label of ["Overview", "Commodities", "Opportunities", "IFU Path"]) {
  addCheck(
    countryTabs.includes(`label: "${label}"`) ? "pass" : "fail",
    `country-tab:${label}`,
    `Country intelligence includes the ${label} tab.`,
  );
}
addCheck(
  !countryTabs.includes('label: "Production"') && !countryTabs.includes('label: "Markets"')
    ? "pass"
    : "fail",
  "country-tabs:review-labels",
  "Country intelligence tab labels match the review language.",
);
addCheck(
  countryTabs.includes("countryIntelligenceSource.refreshCadence") &&
    countryTabs.includes("countryIntelligenceSource.license") &&
    countryTabs.includes("countryIntelligenceSource.geometryAttribution")
    ? "pass"
    : "fail",
  "country-tabs:data-lineage",
  "Country intelligence exposes refresh cadence, license status, and map attribution.",
);

const layout = read("src/app/layout.tsx");
for (const token of ["metadataBase", "openGraph", "twitter", "alternates"]) {
  addCheck(
    layout.includes(token) ? "pass" : "fail",
    `seo:layout:${token}`,
    `Root metadata includes ${token}.`,
  );
}
addCheck(
  layout.includes("/images/ifu-logo-hero.png") ? "pass" : "fail",
  "seo:open-graph-logo",
  "Root social metadata uses the approved IFU logo asset.",
);

const countryPage = read("src/app/country/[slug]/page.tsx");
addCheck(
  countryPage.includes("canonical") && countryPage.includes("openGraph") ? "pass" : "fail",
  "seo:country-metadata",
  "Country pages include canonical and OpenGraph metadata.",
);

const nextConfig = read("next.config.ts");
for (const header of [
  "Strict-Transport-Security",
  "X-Content-Type-Options",
  "X-Frame-Options",
  "Referrer-Policy",
  "Permissions-Policy",
]) {
  addCheck(
    nextConfig.includes(header) ? "pass" : "fail",
    `security-header:${header}`,
    `${header} is configured.`,
  );
}

const staticRegressionMatches = findMatches(publicHtmlFiles, [
  /roles roles/i,
  /\bai powered\b/i,
  /Quantum Sphere/i,
  /scalable\.How/i,
  /Our Ecosystem\. 9 Engines\. One Mission/i,
  /wpmapplugins/i,
]);

addCheck(
  staticRegressionMatches.length === 0 ? "pass" : "fail",
  "static:known-editorial-regressions",
  "Synced public HTML does not contain known review/editorial regressions.",
  staticRegressionMatches.length > 0 ? { matches: staticRegressionMatches.slice(0, 20) } : {},
);

const remoteHeroMatches = findMatches(publicHtmlFiles, [
  /internationalfarmunion\.com\/wp-content\/uploads\/2026\/04\/hero-home-use\.jpg/i,
]);

addCheck(
  remoteHeroMatches.length === 0 ? "pass" : "fail",
  "homepage:local-hero-image",
  "Generated public HTML uses the local hero image instead of the remote WordPress URL.",
  remoteHeroMatches.length > 0 ? { matches: remoteHeroMatches.slice(0, 20) } : {},
);

const statusCounts = checks.reduce(
  (counts, check) => {
    counts[check.status] += 1;
    return counts;
  },
  { pass: 0, warn: 0, fail: 0 },
);

if (json) {
  console.log(JSON.stringify({ ok: statusCounts.fail === 0, statusCounts, checks }, null, 2));
} else {
  for (const check of checks) {
    const label = check.status.toUpperCase().padEnd(4);
    console.log(`${label} ${check.id} - ${check.message}`);

    if (check.matches?.length) {
      for (const match of check.matches) {
        console.log(`     ${match}`);
      }
    }
  }

  console.log(
    `\nReview audit: ${statusCounts.pass} passed, ${statusCounts.warn} warnings, ${statusCounts.fail} failed.`,
  );
}

process.exit(statusCounts.fail > 0 ? 1 : 0);
