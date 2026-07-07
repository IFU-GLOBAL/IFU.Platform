import type { NextConfig } from "next";
import { existsSync, readdirSync } from "node:fs";
import { resolve, sep } from "node:path";

type Rewrite = {
  source: string;
  destination: string;
};

const legacyStaticRoot = resolve(process.cwd(), "..", "ifu-static-site", "dist");
const nextOwnedSegments = new Set([
  "_next",
  "api",
  "dashboard",
  "discovery",
  "forgot-password",
  "login",
  "register",
]);

function collectLegacyDirectoryRoutes(directory = legacyStaticRoot, route = ""): Rewrite[] {
  if (!existsSync(directory)) {
    return [];
  }

  const entries = readdirSync(directory, { withFileTypes: true });
  const rewrites: Rewrite[] = [];
  const hasIndex = entries.some((entry) => entry.isFile() && entry.name === "index.html");

  if (hasIndex) {
    const source = route ? `/${route.split(sep).join("/")}` : "/";
    const destination = route ? `/${route.split(sep).join("/")}/index.html` : "/index.html";
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

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: collectLegacyDirectoryRoutes(),
    };
  },
};

export default nextConfig;
