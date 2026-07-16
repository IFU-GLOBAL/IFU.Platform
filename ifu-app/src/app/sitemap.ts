import type { MetadataRoute } from "next";
import { getFeaturedCountryIntelligence } from "@/lib/country-intelligence";
import { getAbsoluteUrl } from "@/lib/site-url";

const staticRoutes = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/discovery", changeFrequency: "weekly", priority: 0.9 },
  { path: "/register", changeFrequency: "monthly", priority: 0.8 },
  { path: "/login", changeFrequency: "monthly", priority: 0.5 },
  { path: "/forgot-password", changeFrequency: "yearly", priority: 0.3 },
  { path: "/invitation", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.4 },
  { path: "/about-us", changeFrequency: "monthly", priority: 0.7 },
  { path: "/platforms", changeFrequency: "monthly", priority: 0.7 },
  { path: "/programs", changeFrequency: "monthly", priority: 0.6 },
  { path: "/foundation", changeFrequency: "monthly", priority: 0.6 },
  { path: "/partners-institutions", changeFrequency: "monthly", priority: 0.6 },
] satisfies Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}>;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const countryRoutes = getFeaturedCountryIntelligence().map((country) => ({
    url: getAbsoluteUrl(`/country/${country.slug}`),
    lastModified: country.lastUpdated,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes.map((route) => ({
      url: getAbsoluteUrl(route.path),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...countryRoutes,
  ];
}
