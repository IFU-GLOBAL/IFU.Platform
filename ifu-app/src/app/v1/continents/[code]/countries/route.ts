import { NextResponse } from "next/server";
import {
  agrisphereSource,
  getContinentByCode,
  getCountriesForContinent,
} from "@/lib/agrisphere-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    code: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { code } = await context.params;
  const continent = getContinentByCode(code);

  if (!continent) {
    return NextResponse.json(
      {
        ok: false,
        error: "Continent not found",
        source: agrisphereSource,
      },
      { status: 404 },
    );
  }

  const countries = getCountriesForContinent(continent.code);

  return NextResponse.json({
    ok: true,
    source: agrisphereSource,
    continent,
    count: countries.length,
    countries,
  });
}
