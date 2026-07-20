import { NextResponse } from "next/server";
import { agrisphereSource } from "@/lib/agrisphere-data";
import { getAgriSphereHealthData } from "@/lib/agrisphere-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const health = await getAgriSphereHealthData();

  return NextResponse.json({
    ok: true,
    service: "agrisphere-discovery",
    version: agrisphereSource.version,
    checkedAt: new Date().toISOString(),
    ...health,
  });
}
