import type { NextConfig } from "next";
import { existsSync, readdirSync } from "node:fs";
import { resolve, sep } from "node:path";

type Rewrite = {
  source: string;
  destination: string;
};

type Redirect = {
  source: string;
  destination: string;
  permanent: boolean;
  has?: Array<{
    type: "query";
    key: string;
    value?: string;
  }>;
};

const legacyStaticRoot = resolve(process.cwd(), "..", "ifu-static-site", "dist");
const nextOwnedSegments = new Set([
  "_next",
  "api",
  "country",
  "dashboard",
  "discovery",
  "forgot-password",
  "login",
  "register",
]);

const legacyPostRedirects: Record<string, string> = {
  "3": "/privacy-policy",
  "653": "/about-us",
  "1530": "/contact-us",
  "2512": "/frequently-asked-questions",
  "2964": "/guides",
  "2989": "/events",
  "5543": "/about-us",
  "5771": "/about-us",
  "5781": "/about-us",
  "5818": "/about-us",
  "6029": "/foundation",
  "6074": "/about-us",
  "6343": "/platforms",
  "6382": "/platforms",
  "6392": "/platforms",
  "6404": "/platforms",
  "6409": "/platforms",
  "6414": "/platforms",
  "6419": "/platforms",
  "6425": "/platforms",
  "6430": "/platforms",
  "6435": "/data-engine",
  "6471": "/programs",
  "6476": "/programs",
  "6481": "/programs",
  "6486": "/programs",
  "6495": "/insights",
  "6501": "/gallery",
  "6571": "/partners-institutions",
  "6576": "/partnerships",
  "6590": "/insights",
  "6595": "/data-engine",
  "6607": "/about-us",
  "6612": "/programs",
  "6617": "/foundation",
  "6622": "/partnerships",
  "6627": "/about-us",
  "6632": "/partnerships",
  "6637": "/foundation",
  "6724": "/programs",
  "6729": "/programs",
  "6734": "/partnerships",
  "6739": "/partnerships",
  "6744": "/foundation",
  "6749": "/platforms",
  "6754": "/programs",
  "6767": "/gallery",
  "6772": "/partnerships",
  "6780": "/data-engine",
  "6892": "/research",
  "6897": "/guides",
  "6913": "/help-center",
  "6918": "/partnerships",
  "6925": "/terms-of-use",
  "7215": "/forgot-password",
  "7235": "/register",
  "7331": "/login",
  "9452": "/home",
  "9723": "/quality-assurance-testing",
  "9734": "/quality-assurance-testing",
};

function collectLegacyDirectoryRoutes(directory = legacyStaticRoot, route = ""): Rewrite[] {
  if (!existsSync(directory)) {
    return [];
  }

  const entries = readdirSync(directory, { withFileTypes: true });
  const rewrites: Rewrite[] = [];
  const hasIndex = entries.some((entry) => entry.isFile() && entry.name === "index.html");

  if (hasIndex && route) {
    const source = `/${route.split(sep).join("/")}`;
    const destination = `/${route.split(sep).join("/")}/index.html`;
    const firstSegment = route.split(sep)[0];

    if (!firstSegment || !nextOwnedSegments.has(firstSegment)) {
      rewrites.push({ source, destination });

      if (source !== "/") {
        rewrites.push({ source: `${source}/`, destination });
      }
    }
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const childRoute = route ? `${route}${sep}${entry.name}` : entry.name;
    rewrites.push(...collectLegacyDirectoryRoutes(resolve(directory, entry.name), childRoute));
  }

  return rewrites;
}

function collectLegacyPostRedirects(): Redirect[] {
  const redirects = Object.entries(legacyPostRedirects).map(([postId, destination]) => ({
    source: "/index.html",
    has: [{ type: "query" as const, key: "p", value: postId }],
    destination,
    permanent: true,
  }));

  redirects.push({
    source: "/index.html",
    has: [{ type: "query", key: "wordfence_syncAttackData" }],
    destination: "/home",
    permanent: true,
  });

  return redirects;
}

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./public/**/*"],
  },
  async redirects() {
    return collectLegacyPostRedirects();
  },
  async rewrites() {
    return {
      beforeFiles: collectLegacyDirectoryRoutes(),
    };
  },
};

export default nextConfig;
