export type CountryConfidence = "Seed" | "Pilot" | "Fallback";

export type CountryIntelligenceRecord = {
  slug: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  keyCrops: string[];
  majorExports: string[];
  marketOutlook: string;
  opportunities: string[];
  riskSignals: string[];
  ifuPathways: string[];
  confidence: CountryConfidence;
  lastUpdated: string;
  sourceNotes: string[];
};

export const countryIntelligenceSource = {
  label: "IFU country intelligence seed register",
  lastUpdated: "2026-07-15",
  refreshCadence: "Owner-reviewed before public launch; production refresh cadence pending.",
  license:
    "Internal IFU development seed derived from the public static map export. External data-source licenses must be confirmed before final publication.",
  geometryAttribution:
    "Public map tiles use OpenStreetMap. Static map seed values are retained as IFU development placeholders until the formal data register is approved.",
};

const seededCountries = [
  {
    slug: "united-states",
    name: "United States",
    region: "North America",
    latitude: 37.0902,
    longitude: -95.7129,
    keyCrops: ["Corn", "Soybeans", "Wheat"],
    majorExports: ["Corn", "Soybeans", "Beef"],
    marketOutlook: "Strong export growth",
    opportunities: ["AgTech", "Carbon markets", "Precision agriculture"],
    riskSignals: ["Weather volatility", "Input-cost pressure", "Logistics constraints"],
    ifuPathways: ["AgriSphere", "AgriExchange", "AgriFinance", "Data Engine"],
    confidence: "Pilot" as const,
  },
  {
    slug: "cameroon",
    name: "Cameroon",
    region: "Central Africa",
    latitude: 7.3697,
    longitude: 12.3547,
    keyCrops: ["Cocoa", "Coffee", "Bananas"],
    majorExports: ["Cocoa", "Coffee"],
    marketOutlook: "Strong export potential",
    opportunities: ["Agro-processing", "Traceability", "Cooperative digitization"],
    riskSignals: ["Infrastructure gaps", "Post-harvest loss", "Market-access fragmentation"],
    ifuPathways: ["AgriExchange", "AgriShield", "AgriAcademie", "AgriFunds"],
    confidence: "Pilot" as const,
  },
  {
    slug: "brazil",
    name: "Brazil",
    region: "South America",
    latitude: -14.235,
    longitude: -51.9253,
    keyCrops: ["Soybeans", "Coffee", "Sugarcane"],
    majorExports: ["Soybeans", "Beef", "Coffee"],
    marketOutlook: "Global agriculture leader",
    opportunities: ["Processing and logistics", "Sustainable agriculture", "Export expansion"],
    riskSignals: ["Climate exposure", "Deforestation scrutiny", "Port and inland freight pressure"],
    ifuPathways: ["AgriSphere", "AgriExchange", "AgriShield", "Data Engine"],
    confidence: "Pilot" as const,
  },
  {
    slug: "india",
    name: "India",
    region: "South Asia",
    latitude: 20.5937,
    longitude: 78.9629,
    keyCrops: ["Rice", "Wheat", "Cotton"],
    majorExports: ["Rice", "Spices"],
    marketOutlook: "Rapid agricultural expansion",
    opportunities: ["Digital agriculture", "Farmer finance", "Training at scale"],
    riskSignals: ["Water stress", "Smallholder fragmentation", "Climate variability"],
    ifuPathways: ["AgriAcademie", "AgriFinance", "AgriCentral", "AgriSphere"],
    confidence: "Pilot" as const,
  },
  {
    slug: "kenya",
    name: "Kenya",
    region: "East Africa",
    latitude: -0.0236,
    longitude: 37.9062,
    keyCrops: ["Tea", "Coffee", "Maize"],
    majorExports: ["Tea", "Coffee"],
    marketOutlook: "Regional agricultural hub",
    opportunities: ["AgTech innovation", "Export quality systems", "Climate-smart training"],
    riskSignals: ["Drought exposure", "Input affordability", "Cold-chain gaps"],
    ifuPathways: ["AgriNexus", "AgriAcademie", "AgriExchange", "AgriFunds"],
    confidence: "Pilot" as const,
  },
  {
    slug: "mexico",
    name: "Mexico",
    region: "North America",
    latitude: 23.6345,
    longitude: -102.5528,
    keyCrops: ["Maize", "Avocado", "Beans"],
    majorExports: ["Avocados", "Tomatoes"],
    marketOutlook: "Growing export market",
    opportunities: ["Export expansion", "Food processing", "Supplier verification"],
    riskSignals: ["Water stress", "Cross-border logistics", "Smallholder financing needs"],
    ifuPathways: ["AgriExchange", "AgriShield", "AgriFinance", "Data Engine"],
    confidence: "Pilot" as const,
  },
] satisfies Array<Omit<CountryIntelligenceRecord, "lastUpdated" | "sourceNotes">>;

export const countryIntelligenceRecords: CountryIntelligenceRecord[] = seededCountries.map(
  (country) => ({
    ...country,
    lastUpdated: countryIntelligenceSource.lastUpdated,
    sourceNotes: [
      "Seed values copied from the IFU public static map export and normalized for the Country Agricultural Intelligence Center.",
      "Country records are marked as development data until owner-approved source citations, timestamps, and licensing are attached.",
    ],
  }),
);

export function slugifyCountryName(country: string) {
  return country
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function countryNameFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getCountryIntelligencePath(country: string) {
  return `/country/${slugifyCountryName(country)}`;
}

export function getCountryIntelligenceBySlug(slug: string): CountryIntelligenceRecord {
  const normalizedSlug = slugifyCountryName(slug);
  const seeded = countryIntelligenceRecords.find((country) => country.slug === normalizedSlug);

  if (seeded) {
    return seeded;
  }

  const name = countryNameFromSlug(normalizedSlug || slug);

  return {
    slug: normalizedSlug || "unknown",
    name,
    region: "Global IFU Network",
    latitude: 0,
    longitude: 0,
    keyCrops: ["Data coming soon"],
    majorExports: ["Data coming soon"],
    marketOutlook: "Country intelligence profile pending owner-approved data.",
    opportunities: ["Investment", "Training", "Trade"],
    riskSignals: ["Source validation pending", "Country data register pending"],
    ifuPathways: ["AgriSphere", "Data Engine", "AgriNexus"],
    confidence: "Fallback",
    lastUpdated: countryIntelligenceSource.lastUpdated,
    sourceNotes: [
      "Fallback country page generated from the URL slug so every public map click stays on an IFU-owned route.",
      "Replace this fallback with approved country data before marking the route complete for release acceptance.",
    ],
  };
}

export function getFeaturedCountryIntelligence() {
  return countryIntelligenceRecords;
}
