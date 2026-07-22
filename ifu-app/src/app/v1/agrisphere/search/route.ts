import { after, NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import { searchAgriSphereData } from "@/lib/agrisphere-repository";
import {
  agriSphereRateLimitHeaders,
  evaluateAgriSphereRequest,
  parseAgriSphereSearchParams,
  processAgriSphereObservation,
} from "@/lib/agrisphere-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const parsed = parseAgriSphereSearchParams(searchParams);
  const observation = await evaluateAgriSphereRequest(request, session, "search", {
    queryLength: (searchParams.get("q") ?? "").length,
    category: searchParams.get("category") ?? "all",
  });
  const rateHeaders = agriSphereRateLimitHeaders(observation.rateLimit);

  after(() => processAgriSphereObservation(observation));

  if (!observation.rateLimit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many search requests. Try again shortly." },
      { status: 429, headers: rateHeaders },
    );
  }

  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, error: parsed.error },
      { status: 400, headers: rateHeaders },
    );
  }

  const search = await searchAgriSphereData({
    query: parsed.value.query,
    category: parsed.value.category,
    limit: parsed.value.limit,
  });

  return NextResponse.json(
    {
      ok: true,
      ...search,
    },
    { headers: rateHeaders },
  );
}
