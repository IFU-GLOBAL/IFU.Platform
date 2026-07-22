export type AgriSphereActivityTier = "high" | "medium" | "emerging" | "low" | "no-data";

export type AgriSphereSearchCategory =
  | "countries"
  | "crops"
  | "organizations"
  | "treaties"
  | "sectors"
  | "top-producers"
  | "continents";

export type AgriSphereCountry = {
  code: string;
  slug: string;
  name: string;
  continentCode: string;
  latitude: number;
  longitude: number;
  activityTier: AgriSphereActivityTier;
  primaryCrops: string[];
  opportunityCount: number;
  producerRank?: number;
  summary: string;
};

export type AgriSphereContinent = {
  code: string;
  name: string;
  summary: string;
  priorityCrops: string[];
  countryCount: number;
};

export type AgriSphereStat = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

export type AgriSphereOpportunityStatus = "active" | "closed" | "draft";

export type AgriSphereOpportunity = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  countryCode?: string;
  region?: string;
  crops: string[];
  status: AgriSphereOpportunityStatus;
  href: string;
  metadata: string[];
};

export type AgriSphereProducer = {
  rank: number;
  countryCode: string;
  countryName: string;
  commodities: string[];
  activityTier: AgriSphereActivityTier;
  signal: string;
};

export type AgriSphereEventFormat = "virtual" | "in-person" | "hybrid";

export type AgriSphereEvent = {
  id: string;
  slug: string;
  title: string;
  eventType: string;
  startsAt: string;
  endsAt?: string;
  format: AgriSphereEventFormat;
  url?: string;
  countryCode?: string;
  metadata: string[];
};

export type AgriSpherePartnerTier = "institutional" | "strategic" | "community";

export type AgriSpherePartner = {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  tier: AgriSpherePartnerTier;
  url?: string;
  sortOrder: number;
  metadata: string[];
};

export type AgriSphereSearchResult = {
  id: string;
  category: AgriSphereSearchCategory;
  title: string;
  description: string;
  href: string;
  metadata: string[];
};

export const agrisphereSource = {
  module: "AgriSphere",
  version: "sprint-2.5-foundation",
  lastUpdated: "2026-07-22",
  status: "Sprint 2 personalization and Sprint 2.5 security/audit foundation",
  refreshCadence: "Database-backed when seeded, static fallback when unavailable",
  localeReadyPath: "/{locale}/dashboard?section=agrisphere-dashboard",
};

const AGRISPHERE_DASHBOARD_HREF = "/dashboard?section=agrisphere-dashboard";

export const activityTierMeta: Record<
  AgriSphereActivityTier,
  { label: string; color: string; background: string; sortOrder: number }
> = {
  high: {
    label: "High",
    color: "#1f7a37",
    background: "#e8f5e9",
    sortOrder: 1,
  },
  medium: {
    label: "Medium",
    color: "#3f7f9f",
    background: "#e6f2f7",
    sortOrder: 2,
  },
  emerging: {
    label: "Emerging",
    color: "#bd7a1e",
    background: "#fff3df",
    sortOrder: 3,
  },
  low: {
    label: "Low",
    color: "#7c8794",
    background: "#f1f3f5",
    sortOrder: 4,
  },
  "no-data": {
    label: "No Data",
    color: "#a7adb5",
    background: "#f8f9fa",
    sortOrder: 5,
  },
};

export const searchCategories: Array<{
  id: AgriSphereSearchCategory;
  label: string;
}> = [
  { id: "countries", label: "Countries" },
  { id: "crops", label: "Crops" },
  { id: "organizations", label: "Organizations" },
  { id: "treaties", label: "Treaties" },
  { id: "sectors", label: "Sectors" },
  { id: "top-producers", label: "Top Producers" },
  { id: "continents", label: "Continents" },
];

