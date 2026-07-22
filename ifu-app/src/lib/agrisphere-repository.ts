import { AgriSphereOpportunityStatus } from "@/generated/prisma/enums";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { AuthSession } from "@/lib/auth/session";
import { KMeans } from "@/lib/agrisphere-algorithms";
import {
  activityTierMeta,
  agrisphereContinents,
  agrisphereCountries,
  agrisphereEvents,
  agrisphereOpportunities,
  agrisphereOrganizations,
  agrispherePartners,
  agrisphereSectors,
  agrisphereSource,
  agrisphereStats,
  agrisphereTopProducers,
  agrisphereTreaties,
  groupSearchResults,
  searchAgriSphere,
  searchCategories,
  type AgriSphereActivityTier,
  type AgriSphereContinent,
  type AgriSphereCountry,
  type AgriSphereEvent,
  type AgriSphereEventFormat,
  type AgriSphereOpportunity,
  type AgriSphereOpportunityStatus as StaticOpportunityStatus,
  type AgriSpherePartner,
  type AgriSpherePartnerTier,
  type AgriSphereProducer,
  type AgriSphereSearchCategory,
  type AgriSphereSearchResult,
  type AgriSphereStat,
} from "@/lib/agrisphere-data";
import {
  buildAgriSphereProfileTokens,
  fitAgriSphereOpportunityVectorizer,
  rankAgriSphereOpportunities,
  rankAgriSphereOpportunitiesAgainstVector,
  vectorizeAgriSphereProfile,
  type AgriSpherePersonalizationProfile,
} from "@/lib/agrisphere-personalization";
import { syncAuthenticatedUser } from "@/lib/dashboardData";
import { getPrisma } from "@/lib/prisma";
import {
  getAgriSphereServiceStatus,
  getRedisJson,
  searchOpenSearch,
  setRedisJson,
} from "@/lib/agrisphere-services";

type DataStorage = "database" | "open-search" | "static-fallback";

type CachedRecord<T> = {
  expiresAt: number;
  value: T;
};

type DatabaseResult<T> = {
  source: ReturnType<typeof sourceFor>;
  data: T;
};

type SearchInput = {
  query?: string | null;
  category?: string | null;
  limit?: number;
};

type StaticOrganization = {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string;
  href: string;
  metadata: string[];
  verified: boolean;
};

type StaticTreaty = {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string;
  href: string;
  metadata: string[];
};

type StaticSector = {
  id: string;
  slug: string;
  name: string;
  description: string;
  href: string;
  metadata: string[];
};

const FALLBACK_SEARCH_HREF = "/dashboard?section=agrisphere-dashboard#search";
const DISCOVERY_CACHE_TTL_MS = 30_000;
const SEARCH_CACHE_TTL_MS = 15_000;
const PERSONA_CLUSTER_COUNT = 6;
const PERSONA_CLUSTER_CACHE_TTL_MS = 60 * 60 * 1_000;

const globalForAgriSphere = globalThis as unknown as {
  agriSphereCache?: Map<string, CachedRecord<unknown>>;
};

function cache() {
  if (!globalForAgriSphere.agriSphereCache) {
    globalForAgriSphere.agriSphereCache = new Map();
  }

  return globalForAgriSphere.agriSphereCache;
}

async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>) {
  const now = Date.now();
  const cachedRecord = cache().get(key) as CachedRecord<T> | undefined;

  if (cachedRecord && cachedRecord.expiresAt > now) {
    return cachedRecord.value;
  }

  const redisKey = `ifu:agrisphere:sprint-1.5:${key}`;
  const distributedValue = await getRedisJson<T>(redisKey);

  if (distributedValue) {
    cache().set(key, {
      value: distributedValue,
      expiresAt: now + ttlMs,
    });
    return distributedValue;
  }

  const value = await load();
  cache().set(key, {
    value,
    expiresAt: now + ttlMs,
  });
  await setRedisJson(redisKey, value, ttlMs);

  return value;
}

function sourceFor(storage: DataStorage, detail?: string) {
  return {
    ...agrisphereSource,
    storage,
    detail:
      detail ??
      (storage === "database"
        ? "Loaded from Prisma-managed AgriSphere tables."
        : storage === "open-search"
          ? "Loaded from the managed AgriSphere OpenSearch index."
          : "Loaded from the Sprint 1.5 static fallback corpus."),
    dependencies: {
      postgres: storage === "database" ? "available" : "fallback",
      openSearch: process.env.OPENSEARCH_ENDPOINT ? "configured" : "not-configured",
      redis: process.env.REDIS_URL ? "configured" : "process-ttl-fallback",
    },
  };
}

function shouldUseFallback(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return /DATABASE_URL|Can't reach database|ECONNREFUSED|ENOTFOUND|P1001|P2021|P2022|does not exist/i.test(
    error.message,
  );
}

