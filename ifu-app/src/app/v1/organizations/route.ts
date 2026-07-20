import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import { getAgriSphereOrganizationsData } from "@/lib/agrisphere-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const organizations = await getAgriSphereOrganizationsData();

  return NextResponse.json({
    ok: true,
    ...organizations,
  });
}