export const agrisphereContinents: AgriSphereContinent[] = [
  {
    code: "africa",
    name: "Africa",
    summary: "Producer networks, regional food security, agro-processing, and climate-smart adoption.",
    priorityCrops: ["Cocoa", "Coffee", "Maize", "Tea", "Sorghum"],
    countryCount: 54,
  },
  {
    code: "asia",
    name: "Asia",
    summary: "Rice, wheat, aquaculture, smallholder scale, and high-volume food systems.",
    priorityCrops: ["Rice", "Wheat", "Tea", "Palm oil", "Spices"],
    countryCount: 49,
  },
  {
    code: "europe",
    name: "Europe",
    summary: "Policy alignment, specialty production, cooperative systems, and traceability.",
    priorityCrops: ["Wheat", "Barley", "Grapes", "Dairy", "Potatoes"],
    countryCount: 44,
  },
  {
    code: "north-america",
    name: "North America",
    summary: "Large-scale production, precision agriculture, food processing, and cross-border trade.",
    priorityCrops: ["Corn", "Soybeans", "Wheat", "Avocado", "Canola"],
    countryCount: 23,
  },
  {
    code: "south-america",
    name: "South America",
    summary: "Global commodities, export logistics, sustainable production, and bioeconomy signals.",
    priorityCrops: ["Soybeans", "Coffee", "Sugarcane", "Beef", "Corn"],
    countryCount: 12,
  },
  {
    code: "oceania",
    name: "Oceania",
    summary: "Rangeland systems, export quality, water resilience, and biosecurity practices.",
    priorityCrops: ["Wheat", "Beef", "Wool", "Dairy", "Wine grapes"],
    countryCount: 14,
  },
];

