import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import { agrisphereSource, getCountryByCode } from "@/lib/agrisphere-data";

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
  const country = getCountryByCode(code);

  if (!country) {
    return NextResponse.json(
      {
        ok: false,
        error: "Country not found",
        source: agrisphereSource,
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    source: agrisphereSource,
    country,
  });
}
