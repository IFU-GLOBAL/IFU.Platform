import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const secret = process.env.MAINTENANCE_SECRET ?? process.env.CRON_SECRET;

  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const authorization = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-maintenance-secret");
  const bearerSecret = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;

  return bearerSecret === secret || headerSecret === secret;
}

async function cleanupExpiredReferralContacts(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const result = await getPrisma().recommendedContact.deleteMany({
      where: {
        OR: [
          {
            deleteAfter: {
              lte: now,
            },
          },
          {
            deleteTokenExpiresAt: {
              lte: now,
            },
          },
        ],
      },
    });

    return NextResponse.json({
      ok: true,
      deleted: result.count,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Referral cleanup failed";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return cleanupExpiredReferralContacts(request);
}

export async function POST(request: NextRequest) {
  return cleanupExpiredReferralContacts(request);
}