export const agrisphereCountries: AgriSphereCountry[] = [
  {
    code: "US",
    slug: "united-states",
    name: "United States",
    continentCode: "north-america",
    latitude: 37.0902,
    longitude: -95.7129,
    activityTier: "high",
    primaryCrops: ["Corn", "Soybeans", "Wheat"],
    opportunityCount: 42,
    producerRank: 2,
    summary: "Precision agriculture, commodity exports, finance, and carbon-market activity.",
  },
  {
    code: "BR",
    slug: "brazil",
    name: "Brazil",
    continentCode: "south-america",
    latitude: -14.235,
    longitude: -51.9253,
    activityTier: "high",
    primaryCrops: ["Soybeans", "Coffee", "Sugarcane"],
    opportunityCount: 38,
    producerRank: 1,
    summary: "Global crop exports, agro-processing, logistics, and sustainability programs.",
  },
  {
    code: "IN",
    slug: "india",
    name: "India",
    continentCode: "asia",
    latitude: 20.5937,
    longitude: 78.9629,
    activityTier: "high",
    primaryCrops: ["Rice", "Wheat", "Cotton"],
    opportunityCount: 36,
    producerRank: 3,
    summary: "Smallholder services, training at scale, farmer finance, and food security.",
  },
  {
    code: "CN",
    slug: "china",
    name: "China",
    continentCode: "asia",
    latitude: 35.8617,
    longitude: 104.1954,
    activityTier: "high",
    primaryCrops: ["Rice", "Wheat", "Vegetables"],
    opportunityCount: 31,
    producerRank: 4,
    summary: "High-volume production, protected agriculture, food systems, and agri-data.",
  },
  {
    code: "NG",
    slug: "nigeria",
    name: "Nigeria",
    continentCode: "africa",
    latitude: 9.082,
    longitude: 8.6753,
    activityTier: "medium",
    primaryCrops: ["Cassava", "Maize", "Rice"],
    opportunityCount: 29,
    producerRank: 9,
    summary: "Food security, youth agriculture, processing, and market-access programs.",
  },
  {
    code: "KE",
    slug: "kenya",
    name: "Kenya",
    continentCode: "africa",
    latitude: -0.0236,
    longitude: 37.9062,
    activityTier: "emerging",
    primaryCrops: ["Tea", "Coffee", "Maize"],
    opportunityCount: 24,
    summary: "AgTech, climate-smart training, exports, and cooperative digitization.",
  },
  {
    code: "MX",
    slug: "mexico",
    name: "Mexico",
    continentCode: "north-america",
    latitude: 23.6345,
    longitude: -102.5528,
    activityTier: "medium",
    primaryCrops: ["Maize", "Avocado", "Beans"],
    opportunityCount: 22,
    producerRank: 10,
    summary: "Cross-border trade, specialty crops, food processing, and supplier verification.",
  },
  {
    code: "CA",
    slug: "canada",
    name: "Canada",
    continentCode: "north-america",
    latitude: 56.1304,
    longitude: -106.3468,
    activityTier: "medium",
    primaryCrops: ["Canola", "Wheat", "Pulses"],
    opportunityCount: 21,
    summary: "Grain corridors, cooperative networks, climate resilience, and research partnerships.",
  },
  {
    code: "AR",
    slug: "argentina",
    name: "Argentina",
    continentCode: "south-america",
    latitude: -38.4161,
    longitude: -63.6167,
    activityTier: "high",
    primaryCrops: ["Soybeans", "Corn", "Beef"],
    opportunityCount: 27,
    producerRank: 6,
    summary: "Commodity systems, rangeland management, exports, and bioeconomy opportunities.",
  },
  {
    code: "FR",
    slug: "france",
    name: "France",
    continentCode: "europe",
    latitude: 46.2276,
    longitude: 2.2137,
    activityTier: "medium",
    primaryCrops: ["Wheat", "Grapes", "Dairy"],
    opportunityCount: 18,
    summary: "Policy alignment, cooperatives, specialty products, and traceability systems.",
  },
  {
    code: "NL",
    slug: "netherlands",
    name: "Netherlands",
    continentCode: "europe",
    latitude: 52.1326,
    longitude: 5.2913,
    activityTier: "medium",
    primaryCrops: ["Vegetables", "Flowers", "Dairy"],
    opportunityCount: 17,
    summary: "Controlled-environment agriculture, logistics, research, and water efficiency.",
  },
  {
    code: "DE",
    slug: "germany",
    name: "Germany",
    continentCode: "europe",
    latitude: 51.1657,
    longitude: 10.4515,
    activityTier: "medium",
    primaryCrops: ["Wheat", "Barley", "Potatoes"],
    opportunityCount: 16,
    summary: "Machinery, food processing, bioeconomy, and standards-led trade.",
  },
  {
    code: "AU",
    slug: "australia",
    name: "Australia",
    continentCode: "oceania",
    latitude: -25.2744,
    longitude: 133.7751,
    activityTier: "medium",
    primaryCrops: ["Wheat", "Beef", "Wool"],
    opportunityCount: 19,
    producerRank: 8,
    summary: "Dryland farming, rangeland systems, export quality, and water resilience.",
  },
  {
    code: "GH",
    slug: "ghana",
    name: "Ghana",
    continentCode: "africa",
    latitude: 7.9465,
    longitude: -1.0232,
    activityTier: "emerging",
    primaryCrops: ["Cocoa", "Cassava", "Yams"],
    opportunityCount: 15,
    summary: "Cocoa traceability, cooperative growth, youth agriculture, and processing.",
  },
  {
    code: "CM",
    slug: "cameroon",
    name: "Cameroon",
    continentCode: "africa",
    latitude: 7.3697,
    longitude: 12.3547,
    activityTier: "emerging",
    primaryCrops: ["Cocoa", "Coffee", "Bananas"],
    opportunityCount: 14,
    summary: "Cooperative digitization, traceability, agro-processing, and export pathways.",
  },
  {
    code: "ET",
    slug: "ethiopia",
    name: "Ethiopia",
    continentCode: "africa",
    latitude: 9.145,
    longitude: 40.4897,
    activityTier: "emerging",
    primaryCrops: ["Coffee", "Teff", "Sesame"],
    opportunityCount: 13,
    summary: "Coffee value chains, food security, extension support, and water resilience.",
  },
  {
    code: "EG",
    slug: "egypt",
    name: "Egypt",
    continentCode: "africa",
    latitude: 26.8206,
    longitude: 30.8025,
    activityTier: "medium",
    primaryCrops: ["Wheat", "Cotton", "Vegetables"],
    opportunityCount: 12,
    summary: "Irrigation, protected agriculture, food imports, and regional logistics.",
  },
  {
    code: "ID",
    slug: "indonesia",
    name: "Indonesia",
    continentCode: "asia",
    latitude: -0.7893,
    longitude: 113.9213,
    activityTier: "medium",
    primaryCrops: ["Palm oil", "Rice", "Cocoa"],
    opportunityCount: 23,
    producerRank: 5,
    summary: "Smallholder traceability, tropical crops, aquaculture, and sustainability programs.",
  },
  {
    code: "VN",
    slug: "vietnam",
    name: "Vietnam",
    continentCode: "asia",
    latitude: 14.0583,
    longitude: 108.2772,
    activityTier: "medium",
    primaryCrops: ["Rice", "Coffee", "Pepper"],
    opportunityCount: 20,
    producerRank: 7,
    summary: "Rice systems, coffee exports, processing, and climate adaptation.",
  },
  {
    code: "CO",
    slug: "colombia",
    name: "Colombia",
    continentCode: "south-america",
    latitude: 4.5709,
    longitude: -74.2973,
    activityTier: "emerging",
    primaryCrops: ["Coffee", "Bananas", "Flowers"],
    opportunityCount: 15,
    summary: "Specialty coffee, tropical exports, producer organizations, and rural finance.",
  },
  {
    code: "RW",
    slug: "rwanda",
    name: "Rwanda",
    continentCode: "africa",
    latitude: -1.9403,
    longitude: 29.8739,
    activityTier: "emerging",
    primaryCrops: ["Coffee", "Tea", "Beans"],
    opportunityCount: 11,
    summary: "High-value crops, digital public services, training, and cooperative growth.",
  },
  {
    code: "JP",
    slug: "japan",
    name: "Japan",
    continentCode: "asia",
    latitude: 36.2048,
    longitude: 138.2529,
    activityTier: "low",
    primaryCrops: ["Rice", "Vegetables", "Tea"],
    opportunityCount: 9,
    summary: "Aging-farmer support, protected agriculture, robotics, and specialty products.",
  },
];

