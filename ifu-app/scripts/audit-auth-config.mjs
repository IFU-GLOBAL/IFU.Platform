#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import dotenv from "dotenv";

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const json = args.includes("--json");
const explicitEnvFiles = args
  .filter((arg) => arg.startsWith("--env-file="))
  .map((arg) => arg.slice("--env-file=".length))
  .filter(Boolean);

const defaultEnvFiles = [".env", ".env.production", ".env.local", ".env.production.local"];
const envFileCandidates = explicitEnvFiles.length > 0 ? explicitEnvFiles : defaultEnvFiles;
const fileEnv = {};
const fileSources = {};
const loadedEnvFiles = [];

for (const candidate of envFileCandidates) {
  const envPath = resolve(process.cwd(), candidate);

  if (!existsSync(envPath)) {
    continue;
  }

  const parsed = dotenv.parse(readFileSync(envPath));
  loadedEnvFiles.push(candidate);

  for (const [name, value] of Object.entries(parsed)) {
    fileEnv[name] = value;
    fileSources[name] = candidate;
  }
}

function readEnv(name) {
  const raw = process.env[name] ?? fileEnv[name];
  const value = raw?.trim();
  return value ? value : undefined;
}

function sourceFor(name) {
  if (process.env[name]?.trim()) {
    return "shell";
  }

  return fileSources[name] ?? "missing";
}

