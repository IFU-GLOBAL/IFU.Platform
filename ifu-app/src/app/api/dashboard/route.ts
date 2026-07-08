import { NextRequest, NextResponse } from "next/server";
import {
  getDashboardViewModel,
  recordDashboardAction,
  syncAuthenticatedUser,
} from "@/lib/dashboardData";
import { getAuthSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await syncAuthenticatedUser(session);
  const dashboard = await getDashboardViewModel(session);

  return NextResponse.json({ ok: true, dashboard });
}

export async function POST(request: NextRequest) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    action?: unknown;
    item?: unknown;
  };

  if (typeof body.action !== "string" || !body.item || typeof body.item !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid dashboard action" }, { status: 400 });
  }

  const item = body.item as Parameters<typeof recordDashboardAction>[1]["item"];
  const result = await recordDashboardAction(session, { action: body.action, item });

  return NextResponse.json(result);
}