export const agrisphereStats: AgriSphereStat[] = [
  {
    id: "countries",
    label: "Connected Countries",
    value: "190+",
    detail: "Global country reach placeholder",
  },
  {
    id: "farmers",
    label: "Farmer Reach",
    value: "2M+",
    detail: "IFU network target signal",
  },
  {
    id: "partners",
    label: "Partners",
    value: "500+",
    detail: "Institutional and ecosystem pathways",
  },
  {
    id: "opportunities",
    label: "Opportunity Signals",
    value: "350+",
    detail: "Representative discovery opportunities",
  },
  {
    id: "categories",
    label: "Search Categories",
    value: "7",
    detail: "Countries, crops, organizations, treaties, sectors, producers, continents",
  },
  {
    id: "ecosystems",
    label: "Unified Ecosystems",
    value: "10",
    detail: "IFU platform destinations",
  },
];

export const agrisphereCrops = [
  "Avocado",
  "Bananas",
  "Beans",
  "Canola",
  "Cassava",
  "Cocoa",
  "Coffee",
  "Corn",
  "Cotton",
  "Dairy",
  "Maize",
  "Palm oil",
  "Pulses",
  "Rice",
  "Soybeans",
  "Sugarcane",
  "Tea",
  "Wheat",
];

export const agrisphereOrganizations = [
  {
    id: "ifu-country-representatives",
    title: "IFU Country Representative Network",
    description: "Regional leadership and country intelligence coordination.",
    href: "/discovery?persona=lead-or-represent",
    metadata: ["country representatives", "regional leadership", "AgriSphere"],
  },
  {
    id: "cooperative-digitization-partners",
    title: "Cooperative Digitization Partners",
    description: "Producer groups, cooperatives, and associations preparing shared records.",
    href: "/discovery?persona=lead-or-represent",
    metadata: ["cooperatives", "producer organizations", "digital records"],
  },
  {
    id: "agritech-implementation-network",
    title: "AgTech Implementation Network",
    description: "Technology providers supporting farm data, traceability, and field tools.",
    href: "/discovery?persona=build-or-provide-services",
    metadata: ["AgTech", "data", "traceability", "field tools"],
  },
  {
    id: "development-finance-partners",
    title: "Development Finance Partners",
    description: "Grant, donor, investment, and rural finance organizations.",
    href: "/discovery?persona=fund-invest-or-donate",
    metadata: ["finance", "donor", "investment", "grants"],
  },
];

