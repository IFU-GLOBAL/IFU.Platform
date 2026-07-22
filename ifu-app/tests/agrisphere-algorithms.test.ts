import assert from "node:assert/strict";
import test from "node:test";
import {
  cosineSimilarity,
  haversineDistanceKm,
  IsolationForest,
  KMeans,
  TfIdfVectorizer,
  tokenizeAgriSphereText,
} from "../src/lib/agrisphere-algorithms";
import { rankAgriSphereOpportunities } from "../src/lib/agrisphere-personalization";
import type { AgriSphereOpportunity } from "../src/lib/agrisphere-data";
import { parseAgriSphereSearchParams } from "../src/lib/agrisphere-security";

test("TF-IDF and cosine rank topical overlap above unrelated text", () => {
  const vectorizer = new TfIdfVectorizer();
  vectorizer.fit([
    { id: "maize", tokens: tokenizeAgriSphereText("Kenya maize farmer funding") },
    { id: "coffee", tokens: tokenizeAgriSphereText("Brazil coffee trade buyer") },
  ]);

  const query = vectorizer.transform(tokenizeAgriSphereText("Kenya maize funding"));
  const relevant = vectorizer.transform(tokenizeAgriSphereText("Kenya maize farmer funding"));
  const unrelated = vectorizer.transform(tokenizeAgriSphereText("Brazil coffee trade buyer"));

  assert.ok(cosineSimilarity(query, relevant) > cosineSimilarity(query, unrelated));
  assert.deepEqual(vectorizer.exportModel().terms, [...vectorizer.exportModel().terms].sort());
});

test("K-Means is deterministic and separates two obvious groups", () => {
  const vectors = [
    [0, 0],
    [0.1, 0.2],
    [0.2, 0.1],
    [9.8, 10],
    [10, 9.8],
    [10, 10],
  ];
  const first = new KMeans(2, 100, 1e-6, "repeatable").fit(vectors);
  const second = new KMeans(2, 100, 1e-6, "repeatable").fit(vectors);

  assert.deepEqual(first, second);
  assert.equal(new Set(first.assignments.slice(0, 3)).size, 1);
  assert.equal(new Set(first.assignments.slice(3)).size, 1);
  assert.notEqual(first.assignments[0], first.assignments[5]);
});

test("Isolation Forest scores a distant observation above the normal cluster", () => {
  const normal = Array.from({ length: 80 }, (_, index) => [
    18 + (index % 7),
    3 + (index % 4),
    2 + (index % 5),
    12 + (index % 9),
  ]);
  const forest = new IsolationForest(80, 64, "repeatable");
  forest.fit(normal);

  const normalScore = forest.anomalyScore([21, 4, 3, 15]);
  const anomalyScore = forest.anomalyScore([900, 190, 120, 1]);

  assert.ok(anomalyScore > normalScore);
});

test("Haversine distance returns the approximate New York to London distance", () => {
  const distance = haversineDistanceKm(40.7128, -74.006, 51.5074, -0.1278);
  assert.ok(distance > 5_500 && distance < 5_650);
});

test("recommendation ranking uses profile and saved-history terms", () => {
  const opportunities: AgriSphereOpportunity[] = [
    {
      id: "kenya-maize",
      slug: "kenya-maize",
      title: "Kenya maize finance",
      description: "Working capital for maize farmers",
      category: "Funding",
      countryCode: "KE",
      region: "Africa",
      crops: ["Maize"],
      status: "active",
      href: "/kenya",
      metadata: ["Kenya", "farmer"],
    },
    {
      id: "brazil-coffee",
      slug: "brazil-coffee",
      title: "Brazil coffee buyer mission",
      description: "Coffee export and trade meetings",
      category: "Trade",
      countryCode: "BR",
      region: "South America",
      crops: ["Coffee"],
      status: "active",
      href: "/brazil",
      metadata: ["Brazil", "buyer"],
    },
  ];

  const ranked = rankAgriSphereOpportunities(opportunities, {
    role: "Farmer",
    category: "Funding",
    country: "Kenya",
    region: "Africa",
    crops: ["Maize"],
    interests: ["working capital"],
    savedOpportunities: [],
  });

  assert.equal(ranked[0]?.opportunity.id, "kenya-maize");
  assert.ok(ranked[0]?.matchReasons.includes("Country match"));
});

test("search request validation accepts the contract and rejects unsafe bounds", () => {
  const valid = parseAgriSphereSearchParams(
    new URLSearchParams({ q: "maize funding", category: "crops", limit: "20" }),
  );
  const invalidLimit = parseAgriSphereSearchParams(
    new URLSearchParams({ q: "maize", limit: "500" }),
  );
  const invalidCategory = parseAgriSphereSearchParams(
    new URLSearchParams({ q: "maize", category: "raw-index-name" }),
  );

  assert.deepEqual(valid, {
    ok: true,
    value: { query: "maize funding", category: "crops", limit: 20 },
  });
  assert.equal(invalidLimit.ok, false);
  assert.equal(invalidCategory.ok, false);
});
