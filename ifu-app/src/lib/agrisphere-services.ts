import { Client } from "@opensearch-project/opensearch";
import { AwsSigv4Signer } from "@opensearch-project/opensearch/aws-v3";
import { createClient, type RedisClientType } from "redis";
import {
  searchCategories,
  type AgriSphereOpportunity,
  type AgriSphereSearchCategory,
  type AgriSphereSearchResult,
} from "@/lib/agrisphere-data";

const REDIS_RETRY_DELAY_MS = 30_000;
const SERVICE_TIMEOUT_MS = 1_500;
const DEFAULT_SEARCH_INDEX = "ifu-agrisphere-discovery-v1";

type ServiceState = "available" | "configured-unavailable" | "not-configured";

type OpenSearchHitSource = AgriSphereSearchResult & {
  searchText?: string;
};

type SearchInput = {
  query?: string | null;
  category?: string | null;
  limit: number;
};

const globalForServices = globalThis as unknown as {
  agriSphereOpenSearch?: Client;
  agriSphereRedis?: RedisClientType;
  agriSphereRedisConnect?: Promise<RedisClientType | null>;
  agriSphereRedisUnavailableUntil?: number;
};

function configuredSearchIndex() {
  return process.env.OPENSEARCH_INDEX?.trim() || DEFAULT_SEARCH_INDEX;
}

function configuredSearchCategory(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase() ?? "all";
  const categories = new Set(searchCategories.map((category) => category.id));

  return categories.has(normalized as AgriSphereSearchCategory)
    ? (normalized as AgriSphereSearchCategory)
    : "all";
}

function isSearchCategory(value: unknown): value is AgriSphereSearchCategory {
  return (
    typeof value === "string" &&
    searchCategories.some((category) => category.id === value)
  );
}

function createOpenSearchClient() {
  const endpoint = process.env.OPENSEARCH_ENDPOINT?.trim();

  if (!endpoint) {
    return null;
  }

  const username = process.env.OPENSEARCH_USERNAME?.trim();
  const password = process.env.OPENSEARCH_PASSWORD ?? "";
  const region = process.env.OPENSEARCH_REGION?.trim() || process.env.AWS_REGION?.trim();
  const service = process.env.OPENSEARCH_SERVICE?.trim() === "aoss" ? "aoss" : "es";
  const authentication = username
    ? { auth: { username, password } }
    : region
      ? AwsSigv4Signer({ region, service })
      : {};

  return new Client({
    ...authentication,
    node: endpoint,
    requestTimeout: SERVICE_TIMEOUT_MS,
    maxRetries: 0,
  });
}

export function getOpenSearchClient() {
  if (!process.env.OPENSEARCH_ENDPOINT?.trim()) {
    return null;
  }

  if (!globalForServices.agriSphereOpenSearch) {
    const client = createOpenSearchClient();

    if (client) {
      globalForServices.agriSphereOpenSearch = client;
    }
  }

  return globalForServices.agriSphereOpenSearch ?? null;
}

async function connectRedis() {
  const redisUrl = process.env.REDIS_URL?.trim();

  if (!redisUrl) {
    return null;
  }

  if (globalForServices.agriSphereRedis?.isReady) {
    return globalForServices.agriSphereRedis;
  }

  if ((globalForServices.agriSphereRedisUnavailableUntil ?? 0) > Date.now()) {
    return null;
  }

  if (!globalForServices.agriSphereRedisConnect) {
    globalForServices.agriSphereRedisConnect = (async () => {
      const client = createClient({
        url: redisUrl,
        disableOfflineQueue: true,
        socket: {
          connectTimeout: SERVICE_TIMEOUT_MS,
          reconnectStrategy: false,
        },
      });

      client.on("error", () => {
        // Read endpoints retain their process-cache fallback when Redis is unavailable.
      });

      try {
        await client.connect();
        globalForServices.agriSphereRedis = client as RedisClientType;
        return globalForServices.agriSphereRedis;
      } catch {
        globalForServices.agriSphereRedisUnavailableUntil = Date.now() + REDIS_RETRY_DELAY_MS;

        if (client.isOpen) {
          client.destroy();
        }

        return null;
      } finally {
        globalForServices.agriSphereRedisConnect = undefined;
      }
    })();
  }

  return globalForServices.agriSphereRedisConnect;
}