export const agrisphereTreaties = [
  {
    id: "afcfta",
    title: "African Continental Free Trade Area",
    description: "Regional trade framework relevant to African agriculture corridors.",
    href: `${AGRISPHERE_DASHBOARD_HREF}#search`,
    metadata: ["Africa", "trade", "markets", "AfCFTA"],
  },
  {
    id: "usmca",
    title: "USMCA Agriculture Trade Framework",
    description: "North American trade context for produce, grains, and processed foods.",
    href: `${AGRISPHERE_DASHBOARD_HREF}#search`,
    metadata: ["North America", "trade", "Mexico", "United States", "Canada"],
  },
  {
    id: "eu-green-deal",
    title: "EU Green Deal Agriculture Signals",
    description: "Sustainability and compliance signals affecting European agricultural markets.",
    href: `${AGRISPHERE_DASHBOARD_HREF}#search`,
    metadata: ["Europe", "sustainability", "compliance", "traceability"],
  },
];

export const agrisphereSectors = [
  {
    id: "precision-agriculture",
    title: "Precision Agriculture",
    description: "Data, sensors, field intelligence, and decision support.",
    href: "/discovery?persona=teach-research-or-advise",
    metadata: ["data", "sensors", "field intelligence"],
  },
  {
    id: "market-access",
    title: "Market Access",
    description: "Buyer discovery, export pathways, supplier verification, and logistics.",
    href: "/discovery?persona=buy-sell-or-trade",
    metadata: ["buyers", "exports", "logistics", "AgriExchange"],
  },
  {
    id: "climate-resilience",
    title: "Climate Resilience",
    description: "Adaptation, water resilience, and risk-aware agricultural planning.",
    href: "/discovery?persona=support-sustainability",
    metadata: ["climate", "water", "risk", "resilience"],
  },
  {
    id: "farmer-finance",
    title: "Farmer Finance",
    description: "Credit, investment, grants, insurance, and working-capital readiness.",
    href: "/discovery?persona=fund-invest-or-donate",
    metadata: ["credit", "investment", "grants", "insurance"],
  },
];

export const agrisphereOpportunities: AgriSphereOpportunity[] = agrisphereCountries.map((country) => ({
  id: `opportunity:${country.code.toLowerCase()}-discovery`,
  slug: `${country.slug}-agriculture-discovery`,
  title: `${country.name} agriculture discovery signal`,
  description: `${country.summary} Priority crops include ${country.primaryCrops.join(", ")}.`,
  category: country.activityTier === "high" ? "Trade" : country.activityTier === "medium" ? "Partnership" : "Training",
  countryCode: country.code,
  region: country.continentCode,
  crops: country.primaryCrops.slice(0, 3),
  status: "active",
  href: countryHref(country),
  metadata: [
    country.name,
    country.code,
    country.continentCode,
    activityTierMeta[country.activityTier].label,
    ...country.primaryCrops,
  ],
}));

export const agrisphereTopProducers: AgriSphereProducer[] = agrisphereCountries
  .filter((country) => country.producerRank)
  .map((country) => ({
    rank: country.producerRank ?? 999,
    countryCode: country.code,
    countryName: country.name,
    commodities: country.primaryCrops.slice(0, 3),
    activityTier: country.activityTier,
    signal: country.summary,
  }))
  .sort((a, b) => a.rank - b.rank);

