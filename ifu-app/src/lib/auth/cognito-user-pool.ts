import crypto from "node:crypto";
import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  SignUpCommand,
  type AttributeType,
} from "@aws-sdk/client-cognito-identity-provider";
import { getCognitoConfig } from "@/lib/auth/cognito";

function secretHash(username: string, clientId: string, clientSecret?: string) {
  if (!clientSecret) {
    return undefined;
  }

  return crypto
    .createHmac("sha256", clientSecret)
    .update(`${username}${clientId}`)
    .digest("base64");
}

function getCognitoIdentityClient(region: string) {
  return new CognitoIdentityProviderClient({ region });
}

export async function signUpCognitoUser(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  const config = getCognitoConfig();
  const username = input.email.toLowerCase();
  const attributes: AttributeType[] = [
    { Name: "email", Value: username },
    { Name: "name", Value: `${input.firstName} ${input.lastName}`.trim() },
    { Name: "given_name", Value: input.firstName },
    { Name: "family_name", Value: input.lastName },
  ];

  const result = await getCognitoIdentityClient(config.region).send(
    new SignUpCommand({
      ClientId: config.clientId,
      SecretHash: secretHash(username, config.clientId, config.clientSecret),
      Username: username,
      Password: input.password,
      UserAttributes: attributes,
      ClientMetadata: {
        registration_source: "ifu_custom_registration",
        consent_terms: "true",
        age_confirmed: "true",
      },
    }),
  );

  return {
    userSub: result.UserSub,
    confirmed: Boolean(result.UserConfirmed),
    delivery: result.CodeDeliveryDetails,
  };
}

export async function confirmCognitoUserSignUp(input: {
  email: string;
  confirmationCode: string;
}) {
  const config = getCognitoConfig();
  const username = input.email.toLowerCase();

  await getCognitoIdentityClient(config.region).send(
    new ConfirmSignUpCommand({
      ClientId: config.clientId,
      SecretHash: secretHash(username, config.clientId, config.clientSecret),
      Username: username,
      ConfirmationCode: input.confirmationCode,
    }),
  );
}
