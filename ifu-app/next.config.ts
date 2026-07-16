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

const legacyPathRedirects: Record<string, string> = {
  "/about-us/advisory-council": "/about-us",
  "/about-us/foundation": "/foundation",
  "/about-us/governance": "/about-us",
  "/about-us/leadership": "/about-us",
  "/about-us/our-mission": "/about-us",
  "/author/villaonthepotomac": "/about-us",
  "/author/villaonthepotomac/feed": "/about-us",
  "/comments/feed": "/home",
  "/event/10-simple-practices": "/events",
  "/event_category/treatment": "/events",
  "/event_category/treatment/feed": "/events",
  "/feed": "/home",
  "/foundation/donation": "/foundation",
  "/foundation/get-involved": "/foundation",
  "/foundation/impact-results": "/foundation",
  "/foundation/mission-vision": "/foundation",
  "/foundation/our-programs": "/foundation",
  "/foundation/partners-supporters": "/foundation",
  "/foundation/partnerships-events": "/foundation",
  "/foundation/stories-gallery": "/gallery",
  "/foundation/transparency-governance": "/foundation",
  "/gallery/cooperatives": "/gallery",
  "/gallery/fields-farmer-activities": "/gallery",
  "/gallery/global-engagement": "/gallery",
  "/gallery/impact-community": "/gallery",
  "/gallery/impact-highlights": "/gallery",
  "/gallery/partnerships-events": "/gallery",
  "/gallery/platform-technology": "/gallery",
  "/gallery/training-programs": "/gallery",
  "/insights/data-analytics": "/insights",
  "/insights/reports": "/insights",
  "/partners-institutions/partner-with-us": "/partners-institutions",
  "/platforms/agriacademie": "/platforms",
  "/platforms/agricapital": "/platforms",
  "/platforms/agricentral": "/platforms",
  "/platforms/agriexchange": "/platforms",
  "/platforms/agrifinance": "/discovery",
  "/platforms/agrifunds": "/platforms",
  "/platforms/agrinexus": "/platforms",
  "/platforms/agrishield": "/platforms",
  "/platforms/agrisphere": "/platforms",
  "/platforms/agrisphere/agrisphere-login": "/login",
  "/platforms/agrisphere/agrisphere-registration": "/register",
  "/platforms/agrisphere/password-reset": "/forgot-password",
  "/platforms/data-engine": "/data-engine",
  "/privacy-policy/feed": "/privacy-policy",
  "/programs/nutrition": "/programs",
  "/programs/rural-development": "/programs",
  "/programs/training": "/programs",
  "/quality-assurance-testing/tester-login": "/login",
  "/team/jean-d-tchatchoua": "/about-us",
  "/terms-of-use/feed": "/terms-of-use",
  "/wp-json": "/home",
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
  const redirects: Redirect[] = [
    ...Object.entries(legacyPostRedirects).map(([postId, destination]) => ({
      source: "/index.html",
      has: [{ type: "query" as const, key: "p", value: postId }],
      destination,
      permanent: true,
    })),
    ...Object.entries(legacyPathRedirects).flatMap(([source, destination]) => [
      {
        source,
        destination,
        permanent: true,
      },
      {
        source: `${source}/`,
        destination,
        permanent: true,
      },
    ]),
  ];

  redirects.push({
    source: "/index.html",
    has: [{ type: "query", key: "wordfence_syncAttackData", value: ".*" }],
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