export const agrisphereEvents: AgriSphereEvent[] = [
  {
    id: "event:country-representative-briefing",
    slug: "country-representative-briefing",
    title: "Country Representative Intelligence Briefing",
    eventType: "Briefing",
    startsAt: "2027-02-18T15:00:00.000Z",
    endsAt: "2027-02-18T16:30:00.000Z",
    format: "virtual",
    url: `${AGRISPHERE_DASHBOARD_HREF}#search`,
    metadata: ["country representatives", "AgriSphere", "country intelligence"],
  },
  {
    id: "event:cooperative-data-readiness",
    slug: "cooperative-data-readiness",
    title: "Cooperative Data Readiness Session",
    eventType: "Webinar",
    startsAt: "2027-03-11T14:00:00.000Z",
    endsAt: "2027-03-11T15:00:00.000Z",
    format: "virtual",
    url: "/discovery?persona=lead-or-represent",
    metadata: ["cooperatives", "data readiness", "producer organizations"],
  },
  {
    id: "event:market-access-roundtable",
    slug: "market-access-roundtable",
    title: "Market Access Roundtable",
    eventType: "Forum",
    startsAt: "2027-04-08T13:00:00.000Z",
    endsAt: "2027-04-08T16:00:00.000Z",
    format: "hybrid",
    url: "/discovery?persona=buy-sell-or-trade",
    metadata: ["market access", "AgriExchange", "buyers", "exports"],
  },
];

export const agrispherePartners: AgriSpherePartner[] = agrisphereOrganizations.map((organization, index) => ({
  id: `partner:${organization.id}`,
  slug: organization.id,
  name: organization.title,
  tier: index === 0 ? "institutional" : index === 1 ? "strategic" : "community",
  url: organization.href,
  sortOrder: index + 1,
  metadata: organization.metadata,
}));

export const agrisphereShortcuts = [
  {
    id: "country-intelligence",
    title: "Country Intelligence",
    description: "Open a country profile from the map or search results.",
    href: "/country/united-states",
  },
  {
    id: "role-match",
    title: "Role Match",
    description: "Find the IFU role pathway that fits your work.",
    href: "/discovery#role-matrix",
  },
  {
    id: "dashboard",
    title: "Personal Command Center",
    description: "Return to saved opportunities in the dashboard.",
    href: "/dashboard",
  },
];

