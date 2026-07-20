import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import {
  deleteAgriSphereOpportunitySave,
  saveAgriSphereOpportunity,
} from "@/lib/agrisphere-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function serviceError(error: unknown) {
  console.error("AgriSphere opportunity save action failed", error);

  return NextResponse.json(
    {
      ok: false,
      error: "Opportunity save action failed",
    },
    { status: 503 },
  );
}

export async function POST(_request: Request, context: RouteContext) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const result = await saveAgriSphereOpportunity(session, id);

    if (!result) {
      return NextResponse.json({ ok: false, error: "Opportunity not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return serviceError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const result = await deleteAgriSphereOpportunitySave(session, id);

    if (!result) {
      return NextResponse.json({ ok: false, error: "Opportunity not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return serviceError(error);
  }
}
