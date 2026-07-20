import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import { getAgriSphereDashboardFeed } from "@/lib/agrisphere-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const feed = await getAgriSphereDashboardFeed(session);

    return NextResponse.json({
      ok: true,
      ...feed,
    });
  } catch (error) {
    console.error("AgriSphere dashboard feed unavailable", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Dashboard feed unavailable",
      },
      { status: 503 },
    );
  }
}
