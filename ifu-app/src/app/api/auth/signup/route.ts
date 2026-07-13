import {
  CodeDeliveryFailureException,
  InvalidPasswordException,
  InvalidParameterException,
  NotAuthorizedException,
  UsernameExistsException,
} from "@aws-sdk/client-cognito-identity-provider";
import { NextResponse } from "next/server";
import { signUpCognitoUser } from "@/lib/auth/cognito-user-pool";
import { finalizeUserAcquisition } from "@/lib/invitations";
import { getPrisma } from "@/lib/prisma";
import { parseRegistrationPayload } from "@/lib/registration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cognitoErrorMessage(error: unknown) {
  if (error instanceof UsernameExistsException) {
    return { status: 409, message: "An account already exists for this email address" };
  }

  if (error instanceof InvalidPasswordException) {
    return { status: 400, message: error.message || "Password does not meet Cognito policy" };
  }

  if (error instanceof InvalidParameterException) {
    return { status: 400, message: error.message || "Registration details are invalid" };
  }

  if (error instanceof CodeDeliveryFailureException) {
    return { status: 502, message: "Cognito created the user but could not send the confirmation code" };
  }

  if (error instanceof NotAuthorizedException) {
    return { status: 500, message: "Cognito app client is not authorized for signup" };
  }

  return {
    status: 500,
    message: error instanceof Error ? error.message : "Unable to create Cognito account",
  };
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseRegistrationPayload(body);

  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const payload = parsed.payload;
  const prisma = getPrisma();
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
    select: { id: true },
  });

  if (existingUser) {
    return NextResponse.json(
      { ok: false, error: "An account already exists for this email address" },
      { status: 409 },
    );
  }

  try {
    const cognitoResult = await signUpCognitoUser({
      email: payload.email,
      password: payload.password,
      firstName: payload.firstName,
      lastName: payload.lastName,
    });
    const fullName = `${payload.firstName} ${payload.lastName}`.trim();
    const now = new Date();

    await prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          cognitoId: cognitoResult.userSub,
          email: payload.email,
          fullName,
          firstName: payload.firstName,
          lastName: payload.lastName,
          termsAccepted: true,
          termsAcceptedAt: now,
          marketingOptIn: payload.marketingOptIn,
          marketingOptInAt: payload.marketingOptIn ? now : null,
          ageConfirmedAt: now,
          profile: {
            create: {
              profileCompletion: 20,
            },
          },
        },
      });

      await finalizeUserAcquisition(transaction, {
        userId: user.id,
        email: payload.email,
        invitationCode: payload.invitationCode,
        allowEmailFallback: false,
        selfReportedSource: payload.selfReportedSource,
        selfReportedDetail: payload.selfReportedDetail,
        utmSource: payload.utmSource,
        utmCampaign: payload.utmCampaign,
        utmMedium: payload.utmMedium,
        firstTouchUrl: payload.firstTouchUrl,
      });
    });

    return NextResponse.json(
      {
        ok: true,
        email: payload.email,
        confirmed: cognitoResult.confirmed,
        delivery: cognitoResult.delivery
          ? {
              destination: cognitoResult.delivery.Destination,
              medium: cognitoResult.delivery.DeliveryMedium,
              attribute: cognitoResult.delivery.AttributeName,
            }
          : null,
      },
      { status: 201 },
    );
  } catch (error) {
    const mapped = cognitoErrorMessage(error);

    return NextResponse.json({ ok: false, error: mapped.message }, { status: mapped.status });
  }
}
