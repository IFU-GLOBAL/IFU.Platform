import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import { searchAgriSphereData } from "@/lib/agrisphere-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const limit = Number(searchParams.get("limit") ?? 24);
  const search = await searchAgriSphereData({
    query: searchParams.get("q"),
    category: searchParams.get("category"),
    limit: Number.isFinite(limit) ? limit : 24,
  });

  return NextResponse.json({
    ok: true,
    ...search,
  });
}
