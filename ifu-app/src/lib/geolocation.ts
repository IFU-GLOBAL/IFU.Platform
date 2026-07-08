import type { NextRequest } from "next/server";

export type BrowserGeoPayload = {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  timezone?: string;
  consentStatus?: string;
  source?: string;
};

export function getGeoFromRequest(request: NextRequest) {
  const headers = request.headers;
  const country =
    headers.get("cloudfront-viewer-country-name") ??
    headers.get("cloudfront-viewer-country") ??
    undefined;
  const region =
    headers.get("cloudfront-viewer-country-region-name") ??
    headers.get("cloudfront-viewer-country-region") ??
    undefined;
  const city = headers.get("cloudfront-viewer-city") ?? undefined;
  const timezone = headers.get("cloudfront-viewer-time-zone") ?? undefined;
  const latitude = Number(headers.get("cloudfront-viewer-latitude"));
  const longitude = Number(headers.get("cloudfront-viewer-longitude"));

  return {
    city,
    region,
    country,
    timezone,
    latitude: Number.isFinite(latitude) ? latitude : undefined,
    longitude: Number.isFinite(longitude) ? longitude : undefined,
    ipAddress: headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
    userAgent: headers.get("user-agent") ?? undefined,
  };
}

export function parseBrowserGeoPayload(value: unknown): BrowserGeoPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const body = value as Record<string, unknown>;

  return {
    latitude: typeof body.latitude === "number" ? body.latitude : undefined,
    longitude: typeof body.longitude === "number" ? body.longitude : undefined,
    accuracy: typeof body.accuracy === "number" ? body.accuracy : undefined,
    timezone: typeof body.timezone === "string" ? body.timezone : undefined,
    consentStatus: typeof body.consentStatus === "string" ? body.consentStatus : undefined,
    source: typeof body.source === "string" ? body.source : undefined,
  };
}
