import { NextResponse } from "next/server";
import {
  activityTierMeta,
  agrisphereCountries,
  agrisphereContinents,
  agrisphereSource,
} from "@/lib/agrisphere-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    source: agrisphereSource,
    tiers: activityTierMeta,
    continents: agrisphereContinents,
    countries: agrisphereCountries,
  });
}
