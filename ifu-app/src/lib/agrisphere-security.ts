import crypto from "node:crypto";
import type { NextRequest } from "next/server";
import { AgriSphereSecuritySeverity } from "@/generated/prisma/enums";
import type { AuthSession } from "@/lib/auth/session";
import { haversineDistanceKm } from "@/lib/agrisphere-algorithms";
import { searchCategories, type AgriSphereSearchCategory } from "@/lib/agrisphere-data";
import { getRedisJson, incrementRedisWindow, setRedisJson } from "@/lib/agrisphere-services";
import { getPrisma } from "@/lib/prisma";

export type AgriSphereSurface = "map" | "search";

type ProcessWindow = {
  count: number;
  resetAt: number;
};

type PreviousLocation = {
  latitude: number;
  longitude: number;
  observedAt: string;
};

export type AgriSphereRateLimit = {
  allowed: boolean;
  count: number;
  limit: number;
  remaining: number;
  resetAt: number;
  alertAt: number;
  distributed: boolean;
};

export type AgriSphereObservation = {
  surface: AgriSphereSurface;
  actorHash: string;
  requestFingerprint: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  queryLength?: number;
  category?: string;
  rateLimit: AgriSphereRateLimit;
  observedAt: string;
};

const RATE_WINDOW_MS = 60_000;
const SECURITY_EVENT_TTL_DAYS = 90;
const processWindows = new Map<string, ProcessWindow>();
const processLocations = new Map<string, PreviousLocation>();
const runtimeHashSecret = crypto.randomBytes(32).toString("hex");

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function surfacePolicy(surface: AgriSphereSurface) {
  if (surface === "search") {
    const limit = positiveInteger(process.env.AGRISPHERE_SEARCH_RATE_LIMIT, 120);
    return {
      limit,
      alertAt: Math.min(limit, positiveInteger(process.env.AGRISPHERE_SEARCH_ALERT_RATE, 60)),
    };
  }

  const limit = positiveInteger(process.env.AGRISPHERE_MAP_RATE_LIMIT, 240);
  return {
    limit,
    alertAt: Math.min(limit, positiveInteger(process.env.AGRISPHERE_MAP_ALERT_RATE, 120)),
  };
}

