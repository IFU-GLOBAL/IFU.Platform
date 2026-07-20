#!/usr/bin/env node

import process from "node:process";

const args = process.argv.slice(2);
const json = args.includes("--json");
const includeDb = args.includes("--include-db");
const defaultReviewUrl = "https://dev.d34plke7xvuysn.amplifyapp.com";
const rawBaseUrl =
  args.find((arg) => arg.startsWith("--base-url="))?.slice("--base-url=".length) ??
  process.env.SMOKE_BASE_URL ??
  process.env.APP_BASE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  defaultReviewUrl;

function usage() {
  console.error("Usage: npm run review:smoke -- [--base-url=https://example.com] [--include-db] [--json]");
  console.error(`Default base URL: ${defaultReviewUrl}`);
}

let baseUrl;

try {
  baseUrl = new URL(rawBaseUrl);
  baseUrl.pathname = "/";
  baseUrl.search = "";
  baseUrl.hash = "";
} catch {
  console.error(`Invalid base URL: ${rawBaseUrl}`);
  usage();
  process.exit(1);
}

const routes = [
  { path: "/", expect: "ok", label: "Public homepage" },
  {
    path: "/agrisphere",
    expect: "login-redirect",
    label: "AgriSphere auth guard",
    locationIncludes: "/login",
  },
  { path: "/agrisphere/sample", expect: "ok", label: "Public AgriSphere sample" },
  { path: "/discovery", expect: "ok", label: "Discovery Center" },
  { path: "/register", expect: "ok", label: "Registration page" },
  { path: "/login", expect: "ok", label: "Login page" },
  { path: "/forgot-password", expect: "ok", label: "Forgot password page" },
  { path: "/invitation", expect: "ok", label: "Invitation page" },
  { path: "/privacy", expect: "ok", label: "Privacy page" },
  { path: "/country/united-states", expect: "ok", label: "Country intelligence page" },
  { path: "/sitemap.xml", expect: "ok", label: "Sitemap" },
  { path: "/robots.txt", expect: "ok", label: "Robots" },
  {
    path: "/dashboard",
    expect: "login-redirect",
    label: "Dashboard auth guard",
    locationIncludes: "/login",
  },
  {
    path: "/profile",
    expect: "login-redirect",
    label: "Profile auth guard",
    locationIncludes: "/login",
  },
];

routes.push(
  { path: "/v1/health", expect: "ok", label: "AgriSphere v1 health" },
  { path: "/v1/agrisphere/map", expect: "unauthorized", label: "AgriSphere map API auth guard" },
  { path: "/v1/agrisphere/search?q=coffee", expect: "unauthorized", label: "AgriSphere search API auth guard" },
  { path: "/v1/stats/live", expect: "unauthorized", label: "AgriSphere live stats API auth guard" },
  { path: "/v1/dashboard/feed", expect: "unauthorized", label: "AgriSphere dashboard feed API auth guard" },
  { path: "/v1/countries", expect: "unauthorized", label: "AgriSphere countries API auth guard" },
  { path: "/v1/countries/US", expect: "unauthorized", label: "AgriSphere country API auth guard" },
  { path: "/v1/continents", expect: "unauthorized", label: "AgriSphere continents API auth guard" },
  { path: "/v1/continents/africa/countries", expect: "unauthorized", label: "AgriSphere continent countries API auth guard" },
  {
    path: "/v1/opportunities/united-states-agriculture-discovery",
    expect: "unauthorized",
    label: "AgriSphere opportunity API auth guard",
  },
  {
    method: "POST",
    path: "/v1/opportunities/united-states-agriculture-discovery/save",
    expect: "unauthorized",
    label: "AgriSphere opportunity save API auth guard",
  },
  {
    method: "DELETE",
    path: "/v1/opportunities/united-states-agriculture-discovery/save",
    expect: "unauthorized",
    label: "AgriSphere opportunity unsave API auth guard",
  },
  { path: "/v1/organizations", expect: "unauthorized", label: "AgriSphere organizations API auth guard" },
  { path: "/v1/treaties", expect: "unauthorized", label: "AgriSphere treaties API auth guard" },
  { path: "/v1/sectors", expect: "unauthorized", label: "AgriSphere sectors API auth guard" },
  { path: "/v1/producers/top", expect: "unauthorized", label: "AgriSphere top producers API auth guard" },
  { path: "/v1/events", expect: "unauthorized", label: "AgriSphere events API auth guard" },
  { path: "/v1/partners", expect: "unauthorized", label: "AgriSphere partners API auth guard" },
);

if (includeDb) {
  routes.push({ path: "/api/health/db", expect: "ok", label: "Database health check" });
}

function routeUrl(path) {
  return new URL(path, baseUrl).toString();
}

async function fetchWithTimeout(url, method = "GET") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    return await fetch(url, {
      method,
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "user-agent": "ifu-review-smoke/1.0",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

function evaluate(route, response) {
  const location = response.headers.get("location") ?? "";

  if (route.expect === "ok") {
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      location,
    };
  }

  if (route.expect === "login-redirect") {
    const isRedirect = [301, 302, 303, 307, 308].includes(response.status);
    const pointsToLogin = location.includes(route.locationIncludes);

    return {
      ok: isRedirect && pointsToLogin,
      status: response.status,
      location,
    };
  }

  if (route.expect === "unauthorized") {
    return {
      ok: response.status === 401,
      status: response.status,
      location,
    };
  }

  return {
    ok: false,
    status: response.status,
    location,
  };
}

const results = [];

for (const route of routes) {
  const url = routeUrl(route.path);

  try {
    const response = await fetchWithTimeout(url, route.method);
    const result = evaluate(route, response);
    results.push({ ...route, url, ...result });
  } catch (error) {
    results.push({
      ...route,
      url,
      ok: false,
      status: null,
      location: "",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

const failed = results.filter((result) => !result.ok);

if (json) {
  console.log(JSON.stringify({ ok: failed.length === 0, baseUrl: baseUrl.toString(), results }, null, 2));
} else {
  for (const result of results) {
    const status = result.ok ? "PASS" : "FAIL";
    const httpStatus = result.status ?? "ERR";
    const suffix = result.location ? ` -> ${result.location}` : result.error ? ` (${result.error})` : "";
    const method = result.method ? `${result.method} ` : "";
    console.log(`${status} ${httpStatus} ${method}${result.path} - ${result.label}${suffix}`);
  }

  console.log(`\nSmoke test: ${results.length - failed.length} passed, ${failed.length} failed.`);
}

process.exit(failed.length > 0 ? 1 : 0);
