import { after, NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import { getAgriSphereMapData } from "@/lib/agrisphere-repository";
import {
  agriSphereRateLimitHeaders,
  evaluateAgriSphereRequest,
  processAgriSphereObservation,
} from "@/lib/agrisphere-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const observation = await evaluateAgriSphereRequest(request, session, "map");
  const rateHeaders = agriSphereRateLimitHeaders(observation.rateLimit);

  after(() => processAgriSphereObservation(observation));

  if (!observation.rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many map requests. Try again shortly." },
      { status: 429, headers: rateHeaders },
    );
  }

  const map = await getAgriSphereMapData();

  return NextResponse.json(
    {
      ok: true,
      ...map,
    },
    { headers: rateHeaders },
  );
}