export const agrisphereEcosystems = [
  "AgriSphere",
  "AgriNexus",
  "AgriAcademie",
  "AgriExchange",
  "AgriCapital",
  "AgriFunds",
  "AgriFinance",
  "AgriShield",
  "AgriCentral",
  "Data Engine",
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function countryHref(country: AgriSphereCountry) {
  return `/country/${country.slug}`;
}

function buildSearchIndex(): AgriSphereSearchResult[] {
  const countries = agrisphereCountries.map((country) => ({
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

  const crops = agrisphereCrops.map((crop) => {
    const countryMatches = agrisphereCountries.filter((country) => country.primaryCrops.includes(crop));

    return {
      id: `crop:${crop.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      category: "crops" as const,
      title: crop,
      description:
        countryMatches.length > 0
          ? `Found in ${countryMatches.slice(0, 4).map((country) => country.name).join(", ")}.`
          : "Crop signal ready for indexing in Sprint 1.5.",
      href: `${AGRISPHERE_DASHBOARD_HREF}#search`,
      metadata: countryMatches.flatMap((country) => [country.name, country.code, country.continentCode]),
    };
  });

  const organizations = agrisphereOrganizations.map((organization) => ({
    ...organization,
    category: "organizations" as const,
  }));

  const treaties = agrisphereTreaties.map((treaty) => ({
    ...treaty,
    category: "treaties" as const,
  }));

  const sectors = agrisphereSectors.map((sector) => ({
    ...sector,
    category: "sectors" as const,
  }));

  const producers = agrisphereTopProducers.map((producer) => ({
    id: `producer:${producer.countryCode}`,
    category: "top-producers" as const,
    title: `${producer.rank}. ${producer.countryName}`,
    description: `${producer.commodities.join(", ")}. ${producer.signal}`,
    href: `/country/${agrisphereCountries.find((country) => country.code === producer.countryCode)?.slug ?? ""}`,
    metadata: [producer.countryCode, producer.countryName, ...producer.commodities],
  }));

  const continents = agrisphereContinents.map((continent) => ({
    id: `continent:${continent.code}`,
    category: "continents" as const,
    title: continent.name,
    description: continent.summary,
    href: `${AGRISPHERE_DASHBOARD_HREF}#continents`,
    metadata: [continent.code, ...continent.priorityCrops],
  }));

  return [...countries, ...crops, ...organizations, ...treaties, ...sectors, ...producers, ...continents];
}

export const agrisphereSearchIndex = buildSearchIndex();

export function getAgriSphereSnapshot() {
  return {
    source: agrisphereSource,
    activityTiers: activityTierMeta,
    stats: agrisphereStats,
    countries: agrisphereCountries,
    continents: agrisphereContinents,
    opportunities: agrisphereOpportunities,
    topProducers: agrisphereTopProducers,
    events: agrisphereEvents,
    partners: agrispherePartners,
    searchCategories,
    shortcuts: agrisphereShortcuts,
    ecosystems: agrisphereEcosystems,
  };
}

export type AgriSphereSnapshot = ReturnType<typeof getAgriSphereSnapshot>;

export function getCountryByCode(code: string) {
  const normalized = normalize(code);

  return agrisphereCountries.find(
    (country) =>
      normalize(country.code) === normalized ||
      normalize(country.slug) === normalized ||
      normalize(country.name) === normalized,
  );
}

export function getContinentByCode(code: string) {
  const normalized = normalize(code);

  return agrisphereContinents.find(
    (continent) => normalize(continent.code) === normalized || normalize(continent.name) === normalized,
  );
}

export function getCountriesForContinent(code: string) {
  const continent = getContinentByCode(code);

  if (!continent) {
    return [];
  }

  return agrisphereCountries.filter((country) => country.continentCode === continent.code);
}

export function searchAgriSphere({
  query,
  category,
  limit = 24,
}: {
  query?: string | null;
  category?: string | null;
  limit?: number;
}) {
  const normalizedQuery = normalize(query ?? "");
  const normalizedCategory = normalize(category ?? "all");
  const categoryIds = new Set(searchCategories.map((item) => item.id));
  const scopedCategory = categoryIds.has(normalizedCategory as AgriSphereSearchCategory)
    ? (normalizedCategory as AgriSphereSearchCategory)
    : "all";

  const scopedRecords =
    scopedCategory === "all"
      ? agrisphereSearchIndex
      : agrisphereSearchIndex.filter((record) => record.category === scopedCategory);

  const scored = scopedRecords
    .map((record) => {
      const haystack = normalize(
        `${record.title} ${record.description} ${record.category} ${record.metadata.join(" ")}`,
      );

      if (!normalizedQuery) {
        return { record, score: record.category === "countries" ? 2 : 1 };
      }

      const title = normalize(record.title);
      const exactTitle = title === normalizedQuery ? 10 : 0;
      const startsTitle = title.startsWith(normalizedQuery) ? 5 : 0;
      const containsTitle = title.includes(normalizedQuery) ? 3 : 0;
      const containsText = haystack.includes(normalizedQuery) ? 1 : 0;

      return { record, score: exactTitle + startsTitle + containsTitle + containsText };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.record.title.localeCompare(b.record.title))
    .slice(0, Math.max(1, Math.min(limit, 50)))
    .map((item) => item.record);

  return {
    query: normalizedQuery,
    category: scopedCategory,
    count: scored.length,
    results: scored,
  };
}

export function groupSearchResults(results: AgriSphereSearchResult[]) {
  return searchCategories.map((category) => ({
    ...category,
    results: results.filter((result) => result.category === category.id),
  }));
}