async function databaseOrFallback<T>({
  key,
  ttlMs = DISCOVERY_CACHE_TTL_MS,
  load,
  fallback,
}: {
  key: string;
  ttlMs?: number;
  load: (prisma: PrismaClient) => Promise<T | null>;
  fallback: () => T;
}) {
  return cached<DatabaseResult<T>>(key, ttlMs, async () => {
    try {
      const data = await load(getPrisma());

      if (data) {
        return {
          source: sourceFor("database"),
          data,
        };
      }
    } catch (error) {
      if (!shouldUseFallback(error)) {
        throw error;
      }
    }

    return {
      source: sourceFor("static-fallback"),
      data: fallback(),
    };
  });
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function clampLimit(value: number | undefined, fallback = 24, max = 50) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.min(Math.round(value ?? fallback), max));
}

function tierFromStored(level: string | null | undefined): AgriSphereActivityTier {
  if (level === "HIGH") {
    return "high";
  }

  if (level === "MEDIUM") {
    return "medium";
  }

  if (level === "EMERGING") {
    return "emerging";
  }

  if (level === "LOW") {
    return "low";
  }

  return "no-data";
}

function opportunityStatusFromStored(status: string | null | undefined): StaticOpportunityStatus {
  if (status === "CLOSED") {
    return "closed";
  }

  if (status === "DRAFT") {
    return "draft";
  }

  return "active";
}

function eventFormatFromStored(format: string | null | undefined): AgriSphereEventFormat {
  if (format === "IN_PERSON") {
    return "in-person";
  }

  if (format === "HYBRID") {
    return "hybrid";
  }

  return "virtual";
}

function partnerTierFromStored(tier: string | null | undefined): AgriSpherePartnerTier {
  if (tier === "STRATEGIC") {
    return "strategic";
  }

  if (tier === "COMMUNITY") {
    return "community";
  }

  return "institutional";
}

function countryHref(country: Pick<AgriSphereCountry, "slug">) {
  return `/country/${country.slug}`;
}

function countryFromStored(country: {
  code: string;
  slug: string;
  name: string;
  continentCode: string;
  latitude: number | null;
  longitude: number | null;
  activityLevel: string;
  primaryCrops: string[];
  opportunityCount: number;
  producerRank: number | null;
  summary: string | null;
}): AgriSphereCountry {
  return {
    code: country.code,
    slug: country.slug,
    name: country.name,
    continentCode: country.continentCode,
    latitude: country.latitude ?? 0,
    longitude: country.longitude ?? 0,
    activityTier: tierFromStored(country.activityLevel),
    primaryCrops: country.primaryCrops,
    opportunityCount: country.opportunityCount,
    producerRank: country.producerRank ?? undefined,
    summary: country.summary ?? "AgriSphere country intelligence record.",
  };
}

function continentFromStored(continent: {
  code: string;
  name: string;
  summary: string | null;
  priorityCrops: string[];
  countryCount: number;
}): AgriSphereContinent {
  return {
    code: continent.code,
    name: continent.name,
    summary: continent.summary ?? "AgriSphere continent intelligence record.",
    priorityCrops: continent.priorityCrops,
    countryCount: continent.countryCount,
  };
}

function opportunityFromStored(opportunity: {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  countryCode: string | null;
  region: string | null;
  crops: string[];
  status: string;
  href: string | null;
  metadata: string[];
}): AgriSphereOpportunity {
  return {
    id: opportunity.id,
    slug: opportunity.slug,
    title: opportunity.title,
    description: opportunity.description,
    category: opportunity.category,
    countryCode: opportunity.countryCode ?? undefined,
    region: opportunity.region ?? undefined,
    crops: opportunity.crops,
    status: opportunityStatusFromStored(opportunity.status),
    href: opportunity.href ?? FALLBACK_SEARCH_HREF,
    metadata: opportunity.metadata,
  };
}

function producerFromStored(producer: {
  producerRank: number | null;
  countryCode: string | null;
  name: string;
  commodities: string[];
  activityLevel: string | null;
  signal: string | null;
}): AgriSphereProducer {
  return {
    rank: producer.producerRank ?? 999,
    countryCode: producer.countryCode ?? "",
    countryName: producer.name,
    commodities: producer.commodities,
    activityTier: tierFromStored(producer.activityLevel),
    signal: producer.signal ?? "AgriSphere producer signal.",
  };
}

function organizationFromStored(organization: {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string | null;
  href: string | null;
  metadata: string[];
  verified: boolean;
}): StaticOrganization {
  return {
    id: organization.id,
    slug: organization.slug,
    name: organization.name,
    type: organization.type,
    description: organization.description ?? "AgriSphere organization record.",
    href: organization.href ?? FALLBACK_SEARCH_HREF,
    metadata: organization.metadata,
    verified: organization.verified,
  };
}

function treatyFromStored(treaty: {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string | null;
  href: string | null;
  metadata: string[];
}): StaticTreaty {
  return {
    id: treaty.id,
    slug: treaty.slug,
    name: treaty.name,
    type: treaty.type,
    description: treaty.description ?? "AgriSphere treaty record.",
    href: treaty.href ?? FALLBACK_SEARCH_HREF,
    metadata: treaty.metadata,
  };
}

