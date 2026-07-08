import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import { syncAuthenticatedUser } from "@/lib/dashboardData";
import { getGeoFromRequest, parseBrowserGeoPayload } from "@/lib/geolocation";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = parseBrowserGeoPayload(await request.json().catch(() => ({})));
  const requestGeo = getGeoFromRequest(request);
  const user = await syncAuthenticatedUser(session);
  const prisma = getPrisma();
  const latitude = body.latitude ?? requestGeo.latitude;
  const longitude = body.longitude ?? requestGeo.longitude;
  const timezone = body.timezone ?? requestGeo.timezone;

  const geoEvent = await prisma.geoEvent.create({
    data: {
      userId: user.id,
      city: requestGeo.city,
      region: requestGeo.region,
      country: requestGeo.country,
      timezone,
      latitude,
      longitude,
      source: body.source ?? "browser",
      consentStatus: body.consentStatus ?? "granted",
      ipAddress: requestGeo.ipAddress,
      userAgent: requestGeo.userAgent,
      metadata: {
        accuracy: body.accuracy ?? null,
      },
    },
  });

  await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: {
      city: requestGeo.city,
      region: requestGeo.region,
      country: requestGeo.country,
      timezone,
      latitude,
      longitude,
      profileCompletion: 70,
    },
    create: {
      userId: user.id,
      city: requestGeo.city ?? "Profile Pending",
      region: requestGeo.region ?? "Global IFU Network",
      country: requestGeo.country ?? "Profile Pending",
      timezone: timezone ?? "America/New_York",
      latitude,
      longitude,
      profileCompletion: 70,
    },
  });

  return NextResponse.json({
    ok: true,
    geoEventId: geoEvent.id,
    profile: {
      city: requestGeo.city,
      region: requestGeo.region,
      country: requestGeo.country,
      timezone,
      latitude,
      longitude,
    },
  });
}
