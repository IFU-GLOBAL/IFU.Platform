import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import { getAgriSphereOpportunityData } from "@/lib/agrisphere-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await getAgriSphereOpportunityData(id);

  if (!result.opportunity) {
    return NextResponse.json(
      {
        ok: false,
        error: "Opportunity not found",
        source: result.source,
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    ...result,
  });
}