function sectorFromStored(sector: {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  href: string | null;
  metadata: string[];
}): StaticSector {
  return {
    id: sector.id,
    slug: sector.slug,
    name: sector.name,
    description: sector.description ?? "AgriSphere sector record.",
    href: sector.href ?? FALLBACK_SEARCH_HREF,
    metadata: sector.metadata,
  };
}

function eventFromStored(event: {
  id: string;
  slug: string;
  title: string;
  eventType: string;
  startsAt: Date;
  endsAt: Date | null;
  format: string;
  url: string | null;
  countryCode: string | null;
  metadata: string[];
}): AgriSphereEvent {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    eventType: event.eventType,
    startsAt: event.startsAt.toISOString(),
    endsAt: event.endsAt?.toISOString(),
    format: eventFormatFromStored(event.format),
    url: event.url ?? undefined,
    countryCode: event.countryCode ?? undefined,
    metadata: event.metadata,
  };
}

function partnerFromStored(partner: {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  tier: string;
  url: string | null;
  sortOrder: number;
  metadata: string[];
}): AgriSpherePartner {
  return {
    id: partner.id,
    slug: partner.slug,
    name: partner.name,
    logoUrl: partner.logoUrl ?? undefined,
    tier: partnerTierFromStored(partner.tier),
    url: partner.url ?? undefined,
    sortOrder: partner.sortOrder,
    metadata: partner.metadata,
  };
}

function staticOrganizations(): StaticOrganization[] {
  return agrisphereOrganizations.map((organization, index) => ({
    id: organization.id,
    slug: organization.id,
    name: organization.title,
    type: organization.metadata[0] ?? "Organization",
    description: organization.description,
    href: organization.href,
    metadata: organization.metadata,
    verified: index === 0,
  }));
}

function staticTreaties(): StaticTreaty[] {
  return agrisphereTreaties.map((treaty) => ({
    id: treaty.id,
    slug: treaty.id,
    name: treaty.title,
    type: treaty.metadata.includes("trade") ? "Trade" : "Policy",
    description: treaty.description,
    href: treaty.href,
    metadata: treaty.metadata,
  }));
}

function staticSectors(): StaticSector[] {
  return agrisphereSectors.map((sector) => ({
    id: sector.id,
    slug: sector.id,
    name: sector.title,
    description: sector.description,
    href: sector.href,
    metadata: sector.metadata,
  }));
}

function searchResultHaystack(record: AgriSphereSearchResult) {
  return normalize(`${record.title} ${record.description} ${record.category} ${record.metadata.join(" ")}`);
}

function scoreResult(record: AgriSphereSearchResult, query: string) {
  if (!query) {
    return record.category === "countries" ? 2 : 1;
  }

  const title = normalize(record.title);
  const haystack = searchResultHaystack(record);

  return (
    (title === query ? 10 : 0) +
    (title.startsWith(query) ? 5 : 0) +
    (title.includes(query) ? 3 : 0) +
    (haystack.includes(query) ? 1 : 0)
  );
}

