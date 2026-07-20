import { NextResponse } from "next/server";
import { agrisphereSource, agrisphereTopProducers } from "@/lib/agrisphere-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    source: agrisphereSource,
    count: agrisphereTopProducers.length,
    producers: agrisphereTopProducers,
  });
}
