import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import { getAgriSphereTreatiesData } from "@/lib/agrisphere-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const treaties = await getAgriSphereTreatiesData();

  return NextResponse.json({
    ok: true,
    ...treaties,
  });
}
