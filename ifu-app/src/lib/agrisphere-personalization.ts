import type { AgriSphereOpportunity } from "@/lib/agrisphere-data";
import {
  cosineSimilarity,
  TfIdfVectorizer,
  tokenizeAgriSphereText,
  type TfIdfModel,
} from "@/lib/agrisphere-algorithms";

export type AgriSpherePersonalizationProfile = {
  role?: string | null;
  category?: string | null;
  country?: string | null;
  region?: string | null;
  crops: string[];
  interests: string[];
  savedOpportunities: AgriSphereOpportunity[];
};

export type AgriSphereRecommendation = {
  opportunity: AgriSphereOpportunity;
  matchScore: number;
  matchReasons: string[];
};

const profilePlaceholders = new Set(["profile pending", "global ifu network"]);

function meaningful(value: string | null | undefined) {
  const normalized = value?.trim().toLocaleLowerCase("en") ?? "";
  return normalized && !profilePlaceholders.has(normalized) ? value!.trim() : "";
}

export function agriSphereOpportunityText(opportunity: AgriSphereOpportunity) {
  return [
    opportunity.title,
    opportunity.description,
    opportunity.category,
    opportunity.countryCode,
    opportunity.region,
    ...opportunity.crops,
    ...opportunity.metadata,
  ]
    .filter(Boolean)
    .join(" ");
}

export function fitAgriSphereOpportunityVectorizer(opportunities: AgriSphereOpportunity[]) {
  const vectorizer = new TfIdfVectorizer();
  vectorizer.fit(
    opportunities.map((opportunity) => ({
      id: opportunity.id,
      tokens: tokenizeAgriSphereText(agriSphereOpportunityText(opportunity)),
    })),
  );
  return vectorizer;
}

export function buildAgriSphereProfileTokens(profile: AgriSpherePersonalizationProfile) {
  const weightedFields = [
    [meaningful(profile.role), 2],
    [meaningful(profile.category), 3],
    [meaningful(profile.country), 3],
    [meaningful(profile.region), 2],
    ...profile.crops.map((crop) => [meaningful(crop), 3] as const),
    ...profile.interests.map((interest) => [meaningful(interest), 2] as const),
    ...profile.savedOpportunities.map(
      (opportunity) => [agriSphereOpportunityText(opportunity), 3] as const,
    ),
  ] as Array<readonly [string, number]>;

  return weightedFields.flatMap(([value, weight]) =>
    value ? Array.from({ length: weight }, () => tokenizeAgriSphereText(value)).flat() : [],
  );
}

export function vectorizeAgriSphereProfile(
  profile: AgriSpherePersonalizationProfile,
  model: TfIdfModel,
) {
  const vectorizer = new TfIdfVectorizer();
  vectorizer.importModel(model);
  return vectorizer.transform(buildAgriSphereProfileTokens(profile));
}

function matchReasons(
  profile: AgriSpherePersonalizationProfile,
  opportunity: AgriSphereOpportunity,
) {
  const reasons: string[] = [];
  const normalize = (value: string | null | undefined) =>
    meaningful(value).toLocaleLowerCase("en");
  const opportunityTokens = new Set(tokenizeAgriSphereText(agriSphereOpportunityText(opportunity)));
  const matchingCrops = profile.crops.filter((crop) =>
    opportunity.crops.some((candidate) => normalize(candidate) === normalize(crop)),
  );

  if (
    normalize(profile.country) &&
    [opportunity.countryCode, ...opportunity.metadata].some(
      (value) => normalize(value) === normalize(profile.country),
    )
  ) {
    reasons.push("Country match");
  }

  if (normalize(profile.region) && normalize(opportunity.region) === normalize(profile.region)) {
    reasons.push("Region match");
  }

  if (matchingCrops.length > 0) {
    reasons.push(`${matchingCrops.slice(0, 2).join(" and ")} interest`);
  }

  if (
    normalize(profile.category) &&
    tokenizeAgriSphereText(profile.category ?? "").some((token) => opportunityTokens.has(token))
  ) {
    reasons.push("Role category match");
  }

  if (profile.savedOpportunities.length > 0) {
    reasons.push("Saved-history signal");
  }

  return reasons.slice(0, 3);
}

export function rankAgriSphereOpportunitiesAgainstVector(
  opportunities: AgriSphereOpportunity[],
  vector: number[],
  model: TfIdfModel,
  limit = 50,
) {
  const vectorizer = new TfIdfVectorizer();
  vectorizer.importModel(model);

  return opportunities
    .filter((opportunity) => opportunity.status === "active")
    .map((opportunity) => ({
      opportunity,
      matchScore: cosineSimilarity(
        vector,
        vectorizer.transform(tokenizeAgriSphereText(agriSphereOpportunityText(opportunity))),
      ),
    }))
    .sort(
      (a, b) =>
        b.matchScore - a.matchScore ||
        a.opportunity.title.localeCompare(b.opportunity.title),
    )
    .slice(0, Math.max(1, Math.min(Math.round(limit), 50)));
}

export function rankAgriSphereOpportunities(
  opportunities: AgriSphereOpportunity[],
  profile: AgriSpherePersonalizationProfile,
  limit = 20,
) {
  const activeOpportunities = opportunities.filter(
    (opportunity) => opportunity.status === "active",
  );
  const vectorizer = fitAgriSphereOpportunityVectorizer(activeOpportunities);
  const profileVector = vectorizer.transform(buildAgriSphereProfileTokens(profile));

  return activeOpportunities
    .map<AgriSphereRecommendation>((opportunity) => ({
      opportunity,
      matchScore: cosineSimilarity(
        profileVector,
        vectorizer.transform(tokenizeAgriSphereText(agriSphereOpportunityText(opportunity))),
      ),
      matchReasons: matchReasons(profile, opportunity),
    }))
    .sort(
      (a, b) =>
        b.matchScore - a.matchScore ||
        a.opportunity.title.localeCompare(b.opportunity.title),
    )
    .slice(0, Math.max(1, Math.min(Math.round(limit), 50)));
}