export async function getRedisJson<T>(key: string) {
  const client = await connectRedis();

  if (!client) {
    return null;
  }

  try {
    const value = await client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export async function setRedisJson(key: string, value: unknown, ttlMs: number) {
  const client = await connectRedis();

  if (!client) {
    return false;
  }

  try {
    await client.set(key, JSON.stringify(value), {
      PX: Math.max(1_000, Math.round(ttlMs)),
    });
    return true;
  } catch {
    return false;
  }
}

export async function searchOpenSearch(input: SearchInput) {
  const client = getOpenSearchClient();

  if (!client) {
    return null;
  }

  const query = input.query?.trim() ?? "";
  const category = configuredSearchCategory(input.category);
  const must = query
    ? [
        {
          multi_match: {
            query,
            fields: ["title^5", "description^2", "metadata^2", "searchText", "category"],
            fuzziness: "AUTO",
          },
        },
      ]
    : [{ match_all: {} }];
  const filter = category === "all" ? [] : [{ term: { category } }];

  try {
    const response = await client.search({
      index: configuredSearchIndex(),
      body: {
        size: input.limit,
        query: {
          bool: {
            must,
            filter,
          },
        },
      },
    });
    const hits = response.body.hits.hits as Array<{ _source?: OpenSearchHitSource }>;
    const results = hits
      .map((hit) => hit._source)
      .filter(
        (source): source is OpenSearchHitSource =>
          Boolean(
            source &&
              typeof source.id === "string" &&
              isSearchCategory(source.category) &&
              typeof source.title === "string" &&
              typeof source.description === "string" &&
              typeof source.href === "string" &&
              Array.isArray(source.metadata),
          ),
      )
      .map((source) => ({
        id: source.id,
        category: source.category,
        title: source.title,
        description: source.description,
        href: source.href,
        metadata: source.metadata,
      }));

    return {
      query: query.toLowerCase(),
      category,
      count: results.length,
      results,
    };
  } catch {
    return null;
  }
}

function opportunitySearchText(
  result: AgriSphereSearchResult,
  opportunities: AgriSphereOpportunity[],
) {
  const resultMetadata = new Set(result.metadata.map((value) => value.toLowerCase()));
  const matches = opportunities.filter((opportunity) => {
    if (opportunity.status !== "active") {
      return false;
    }

    if (result.category === "countries") {
      return Boolean(
        opportunity.countryCode && resultMetadata.has(opportunity.countryCode.toLowerCase()),
      );
    }

    if (result.category === "crops") {
      return opportunity.crops.some((crop) => crop.toLowerCase() === result.title.toLowerCase());
    }

    return false;
  });

  return matches
    .flatMap((opportunity) => [
      opportunity.title,
      opportunity.description,
      opportunity.category,
      ...opportunity.crops,
      ...opportunity.metadata,
    ])
    .join(" ");
}

export async function replaceOpenSearchIndex(
  records: AgriSphereSearchResult[],
  opportunities: AgriSphereOpportunity[],
) {
  const client = getOpenSearchClient();

  if (!client) {
    throw new Error("OPENSEARCH_ENDPOINT is not configured");
  }

  const index = configuredSearchIndex();
  const exists = await client.indices.exists({ index });

  if (!exists.body) {
    await client.indices.create({
      index,
      body: {
        mappings: {
          properties: {
            id: { type: "keyword" },
            category: { type: "keyword" },
            title: { type: "text" },
            description: { type: "text" },
            href: { type: "keyword", index: false },
            metadata: { type: "text" },
            searchText: { type: "text" },
          },
        },
      },
    });
  }

  const body = records.flatMap((record) => [
    { index: { _index: index, _id: record.id } },
    {
      ...record,
      searchText: opportunitySearchText(record, opportunities),
    },
  ]);
  const response = await client.bulk({ refresh: true, body });

  if (response.body.errors) {
    throw new Error("OpenSearch bulk indexing completed with document errors");
  }

  return {
    index,
    indexed: records.length,
  };
}

export async function getAgriSphereServiceStatus() {
  const status: {
    openSearch: ServiceState;
    redis: ServiceState;
  } = {
    openSearch: process.env.OPENSEARCH_ENDPOINT ? "configured-unavailable" : "not-configured",
    redis: process.env.REDIS_URL ? "configured-unavailable" : "not-configured",
  };
  const [openSearch, redis] = await Promise.all([
    (async () => {
      const client = getOpenSearchClient();

      if (!client) {
        return false;
      }

      try {
        await client.ping();
        return true;
      } catch {
        return false;
      }
    })(),
    (async () => {
      const client = await connectRedis();

      if (!client) {
        return false;
      }

      try {
        return (await client.ping()) === "PONG";
      } catch {
        return false;
      }
    })(),
  ]);

  if (openSearch) {
    status.openSearch = "available";
  }

  if (redis) {
    status.redis = "available";
  }

  return status;
}
