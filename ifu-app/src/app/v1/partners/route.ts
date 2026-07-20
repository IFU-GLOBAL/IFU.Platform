import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import { getAgriSpherePartnersData } from "@/lib/agrisphere-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const partners = await getAgriSpherePartnersData();

  return NextResponse.json({
    ok: true,
    ...partners,
  });
}