function searchRecords({
  records,
  query,
  category,
  limit,
}: SearchInput & {
  records: AgriSphereSearchResult[];
}) {
  const normalizedQuery = normalize(query ?? "");
  const normalizedCategory = normalize(category ?? "all");
  const categoryIds = new Set(searchCategories.map((item) => item.id));
  const scopedCategory = categoryIds.has(normalizedCategory as AgriSphereSearchCategory)
    ? (normalizedCategory as AgriSphereSearchCategory)
    : "all";
  const maxResults = clampLimit(limit);
  const scopedRecords =
    scopedCategory === "all" ? records : records.filter((record) => record.category === scopedCategory);
  const results = scopedRecords
    .map((record) => ({
      record,
      score: scoreResult(record, normalizedQuery),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.record.title.localeCompare(b.record.title))
    .slice(0, maxResults)
    .map((item) => item.record);

  return {
    query: normalizedQuery,
    category: scopedCategory,
    count: results.length,
    results,
  };
}

function buildSearchIndexFromRecords({
  countries,
  continents,
  organizations,
  treaties,
  sectors,
  producers,
}: {
  countries: AgriSphereCountry[];
  continents: AgriSphereContinent[];
  organizations: StaticOrganization[];
  treaties: StaticTreaty[];
  sectors: StaticSector[];
  producers: AgriSphereProducer[];
}): AgriSphereSearchResult[] {
  const countryResults = countries.map((country) => ({
    id: `country:${country.code}`,
    category: "countries" as const,
    title: country.name,
    description: country.summary,
    href: countryHref(country),
    metadata: [
      country.code,
      country.continentCode,
      activityTierMeta[country.activityTier].label,
      ...country.primaryCrops,
    ],
  }));

  const crops = Array.from(new Set(countries.flatMap((country) => country.primaryCrops))).sort();
  const cropResults = crops.map((crop) => {
    const countryMatches = countries.filter((country) => country.primaryCrops.includes(crop));

    return {
      id: `crop:${crop.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      category: "crops" as const,
      title: crop,
      description:
        countryMatches.length > 0
          ? `Found in ${countryMatches.slice(0, 4).map((country) => country.name).join(", ")}.`
          : "Crop signal ready for indexing.",
      href: FALLBACK_SEARCH_HREF,
      metadata: countryMatches.flatMap((country) => [country.name, country.code, country.continentCode]),
    };
  });

  const organizationResults = organizations.map((organization) => ({
    id: organization.id,
    category: "organizations" as const,
    title: organization.name,
    description: organization.description,
    href: organization.href,
    metadata: organization.metadata,
  }));

  const treatyResults = treaties.map((treaty) => ({
    id: treaty.id,
    category: "treaties" as const,
    title: treaty.name,
    description: treaty.description,
    href: treaty.href,
    metadata: treaty.metadata,
  }));

  const sectorResults = sectors.map((sector) => ({
    id: sector.id,
    category: "sectors" as const,
    title: sector.name,
    description: sector.description,
    href: sector.href,
    metadata: sector.metadata,
  }));

  const producerResults = producers.map((producer) => ({
    id: `producer:${producer.countryCode}`,
    category: "top-producers" as const,
    title: `${producer.rank}. ${producer.countryName}`,
    description: `${producer.commodities.join(", ")}. ${producer.signal}`,
    href: countryHref(countries.find((country) => country.code === producer.countryCode) ?? { slug: "" }),
    metadata: [producer.countryCode, producer.countryName, ...producer.commodities],
  }));

  const continentResults = continents.map((continent) => ({
    id: `continent:${continent.code}`,
    category: "continents" as const,
    title: continent.name,
    description: continent.summary,
    href: "/dashboard?section=agrisphere-dashboard#continents",
    metadata: [continent.code, ...continent.priorityCrops],
  }));

  return [
    ...countryResults,
    ...cropResults,
    ...organizationResults,
    ...treatyResults,
    ...sectorResults,
    ...producerResults,
    ...continentResults,
  ];
}

async function dbCountries(prisma: PrismaClient) {
  const countries = await prisma.agriSphereCountry.findMany({
    orderBy: [{ name: "asc" }],
  });

  return countries.length > 0 ? countries.map(countryFromStored) : null;
}

async function dbContinents(prisma: PrismaClient) {
  const continents = await prisma.agriSphereContinent.findMany({
    orderBy: [{ name: "asc" }],
  });

  return continents.length > 0 ? continents.map(continentFromStored) : null;
}

async function dbOrganizations(prisma: PrismaClient) {
  const organizations = await prisma.agriSphereOrganization.findMany({
    orderBy: [{ name: "asc" }],
  });

  return organizations.length > 0 ? organizations.map(organizationFromStored) : null;
}

async function dbTreaties(prisma: PrismaClient) {
  const treaties = await prisma.agriSphereTreaty.findMany({
    orderBy: [{ name: "asc" }],
  });

  return treaties.length > 0 ? treaties.map(treatyFromStored) : null;
}

async function dbSectors(prisma: PrismaClient) {
  const sectors = await prisma.agriSphereSector.findMany({
    orderBy: [{ name: "asc" }],
  });

  return sectors.length > 0 ? sectors.map(sectorFromStored) : null;
}

async function dbProducers(prisma: PrismaClient) {
  const producers = await prisma.agriSphereProducer.findMany({
    where: { isTopProducer: true },
    orderBy: [{ producerRank: "asc" }, { name: "asc" }],
  });

  return producers.length > 0 ? producers.map(producerFromStored) : null;
}

async function dbOpportunities(prisma: PrismaClient) {
  const opportunities = await prisma.agriSphereOpportunity.findMany({
    where: { status: AgriSphereOpportunityStatus.ACTIVE },
    orderBy: [{ createdAt: "desc" }, { title: "asc" }],
  });

  return opportunities.length > 0 ? opportunities.map(opportunityFromStored) : null;
}

export async function getAgriSphereMapData() {
  const result = await databaseOrFallback({
    key: "agrisphere:map",
    load: async (prisma) => {
      const [countries, continents] = await Promise.all([dbCountries(prisma), dbContinents(prisma)]);

      if (!countries || !continents) {
        return null;
      }

      return {
        tiers: activityTierMeta,
        continents,
        countries,
      };
    },
    fallback: () => ({
      tiers: activityTierMeta,
      continents: agrisphereContinents,
      countries: agrisphereCountries,
    }),
  });

  return {
    source: result.source,
    ...result.data,
  };
}

export async function getAgriSphereStatsData() {
  const result = await databaseOrFallback<AgriSphereStat[]>({
    key: "agrisphere:stats",
    load: async (prisma) => {
      const snapshot = await prisma.agriSpherePlatformStatsSnapshot.findFirst({
        orderBy: { recordedAt: "desc" },
      });

      if (!snapshot) {
        return null;
      }

      return agrisphereStats.map((stat) => {
        if (stat.id === "countries") {
          return { ...stat, value: `${snapshot.countryCount.toLocaleString()}+` };
        }

        if (stat.id === "farmers") {
          return { ...stat, value: `${Math.round(snapshot.farmerCount / 1_000_000)}M+` };
        }

        if (stat.id === "partners") {
          return { ...stat, value: `${snapshot.partnerCount.toLocaleString()}+` };
        }

        if (stat.id === "opportunities") {
          return { ...stat, value: `${snapshot.activeProjectCount.toLocaleString()}+` };
        }

        return stat;
      });
    },
    fallback: () => agrisphereStats,
  });

  return {
    source: result.source,
    stats: result.data,
  };
}

export async function getAgriSphereCountriesData() {
  const result = await databaseOrFallback({
    key: "agrisphere:countries",
    load: dbCountries,
    fallback: () => agrisphereCountries,
  });

  return {
    source: result.source,
    count: result.data.length,
    countries: result.data,
  };
}

export async function getAgriSphereCountryData(code: string) {
  const normalized = normalize(code);
  const result = await databaseOrFallback<AgriSphereCountry | null>({
    key: `agrisphere:country:${normalized}`,
    load: async (prisma) => {
      const country = await prisma.agriSphereCountry.findFirst({
        where: {
          OR: [
            { code: { equals: code, mode: "insensitive" } },
            { slug: { equals: code, mode: "insensitive" } },
            { name: { equals: code, mode: "insensitive" } },
          ],
        },
      });

      return country ? countryFromStored(country) : null;
    },
    fallback: () =>
      agrisphereCountries.find(
        (country) =>
          normalize(country.code) === normalized ||
          normalize(country.slug) === normalized ||
          normalize(country.name) === normalized,
      ) ?? null,
  });

  return {
    source: result.source,
    country: result.data,
  };
}

export async function getAgriSphereContinentsData() {
  const result = await databaseOrFallback({
    key: "agrisphere:continents",
    load: dbContinents,
    fallback: () => agrisphereContinents,
  });

  return {
    source: result.source,
    count: result.data.length,
    continents: result.data,
  };
}

export async function getAgriSphereContinentCountriesData(code: string) {
  const normalized = normalize(code);
  const result = await databaseOrFallback<{
    continent: AgriSphereContinent | null;
    countries: AgriSphereCountry[];
  }>({
    key: `agrisphere:continent-countries:${normalized}`,
    load: async (prisma) => {
      const continent = await prisma.agriSphereContinent.findFirst({
        where: {
          OR: [
            { code: { equals: code, mode: "insensitive" } },
            { name: { equals: code, mode: "insensitive" } },
          ],
        },
      });

      if (!continent) {
        return {
          continent: null,
          countries: [],
        };
      }

      const countries = await prisma.agriSphereCountry.findMany({
        where: { continentCode: continent.code },
        orderBy: [{ name: "asc" }],
      });

      return {
        continent: continentFromStored(continent),
        countries: countries.map(countryFromStored),
      };
    },
    fallback: () => {
      const continent =
        agrisphereContinents.find(
          (item) => normalize(item.code) === normalized || normalize(item.name) === normalized,
        ) ?? null;

      return {
        continent,
        countries: continent
          ? agrisphereCountries.filter((country) => country.continentCode === continent.code)
          : [],
      };
    },
  });

  return {
    source: result.source,
    continent: result.data.continent,
    count: result.data.countries.length,
    countries: result.data.countries,
  };
}

export async function getAgriSphereTopProducersData() {
  const result = await databaseOrFallback({
    key: "agrisphere:producers:top",
    load: dbProducers,
    fallback: () => agrisphereTopProducers,
  });

  return {
    source: result.source,
    count: result.data.length,
    producers: result.data,
  };
}

export async function getAgriSphereOrganizationsData() {
  const result = await databaseOrFallback({
    key: "agrisphere:organizations",
    load: dbOrganizations,
    fallback: staticOrganizations,
  });

  return {
    source: result.source,
    count: result.data.length,
    organizations: result.data,
  };
}

export async function getAgriSphereTreatiesData() {
  const result = await databaseOrFallback({
    key: "agrisphere:treaties",
    load: dbTreaties,
    fallback: staticTreaties,
  });

  return {
    source: result.source,
    count: result.data.length,
    treaties: result.data,
  };
}

export async function getAgriSphereSectorsData() {
  const result = await databaseOrFallback({
    key: "agrisphere:sectors",
    load: dbSectors,
    fallback: staticSectors,
  });

  return {
    source: result.source,
    count: result.data.length,
    sectors: result.data,
  };
}

export async function getAgriSphereEventsData() {
  const result = await databaseOrFallback({
    key: "agrisphere:events",
    load: async (prisma) => {
      const events = await prisma.agriSphereEvent.findMany({
        orderBy: [{ startsAt: "asc" }, { title: "asc" }],
      });

      return events.length > 0 ? events.map(eventFromStored) : null;
    },
    fallback: () => agrisphereEvents,
  });

  return {
    source: result.source,
    count: result.data.length,
    events: result.data,
  };
}

export async function getAgriSpherePartnersData() {
  const result = await databaseOrFallback({
    key: "agrisphere:partners",
    load: async (prisma) => {
      const partners = await prisma.agriSpherePartner.findMany({
        orderBy: [{ tier: "asc" }, { sortOrder: "asc" }],
      });

      return partners.length > 0 ? partners.map(partnerFromStored) : null;
    },
    fallback: () => agrispherePartners,
  });

  return {
    source: result.source,
    count: result.data.length,
    partners: result.data,
  };
}

export async function getAgriSphereOpportunityData(idOrSlug: string) {
  const normalized = normalize(idOrSlug);
  const result = await databaseOrFallback<AgriSphereOpportunity | null>({
    key: `agrisphere:opportunity:${normalized}`,
    load: async (prisma) => {
      const opportunity = await prisma.agriSphereOpportunity.findFirst({
        where: {
          status: AgriSphereOpportunityStatus.ACTIVE,
          OR: [
            { id: idOrSlug },
            { slug: { equals: idOrSlug, mode: "insensitive" } },
          ],
        },
      });

      return opportunity ? opportunityFromStored(opportunity) : null;
    },
    fallback: () =>
      agrisphereOpportunities.find(
        (opportunity) =>
          opportunity.status === "active" &&
          (normalize(opportunity.id) === normalized || normalize(opportunity.slug) === normalized),
      ) ?? null,
  });

  return {
    source: result.source,
    opportunity: result.data,
  };
}

export async function searchAgriSphereData(input: SearchInput) {
  const limit = clampLimit(input.limit);
  const cacheKey = `agrisphere:search:${normalize(input.query ?? "")}:${normalize(input.category ?? "all")}:${limit}`;
  const result = await cached<DatabaseResult<ReturnType<typeof searchAgriSphere>>>(
    cacheKey,
    SEARCH_CACHE_TTL_MS,
    async () => {
      const openSearchResult = await searchOpenSearch({ ...input, limit });

      if (openSearchResult) {
        return {
          source: sourceFor("open-search"),
          data: openSearchResult,
        };
      }

      return databaseOrFallback({
        key: `${cacheKey}:database-fallback`,
        ttlMs: SEARCH_CACHE_TTL_MS,
        load: async (prisma) => {
          const [countries, continents, organizations, treaties, sectors, producers] = await Promise.all([
            dbCountries(prisma),
            dbContinents(prisma),
            dbOrganizations(prisma),
            dbTreaties(prisma),
            dbSectors(prisma),
            dbProducers(prisma),
          ]);

          if (!countries || !continents || !organizations || !treaties || !sectors || !producers) {
            return null;
          }

          const records = buildSearchIndexFromRecords({
            countries,
            continents,
            organizations,
            treaties,
            sectors,
            producers,
          });

          return searchRecords({ ...input, limit, records });
        },
        fallback: () => searchAgriSphere({ ...input, limit }),
      });
    },
  );

  return {
    source: result.source,
    categories: searchCategories,
    grouped: groupSearchResults(result.data.results),
    ...result.data,
  };
}

type PersonalizationUser = {
  profile: {
    country: string | null;
    region: string | null;
    interests: string[];
    primaryCropsLivestock: string[];
  } | null;
  selectedRoles: Array<{
    role: {
      title: string;
      category: {
        name: string;
      };
    };
  }>;
  agriSphereSavedItems: Array<{
    opportunity: {
      id: string;
      slug: string;
      title: string;
      description: string;
      category: string;
      countryCode: string | null;
      region: string | null;
      crops: string[];
      status: string;
      href: string | null;
      metadata: string[];
    };
  }>;
};

type StoredPersonaCluster = {
  schemaVersion: 1;
  model: {
    terms: string[];
    idf: number[];
    documentCount: number;
  };
  centroid: number[];
  opportunityIds: string[];
};

function personalizationProfile(user: PersonalizationUser): AgriSpherePersonalizationProfile {
  return {
    role: user.selectedRoles[0]?.role.title,
    category: user.selectedRoles[0]?.role.category.name,
    country: user.profile?.country,
    region: user.profile?.region,
    interests: user.profile?.interests ?? [],
    crops: user.profile?.primaryCropsLivestock ?? [],
    savedOpportunities: user.agriSphereSavedItems.map(({ opportunity }) =>
      opportunityFromStored(opportunity),
    ),
  };
}

function storedPersonaCluster(value: Prisma.JsonValue): StoredPersonaCluster | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const cluster = value as Record<string, unknown>;
  const model = cluster.model;

  if (!model || typeof model !== "object" || Array.isArray(model)) {
    return null;
  }

  const modelRecord = model as Record<string, unknown>;

  if (
    cluster.schemaVersion !== 1 ||
    !Array.isArray(cluster.centroid) ||
    !cluster.centroid.every((item) => typeof item === "number" && Number.isFinite(item)) ||
    !Array.isArray(cluster.opportunityIds) ||
    !cluster.opportunityIds.every((item) => typeof item === "string") ||
    !Array.isArray(modelRecord.terms) ||
    !modelRecord.terms.every((item) => typeof item === "string") ||
    !Array.isArray(modelRecord.idf) ||
    !modelRecord.idf.every((item) => typeof item === "number" && Number.isFinite(item)) ||
    typeof modelRecord.documentCount !== "number"
  ) {
    return null;
  }

  return cluster as StoredPersonaCluster;
}

async function coldStartClusterRanking(
  prisma: PrismaClient,
  profile: AgriSpherePersonalizationProfile,
  opportunities: AgriSphereOpportunity[],
) {
  const records = await prisma.agriSpherePersonaCluster.findMany({
    orderBy: { clusterId: "asc" },
  });
  const clusters = records
    .map((record) => ({
      clusterId: record.clusterId,
      cluster: storedPersonaCluster(record.centroidVector),
    }))
    .filter(
      (record): record is { clusterId: number; cluster: StoredPersonaCluster } =>
        Boolean(record.cluster),
    );

  if (clusters.length !== PERSONA_CLUSTER_COUNT) {
    return null;
  }

  const model = clusters[0].cluster.model;
  const profileVector = vectorizeAgriSphereProfile(profile, model);
  const clusterIndex = new KMeans(PERSONA_CLUSTER_COUNT).predict(
    profileVector,
    clusters.map(({ cluster }) => cluster.centroid),
  );
  const selected = clusters[clusterIndex];
  const cachedIds = await getRedisJson<string[]>(
    `ifu:agrisphere:sprint-2:persona-cluster:${selected.clusterId}`,
  );
  const opportunityIds = cachedIds ?? selected.cluster.opportunityIds;
  const directRanking = rankAgriSphereOpportunities(opportunities, profile, 50);
  const recommendationsById = new Map(
    directRanking.map((recommendation) => [recommendation.opportunity.id, recommendation]),
  );
  const ranked = opportunityIds
    .map((opportunityId) => recommendationsById.get(opportunityId))
    .filter((recommendation): recommendation is NonNullable<typeof recommendation> =>
      Boolean(recommendation),
    );

  return {
    clusterId: selected.clusterId,
    recommendations: ranked.length > 0 ? ranked.slice(0, 20) : directRanking.slice(0, 20),
  };
}

export async function getAgriSphereDashboardFeed(session: AuthSession) {
  const prisma = getPrisma();
  const userRecord = await syncAuthenticatedUser(session);
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userRecord.id },
    select: {
      profile: {
        select: {
          country: true,
          region: true,
          interests: true,
          primaryCropsLivestock: true,
        },
      },
      selectedRoles: {
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
        take: 1,
        select: {
          role: {
            select: {
              title: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      agriSphereSavedItems: {
        orderBy: { savedAt: "desc" },
        select: {
          opportunity: true,
        },
      },
    },
  });
  const opportunities =
    (await dbOpportunities(prisma)) ??
    agrisphereOpportunities.filter((opportunity) => opportunity.status === "active");
  const profile = personalizationProfile(user);
  const coldStart = profile.savedOpportunities.length === 0;
  const clusterRanking = coldStart
    ? await coldStartClusterRanking(prisma, profile, opportunities)
    : null;
  const ranked =
    clusterRanking?.recommendations ?? rankAgriSphereOpportunities(opportunities, profile, 20);
  const savedIds = new Set(profile.savedOpportunities.map((opportunity) => opportunity.id));

  return {
    source: sourceFor(
      "database",
      "Ranked from active AgriSphere opportunities, member profile signals, and saved history.",
    ),
    count: ranked.length,
    opportunities: ranked.map(({ opportunity, matchScore, matchReasons }) => ({
      ...opportunity,
      matchScore: Number(matchScore.toFixed(4)),
      matchReasons,
      saved: savedIds.has(opportunity.id),
    })),
    meta: {
      ranking: clusterRanking ? "persona-cluster" : "tfidf-cosine",
      limit: 20,
      coldStart,
      personaCluster: clusterRanking?.clusterId ?? null,
      savedSignalCount: profile.savedOpportunities.length,
    },
  };
}

export async function refreshAgriSpherePersonaClusters() {
  const prisma = getPrisma();
  const [storedOpportunities, users] = await Promise.all([
    dbOpportunities(prisma),
    prisma.user.findMany({
      orderBy: { id: "asc" },
      select: {
        profile: {
          select: {
            country: true,
            region: true,
            interests: true,
            primaryCropsLivestock: true,
          },
        },
        selectedRoles: {
          orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
          take: 1,
          select: {
            role: {
              select: {
                title: true,
                category: {
                  select: { name: true },
                },
              },
            },
          },
        },
        agriSphereSavedItems: {
          orderBy: { savedAt: "desc" },
          select: { opportunity: true },
        },
      },
    }),
  ]);
  const opportunities = storedOpportunities ?? [];

  if (opportunities.length === 0) {
    return {
      status: "skipped" as const,
      reason: "No active opportunities are available.",
      userCount: users.length,
      opportunityCount: 0,
    };
  }

  if (users.length < PERSONA_CLUSTER_COUNT) {
    return {
      status: "skipped" as const,
      reason: `At least ${PERSONA_CLUSTER_COUNT} user profiles are required for clustering.`,
      userCount: users.length,
      opportunityCount: opportunities.length,
    };
  }

  const vectorizer = fitAgriSphereOpportunityVectorizer(opportunities);
  const model = vectorizer.exportModel();
  const vectors = users.map((user) =>
    vectorizer.transform(buildAgriSphereProfileTokens(personalizationProfile(user))),
  );
  const kmeans = new KMeans(PERSONA_CLUSTER_COUNT, 100, 1e-4, "agrisphere-personas-v1");
  const result = kmeans.fit(vectors);
  const refreshedAt = new Date();
  const clusterPayloads = result.centroids.map((centroid, clusterId) => {
    const ranking = rankAgriSphereOpportunitiesAgainstVector(
      opportunities,
      centroid,
      model,
      50,
    );
    const opportunityIds = ranking.map(({ opportunity }) => opportunity.id);

    return {
      clusterId,
      opportunityIds,
      stored: {
        schemaVersion: 1,
        model,
        centroid,
        opportunityIds,
      } satisfies StoredPersonaCluster,
    };
  });

  await prisma.$transaction(
    clusterPayloads.map(({ clusterId, stored }) =>
      prisma.agriSpherePersonaCluster.upsert({
        where: { clusterId },
        update: {
          centroidVector: stored as unknown as Prisma.InputJsonValue,
          lastRefreshedAt: refreshedAt,
        },
        create: {
          clusterId,
          centroidVector: stored as unknown as Prisma.InputJsonValue,
          lastRefreshedAt: refreshedAt,
        },
      }),
    ),
  );
  await Promise.all(
    clusterPayloads.map(({ clusterId, opportunityIds }) =>
      setRedisJson(
        `ifu:agrisphere:sprint-2:persona-cluster:${clusterId}`,
        opportunityIds,
        PERSONA_CLUSTER_CACHE_TTL_MS,
      ),
    ),
  );

  return {
    status: "refreshed" as const,
    clusterCount: clusterPayloads.length,
    userCount: users.length,
    opportunityCount: opportunities.length,
    iterations: result.iterations,
    refreshedAt: refreshedAt.toISOString(),
  };
}

async function findOpportunityForSave(prisma: PrismaClient, idOrSlug: string) {
  return prisma.agriSphereOpportunity.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: { equals: idOrSlug, mode: "insensitive" } },
      ],
    },
    select: { id: true, slug: true, title: true },
  });
}

export async function saveAgriSphereOpportunity(session: AuthSession, idOrSlug: string) {
  const prisma = getPrisma();
  const user = await syncAuthenticatedUser(session);
  const opportunity = await findOpportunityForSave(prisma, idOrSlug);

  if (!opportunity) {
    return null;
  }

  await prisma.agriSphereSavedItem.upsert({
    where: {
      userId_opportunityId: {
        userId: user.id,
        opportunityId: opportunity.id,
      },
    },
    update: {
      savedAt: new Date(),
    },
    create: {
      userId: user.id,
      opportunityId: opportunity.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "AGRISPHERE_OPPORTUNITY_SAVED",
      entityType: "AgriSphereOpportunity",
      entityId: opportunity.id,
      metadata: {
        opportunitySlug: opportunity.slug,
        opportunityTitle: opportunity.title,
      },
    },
  });

  return {
    source: sourceFor("database"),
    opportunity,
    result: "saved_item_created",
  };
}

export async function deleteAgriSphereOpportunitySave(session: AuthSession, idOrSlug: string) {
  const prisma = getPrisma();
  const user = await syncAuthenticatedUser(session);
  const opportunity = await findOpportunityForSave(prisma, idOrSlug);

  if (!opportunity) {
    return null;
  }

  await prisma.agriSphereSavedItem.deleteMany({
    where: {
      userId: user.id,
      opportunityId: opportunity.id,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "AGRISPHERE_OPPORTUNITY_UNSAVED",
      entityType: "AgriSphereOpportunity",
      entityId: opportunity.id,
      metadata: {
        opportunitySlug: opportunity.slug,
        opportunityTitle: opportunity.title,
      },
    },
  });

  return {
    source: sourceFor("database"),
    opportunity,
    result: "saved_item_removed",
  };
}

export async function getAgriSphereHealthData() {
  const serviceStatusPromise = getAgriSphereServiceStatus();

  try {
    const prisma = getPrisma();
    const [countryCount, opportunityCount, serviceStatus] = await Promise.all([
      prisma.agriSphereCountry.count(),
      prisma.agriSphereOpportunity.count(),
      serviceStatusPromise,
    ]);

    if (countryCount > 0) {
      const source = sourceFor("database");

      return {
        source: {
          ...source,
          dependencies: {
            ...source.dependencies,
            ...serviceStatus,
          },
        },
        checks: {
          apiPrefix: "/v1",
          corpusLoaded: true,
          countryCount,
          opportunityCount,
          databaseBacked: true,
        },
      };
    }
  } catch (error) {
    if (!shouldUseFallback(error)) {
      throw error;
    }
  }

  const serviceStatus = await serviceStatusPromise;
  const source = sourceFor("static-fallback");

  return {
    source: {
      ...source,
      dependencies: {
        ...source.dependencies,
        ...serviceStatus,
      },
    },
    checks: {
      apiPrefix: "/v1",
      corpusLoaded: agrisphereCountries.length > 0,
      countryCount: agrisphereCountries.length,
      opportunityCount: agrisphereOpportunities.length,
      databaseBacked: false,
    },
  };
}
