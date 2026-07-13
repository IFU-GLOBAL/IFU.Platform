import {
  CodeMismatchException,
  ExpiredCodeException,
  NotAuthorizedException,
  UserNotFoundException,
} from "@aws-sdk/client-cognito-identity-provider";
import { NextResponse } from "next/server";
import { confirmCognitoUserSignUp } from "@/lib/auth/cognito-user-pool";
import { finalizeUserAcquisition } from "@/lib/invitations";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function confirmationErrorMessage(error: unknown) {
  if (error instanceof CodeMismatchException) {
    return { status: 400, message: "Confirmation code is incorrect" };
  }

  if (error instanceof ExpiredCodeException) {
    return { status: 400, message: "Confirmation code has expired" };
  }

  if (error instanceof UserNotFoundException) {
    return { status: 404, message: "No Cognito signup was found for this email" };
  }

  if (error instanceof NotAuthorizedException) {
    return { status: 400, message: error.message || "This account is already confirmed" };
  }

  return {
    status: 500,
    message: error instanceof Error ? error.message : "Unable to confirm signup",
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const email = cleanString(body?.email).toLowerCase();
  const confirmationCode = cleanString(body?.confirmationCode);

  if (!email || !confirmationCode) {
    return NextResponse.json(
      { ok: false, error: "Email and confirmation code are required" },
      { status: 400 },
    );
  }

  try {
    await confirmCognitoUserSignUp({ email, confirmationCode });
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (user) {
      await prisma.$transaction((transaction) =>
        finalizeUserAcquisition(transaction, {
          userId: user.id,
          email,
          allowEmailFallback: true,
        }),
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const mapped = confirmationErrorMessage(error);

    return NextResponse.json({ ok: false, error: mapped.message }, { status: mapped.status });
  }
}
