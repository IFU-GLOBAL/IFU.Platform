import { NextResponse } from "next/server";
import { agrisphereCountries, agrisphereSource } from "@/lib/agrisphere-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "agrisphere-discovery",
    version: agrisphereSource.version,
    checkedAt: new Date().toISOString(),
    checks: {
      apiPrefix: "/v1",
      corpusLoaded: agrisphereCountries.length > 0,
      countryCount: agrisphereCountries.length,
    },
    source: agrisphereSource,
  });
}
