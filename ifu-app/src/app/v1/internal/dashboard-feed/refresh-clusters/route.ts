import { NextResponse } from "next/server";
import { refreshAgriSpherePersonaClusters } from "@/lib/agrisphere-repository";
import { authorizeInternalJob } from "@/lib/internal-job-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authorization = authorizeInternalJob(request);

  if (!authorization.authorized) {
    return NextResponse.json(
      { ok: false, error: authorization.error },
      { status: authorization.status },
    );
  }

  try {
    const result = await refreshAgriSpherePersonaClusters();
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("AgriSphere persona-cluster refresh failed", error);
    return NextResponse.json(
      { ok: false, error: "Persona-cluster refresh failed" },
      { status: 503 },
    );
  }
}
