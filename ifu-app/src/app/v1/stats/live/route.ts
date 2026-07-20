import { NextResponse } from "next/server";
import { agrisphereSource, agrisphereStats } from "@/lib/agrisphere-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    source: agrisphereSource,
    stats: agrisphereStats,
  });
}