function redact(value) {
  if (!value) {
    return null;
  }

  if (value.length <= 8) {
    return "[set]";
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

function parseUrl(value) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function normalizedUrl(value) {
  const url = parseUrl(value);

  if (!url) {
    return null;
  }

  url.hash = "";
  return url.toString();
}

function buildAppUrl(baseUrl, path) {
  return new URL(path, `${trimTrailingSlash(baseUrl)}/`).toString();
}

function normalizeCognitoDomain(value) {
  if (!value) {
    return null;
  }

  if (value.includes("<") || value.includes("your-prefix") || value.includes("cognito-idp.")) {
    return null;
  }

  const withProtocol = value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
  const normalized = trimTrailingSlash(withProtocol);

  return parseUrl(normalized) ? normalized : null;
}

const checks = [];

function addCheck(status, id, message, details = {}) {
  checks.push({
    id,
    status,
    message,
    ...details,
  });
}

function addRequiredEnvCheck({ name, fallbackName, label = name, redacted = true }) {
  const primary = readEnv(name);
  const fallback = fallbackName ? readEnv(fallbackName) : undefined;
  const value = primary ?? fallback;

  if (!value) {
    addCheck("fail", name, `${label} is missing.`);
    return value;
  }

  if (!primary && fallbackName) {
    addCheck("warn", name, `${label} is using ${fallbackName}; prefer the server-side ${name}.`, {
      source: sourceFor(fallbackName),
      value: redacted ? redact(value) : value,
    });
    return value;
  }

  addCheck("pass", name, `${label} is set.`, {
    source: sourceFor(name),
    value: redacted ? redact(value) : value,
  });

  return value;
}

const appBaseUrl = readEnv("APP_BASE_URL");
const publicAppUrl = readEnv("NEXT_PUBLIC_APP_URL");
const baseUrl = appBaseUrl ?? publicAppUrl;
const normalizedBaseUrl = baseUrl ? trimTrailingSlash(baseUrl) : null;
const expectedCallbackUrl = normalizedBaseUrl ? buildAppUrl(normalizedBaseUrl, "/api/auth/callback") : null;
const expectedLogoutUrl = normalizedBaseUrl ? buildAppUrl(normalizedBaseUrl, "/login?signedOut=1") : null;
const redirectUri = readEnv("COGNITO_REDIRECT_URI") ?? expectedCallbackUrl;
const logoutUri = readEnv("COGNITO_LOGOUT_URI") ?? expectedLogoutUrl;

if (!baseUrl) {
  addCheck("fail", "APP_BASE_URL", "APP_BASE_URL or NEXT_PUBLIC_APP_URL is missing.");
} else if (!parseUrl(normalizedBaseUrl)) {
  addCheck("fail", "APP_BASE_URL", "APP_BASE_URL must be an absolute URL.", {
    source: appBaseUrl ? sourceFor("APP_BASE_URL") : sourceFor("NEXT_PUBLIC_APP_URL"),
  });
} else if (!appBaseUrl) {
  addCheck("warn", "APP_BASE_URL", "NEXT_PUBLIC_APP_URL is set, but APP_BASE_URL should be set for server auth.", {
    source: sourceFor("NEXT_PUBLIC_APP_URL"),
    value: normalizedBaseUrl,
  });
} else {
  addCheck("pass", "APP_BASE_URL", "APP_BASE_URL is set.", {
    source: sourceFor("APP_BASE_URL"),
    value: normalizedBaseUrl,
  });
}

if (appBaseUrl && publicAppUrl && normalizedUrl(appBaseUrl) !== normalizedUrl(publicAppUrl)) {
  addCheck("warn", "NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_APP_URL does not match APP_BASE_URL.", {
    appBaseUrl: normalizedUrl(appBaseUrl),
    nextPublicAppUrl: normalizedUrl(publicAppUrl),
  });
}

const sessionSecret = readEnv("AUTH_SESSION_SECRET");

if (!sessionSecret) {
  addCheck("fail", "AUTH_SESSION_SECRET", "AUTH_SESSION_SECRET is missing.");
} else if (sessionSecret.length < 32) {
  addCheck("fail", "AUTH_SESSION_SECRET", "AUTH_SESSION_SECRET must be at least 32 characters.", {
    source: sourceFor("AUTH_SESSION_SECRET"),
    length: sessionSecret.length,
  });
} else {
  addCheck("pass", "AUTH_SESSION_SECRET", "AUTH_SESSION_SECRET is long enough.", {
    source: sourceFor("AUTH_SESSION_SECRET"),
    length: sessionSecret.length,
  });
}

const region = addRequiredEnvCheck({
  name: "COGNITO_REGION",
  fallbackName: "NEXT_PUBLIC_COGNITO_REGION",
  label: "Cognito region",
  redacted: false,
});
const userPoolId = addRequiredEnvCheck({
  name: "COGNITO_USER_POOL_ID",
  fallbackName: "NEXT_PUBLIC_COGNITO_USER_POOL_ID",
  label: "Cognito user pool ID",
});
addRequiredEnvCheck({
  name: "COGNITO_CLIENT_ID",
  fallbackName: "NEXT_PUBLIC_COGNITO_CLIENT_ID",
  label: "Cognito app client ID",
});

if (region && userPoolId && !userPoolId.startsWith(`${region}_`)) {
  addCheck("warn", "COGNITO_USER_POOL_ID_REGION", "Cognito user pool ID does not start with the configured region.", {
    region,
    userPoolId: redact(userPoolId),
  });
}

const cognitoDomain = readEnv("COGNITO_DOMAIN");
const normalizedCognitoDomain = normalizeCognitoDomain(cognitoDomain);

if (!cognitoDomain) {
  addCheck("fail", "COGNITO_DOMAIN", "COGNITO_DOMAIN is missing.");
} else if (!normalizedCognitoDomain) {
  addCheck("fail", "COGNITO_DOMAIN", "COGNITO_DOMAIN must be the Cognito hosted UI domain, not the user-pool issuer.", {
    source: sourceFor("COGNITO_DOMAIN"),
  });
} else {
  addCheck("pass", "COGNITO_DOMAIN", "COGNITO_DOMAIN is a valid hosted UI URL.", {
    source: sourceFor("COGNITO_DOMAIN"),
    value: normalizedCognitoDomain,
  });
}

const scopes = readEnv("COGNITO_SCOPES") ?? "openid email";
const scopeSet = new Set(scopes.split(/\s+/).filter(Boolean));

if (!scopeSet.has("openid")) {
  addCheck("fail", "COGNITO_SCOPES", "COGNITO_SCOPES must include openid.", {
    source: sourceFor("COGNITO_SCOPES"),
    value: scopes,
  });
} else if (!scopeSet.has("email")) {
  addCheck("warn", "COGNITO_SCOPES", "COGNITO_SCOPES does not include email.", {
    source: sourceFor("COGNITO_SCOPES"),
    value: scopes,
  });
} else {
  addCheck("pass", "COGNITO_SCOPES", "COGNITO_SCOPES contains the required OAuth scopes.", {
    source: readEnv("COGNITO_SCOPES") ? sourceFor("COGNITO_SCOPES") : "app default",
    value: scopes,
  });
}

function checkRouteUrl({ envName, label, actual, expected }) {
  if (!actual) {
    addCheck("fail", envName, `${label} cannot be derived because APP_BASE_URL is missing.`);
    return;
  }

  const actualUrl = parseUrl(actual);

  if (!actualUrl) {
    addCheck("fail", envName, `${label} must be an absolute URL.`, {
      source: sourceFor(envName),
    });
    return;
  }

  if (!expected) {
    addCheck("warn", envName, `${label} is set, but the expected URL cannot be derived without APP_BASE_URL.`, {
      source: readEnv(envName) ? sourceFor(envName) : "derived",
      value: actual,
    });
    return;
  }

  const actualNormalized = normalizedUrl(actual);
  const expectedNormalized = normalizedUrl(expected);

  if (actualNormalized !== expectedNormalized) {
    addCheck("warn", envName, `${label} differs from the URL derived from APP_BASE_URL.`, {
      source: readEnv(envName) ? sourceFor(envName) : "derived",
      actual: actualNormalized,
      expected: expectedNormalized,
    });
    return;
  }

  addCheck("pass", envName, `${label} matches APP_BASE_URL.`, {
    source: readEnv(envName) ? sourceFor(envName) : "derived",
    value: actualNormalized,
  });
}

checkRouteUrl({
  envName: "COGNITO_REDIRECT_URI",
  label: "Cognito callback URL",
  actual: redirectUri,
  expected: expectedCallbackUrl,
});

checkRouteUrl({
  envName: "COGNITO_LOGOUT_URI",
  label: "Cognito sign-out URL",
  actual: logoutUri,
  expected: expectedLogoutUrl,
});

const manualAwsChecks = [
  `Cognito app client Callback URLs includes ${expectedCallbackUrl ?? "(set APP_BASE_URL first)"}.`,
  `Cognito app client Sign-out URLs includes ${expectedLogoutUrl ?? "(set APP_BASE_URL first)"}.`,
  "Cognito app client allows Authorization code grant.",
  `Cognito app client allows these scopes: ${scopes}.`,
  "Cognito app client write attributes allow email, name, given_name, and family_name.",
  "Cognito user pool self-service sign-up is enabled for custom registration.",
];

const counts = checks.reduce(
  (total, check) => {
    total[check.status] += 1;
    return total;
  },
  { pass: 0, warn: 0, fail: 0 },
);

const report = {
  loadedEnvFiles,
  mode: strict ? "strict" : "report",
  effectiveBaseUrl: normalizedBaseUrl,
  expectedCallbackUrl,
  expectedLogoutUrl,
  effectiveCallbackUrl: redirectUri ?? null,
  effectiveLogoutUrl: logoutUri ?? null,
  cognitoDomain: normalizedCognitoDomain,
  checks,
  manualAwsChecks,
  counts,
};

if (json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const loaded = loadedEnvFiles.length > 0 ? loadedEnvFiles.join(", ") : "none";

  console.log("IFU Cognito Auth Environment Audit");
  console.log(`Loaded env files: ${loaded}`);
  console.log(`Mode: ${report.mode}`);
  console.log("");
  console.log(`Base URL: ${normalizedBaseUrl ?? "(missing)"}`);
  console.log(`Expected callback URL: ${expectedCallbackUrl ?? "(missing)"}`);
  console.log(`Expected sign-out URL: ${expectedLogoutUrl ?? "(missing)"}`);
  console.log("");
  console.log("Checks:");

  for (const check of checks) {
    const label = check.status.toUpperCase().padEnd(4, " ");
    console.log(`  ${label} ${check.id}: ${check.message}`);
  }

  console.log("");
  console.log("Manual AWS console checks:");

  for (const item of manualAwsChecks) {
    console.log(`  - ${item}`);
  }

  console.log("");
  console.log(`Result: ${counts.fail} failure(s), ${counts.warn} warning(s), ${counts.pass} pass(es).`);

  if (!strict) {
    console.log("Use `npm run auth:audit -- --strict` in CI to fail on failures or warnings.");
  }
}

if (strict && (counts.fail > 0 || counts.warn > 0)) {
  process.exitCode = 1;
}
