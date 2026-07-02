import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await getPrisma().$queryRaw`SELECT 1`;

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String(error.code)
        : undefined;

    return NextResponse.json({ ok: false, error: message, code }, { status: 500 });
  }
}