function auditHash(value: string) {
  const secret =
    process.env.AGRISPHERE_AUDIT_HASH_SECRET?.trim() ||
    process.env.AUTH_SESSION_SECRET?.trim() ||
    runtimeHashSecret;
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

function firstForwardedValue(value: string | null) {
  return value?.split(",")[0]?.trim() ?? "unknown";
}

function finiteHeader(request: NextRequest, name: string) {
  const value = Number(request.headers.get(name));
  return Number.isFinite(value) ? value : undefined;
}

function consumeProcessWindow(key: string, now: number) {
  const current = processWindows.get(key);

  if (!current || current.resetAt <= now) {
    const created = { count: 1, resetAt: now + RATE_WINDOW_MS };
    processWindows.set(key, created);
    return created;
  }

  current.count += 1;
  return current;
}

export async function evaluateAgriSphereRequest(
  request: NextRequest,
  session: AuthSession,
  surface: AgriSphereSurface,
  detail: { queryLength?: number; category?: string } = {},
) {
  const now = Date.now();
  const actorHash = auditHash(`subject:${session.sub}`);
  const clientAddress = firstForwardedValue(
    request.headers.get("cloudfront-viewer-address") ?? request.headers.get("x-forwarded-for"),
  );
  const requestFingerprint = auditHash(
    `request:${clientAddress}:${request.headers.get("user-agent") ?? "unknown"}`,
  );
  const key = `ifu:agrisphere:sprint-2.5:rate:${surface}:${actorHash}:${Math.floor(now / RATE_WINDOW_MS)}`;
  const policy = surfacePolicy(surface);
  const distributed = await incrementRedisWindow(key, RATE_WINDOW_MS);
  const processWindow = distributed ? null : consumeProcessWindow(key, now);
  const count = distributed?.count ?? processWindow?.count ?? 1;
  const resetAt = distributed
    ? now + distributed.resetInMs
    : processWindow?.resetAt ?? now + RATE_WINDOW_MS;
  const rateLimit: AgriSphereRateLimit = {
    allowed: count <= policy.limit,
    count,
    limit: policy.limit,
    remaining: Math.max(0, policy.limit - count),
    resetAt,
    alertAt: policy.alertAt,
    distributed: Boolean(distributed),
  };

  return {
    surface,
    actorHash,
    requestFingerprint,
    countryCode: request.headers.get("cloudfront-viewer-country") ?? undefined,
    latitude: finiteHeader(request, "cloudfront-viewer-latitude"),
    longitude: finiteHeader(request, "cloudfront-viewer-longitude"),
    queryLength: detail.queryLength,
    category: detail.category,
    rateLimit,
    observedAt: new Date(now).toISOString(),
  } satisfies AgriSphereObservation;
}

export function agriSphereRateLimitHeaders(rateLimit: AgriSphereRateLimit) {
  return {
    "RateLimit-Limit": String(rateLimit.limit),
    "RateLimit-Remaining": String(rateLimit.remaining),
    "RateLimit-Reset": String(Math.max(0, Math.ceil((rateLimit.resetAt - Date.now()) / 1_000))),
  };
}

async function writeSecurityEvent(input: {
  observation: AgriSphereObservation;
  eventType: string;
  confidence: number;
  severity: AgriSphereSecuritySeverity;
  triggers: string[];
  requestPattern: Record<string, string | number | boolean | undefined>;
  featureVector?: number[];
}) {
  const occurredAt = new Date(input.observation.observedAt);
  const expiresAt = new Date(
    occurredAt.getTime() + SECURITY_EVENT_TTL_DAYS * 24 * 60 * 60 * 1_000,
  );

  try {
    await getPrisma().agriSphereSecurityEvent.create({
      data: {
        correlationId: crypto.randomUUID(),
        actorHash: input.observation.actorHash,
        requestFingerprint: input.observation.requestFingerprint,
        eventType: input.eventType,
        surface: input.observation.surface,
        countryCode: input.observation.countryCode,
        requestPattern: input.requestPattern,
        featureVector: input.featureVector,
        confidence: Math.max(0, Math.min(input.confidence, 1)),
        severity: input.severity,
        triggers: input.triggers,
        occurredAt,
        expiresAt,
      },
    });
  } catch {
    console.error("AgriSphere security event could not be persisted");
  }
}

export async function processAgriSphereObservation(observation: AgriSphereObservation) {
  const shouldRecordVelocity =
    observation.rateLimit.count === observation.rateLimit.alertAt ||
    observation.rateLimit.count === observation.rateLimit.limit + 1;

  if (shouldRecordVelocity) {
    await writeSecurityEvent({
      observation,
      eventType: observation.rateLimit.allowed
        ? "SUSPICIOUS_REQUEST_VELOCITY"
        : "RATE_LIMIT_EXCEEDED",
      confidence: observation.rateLimit.allowed ? 0.72 : 0.92,
      severity: observation.rateLimit.allowed
        ? AgriSphereSecuritySeverity.MEDIUM
        : AgriSphereSecuritySeverity.HIGH,
      triggers: [
        observation.rateLimit.allowed ? "velocity_alert_threshold" : "rate_limit_threshold",
      ],
      requestPattern: {
        count: observation.rateLimit.count,
        limit: observation.rateLimit.limit,
        alertAt: observation.rateLimit.alertAt,
        windowMs: RATE_WINDOW_MS,
        distributedCounter: observation.rateLimit.distributed,
        queryLength: observation.queryLength,
        category: observation.category,
      },
      featureVector: [
        0,
        0,
        observation.rateLimit.count,
        RATE_WINDOW_MS / 60_000,
      ],
    });
  }

  if (observation.latitude === undefined || observation.longitude === undefined) {
    return;
  }

  const locationKey = `ifu:agrisphere:sprint-2.5:location:${observation.actorHash}`;
  const current: PreviousLocation = {
    latitude: observation.latitude,
    longitude: observation.longitude,
    observedAt: observation.observedAt,
  };
  const previous =
    (await getRedisJson<PreviousLocation>(locationKey)) ??
    processLocations.get(locationKey) ??
    null;

  processLocations.set(locationKey, current);
  await setRedisJson(locationKey, current, 8 * 60 * 60 * 1_000);

  if (!previous) {
    return;
  }

  const elapsedHours =
    (new Date(current.observedAt).getTime() - new Date(previous.observedAt).getTime()) /
    (60 * 60 * 1_000);
  const distanceKm = haversineDistanceKm(
    previous.latitude,
    previous.longitude,
    current.latitude,
    current.longitude,
  );

  if (elapsedHours > 0 && elapsedHours < 1 && distanceKm > 500) {
    await writeSecurityEvent({
      observation,
      eventType: "IMPOSSIBLE_TRAVEL",
      confidence: 0.96,
      severity: AgriSphereSecuritySeverity.HIGH,
      triggers: ["distance_over_500km", "elapsed_under_1h"],
      requestPattern: {
        distanceBand: distanceKm > 2_000 ? "over_2000km" : "500_to_2000km",
        elapsedMinutes: Math.round(elapsedHours * 60),
      },
      featureVector: [
        distanceKm / elapsedHours,
        0,
        observation.rateLimit.count,
        elapsedHours * 60,
      ],
    });
  }
}

export type ParsedAgriSphereSearch = {
  query: string;
  category: AgriSphereSearchCategory | "all";
  limit: number;
};

export function parseAgriSphereSearchParams(searchParams: URLSearchParams):
  | { ok: true; value: ParsedAgriSphereSearch }
  | { ok: false; error: string } {
  const query = (searchParams.get("q") ?? "").trim();
  const category = (searchParams.get("category") ?? "all").trim().toLocaleLowerCase("en");
  const limitValue = searchParams.get("limit") ?? "24";
  const limit = Number(limitValue);
  const categories = new Set(searchCategories.map((item) => item.id));

  if (query.length > 120 || /[\u0000-\u001f\u007f]/.test(query)) {
    return { ok: false, error: "Search query must be 120 characters or fewer." };
  }

  if (category !== "all" && !categories.has(category as AgriSphereSearchCategory)) {
    return { ok: false, error: "Search category is invalid." };
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    return { ok: false, error: "Search limit must be an integer from 1 to 50." };
  }

  return {
    ok: true,
    value: {
      query,
      category: category as AgriSphereSearchCategory | "all",
      limit,
    },
  };
}
