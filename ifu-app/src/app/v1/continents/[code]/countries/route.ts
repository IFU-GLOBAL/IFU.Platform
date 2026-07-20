import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import { getAgriSphereContinentCountriesData } from "@/lib/agrisphere-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    code: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await context.params;
  const result = await getAgriSphereContinentCountriesData(code);

  if (!result.continent) {
    return NextResponse.json(
      {
        ok: false,
        error: "Continent not found",
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
