import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";

type PreviewEmailInput = {
  to: string;
  firstName: string;
  selectedRoleTitles: string[];
};

type ReferralEmailInput = {
  to: string;
  referredName?: string;
  referrerName: string;
  discoveryUrl: string;
  deleteUrl: string;
};

let sesClient: SESv2Client | null = null;

function getSesClient() {
  if (sesClient) {
    return sesClient;
  }

  const region =
    process.env.SES_REGION ??
    process.env.AWS_REGION ??
    process.env.AWS_DEFAULT_REGION;

  if (!region) {
    return null;
  }

  sesClient = new SESv2Client({ region });
  return sesClient;
}

export async function sendPreviewConfirmationEmail(input: PreviewEmailInput) {
  const fromEmail = process.env.SES_FROM_EMAIL;
  const client = getSesClient();

  if (!client || !fromEmail) {
    return { status: "skipped", messageId: null, error: "SES is not configured" };
  }

  const roleList =
    input.selectedRoleTitles.length > 0
      ? input.selectedRoleTitles.map((role) => `- ${role}`).join("\n")
      : "- Role selection pending review";

  const result = await client.send(
    new SendEmailCommand({
      FromEmailAddress: fromEmail,
      Destination: {
        ToAddresses: [input.to],
      },
      ReplyToAddresses: process.env.SES_REPLY_TO_EMAIL
        ? [process.env.SES_REPLY_TO_EMAIL]
        : undefined,
      Content: {
        Simple: {
          Subject: {
            Data: "IFU registration received",
          },
          Body: {
            Text: {
              Data: `Hello ${input.firstName},

Thank you for creating your IFU registration. We received your selected role interests:

${roleList}

The IFU team will review your interests and follow up with the next steps.

International Farm Union`,
            },
          },
        },
      },
    }),
  );

  return { status: "sent", messageId: result.MessageId ?? null, error: null };
}

export async function sendReferralInvitationEmail(input: ReferralEmailInput) {
  const fromEmail = process.env.SES_FROM_EMAIL;
  const client = getSesClient();

  if (!client || !fromEmail) {
    return { status: "skipped", messageId: null, error: "SES is not configured" };
  }

  const greeting = input.referredName ? `Hello ${input.referredName},` : "Hello,";

  const result = await client.send(
    new SendEmailCommand({
      FromEmailAddress: fromEmail,
      Destination: {
        ToAddresses: [input.to],
      },
      ReplyToAddresses: process.env.SES_REPLY_TO_EMAIL
        ? [process.env.SES_REPLY_TO_EMAIL]
        : undefined,
      Content: {
        Simple: {
          Subject: {
            Data: "You were invited to IFU",
          },
          Body: {
            Text: {
              Data: `${greeting}

${input.referrerName} recommended you for an International Farm Union invitation.

You can review the Role-Based Discovery Center here:
${input.discoveryUrl}

This is a one-time invitation. IFU will not contact you again unless you respond or create your own IFU registration.

To decline or request deletion of this referral record, use:
${input.deleteUrl}

International Farm Union`,
            },
          },
        },
      },
    }),
  );

  return { status: "sent", messageId: result.MessageId ?? null, error: null };
}
