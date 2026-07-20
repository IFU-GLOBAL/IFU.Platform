import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import { agrisphereContinents, agrisphereSource } from "@/lib/agrisphere-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    source: agrisphereSource,
    count: agrisphereContinents.length,
    continents: agrisphereContinents,
  });
}
