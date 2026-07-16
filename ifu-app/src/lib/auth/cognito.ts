import { Issuer, type Client } from "openid-client";

const DEFAULT_SCOPES = "openid email";

export type CognitoConfig = {
  region: string;
  userPoolId: string;
  issuerUrl: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  logoutUri: string;
  scopes: string;
  userPoolDomain: string | null;
  authorizationEndpoint: string | null;
  tokenEndpoint: string | null;
  userinfoEndpoint: string | null;
  endSessionEndpoint: string | null;
};

type CachedClient = {
  key: string;
  client: Client;
};

let cachedClient: CachedClient | null = null;

function readEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function requiredEnv(name: string, fallback?: string) {
  const value = readEnv(name) ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function normalizeBaseUrl(origin?: string) {
  const baseUrl = origin ?? readEnv("APP_BASE_URL") ?? readEnv("NEXT_PUBLIC_APP_URL");

  if (baseUrl) {
    const url = new URL(baseUrl);
    url.protocol = url.protocol.toLowerCase();
    url.hostname = url.hostname.toLowerCase();
    url.pathname = url.pathname.replace(/\/$/, "");

    return url.toString().replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("APP_BASE_URL is required in production.");
  }

  return "http://localhost:3000";
}

export function buildAppUrl(path: string, origin?: string) {
  return new URL(path, `${normalizeBaseUrl(origin)}/`).toString();
}

function normalizeDomain(domain?: string) {
  if (!domain) {
    return undefined;
  }

  if (
    domain.includes("<") ||
    domain.includes("your-prefix") ||
    domain.includes("cognito-idp.")
  ) {
    return undefined;
  }

  const withProtocol = domain.startsWith("http://") || domain.startsWith("https://")
    ? domain
    : `https://${domain}`;

  return withProtocol.replace(/\/$/, "");
}

export function getCognitoConfig(origin?: string): CognitoConfig {
  const region = requiredEnv("COGNITO_REGION", readEnv("NEXT_PUBLIC_COGNITO_REGION"));
  const userPoolId = requiredEnv("COGNITO_USER_POOL_ID", readEnv("NEXT_PUBLIC_COGNITO_USER_POOL_ID"));
  const clientId = requiredEnv("COGNITO_CLIENT_ID", readEnv("NEXT_PUBLIC_COGNITO_CLIENT_ID"));
  const issuerUrl =
    readEnv("COGNITO_ISSUER") ?? `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;

  const userPoolDomain = normalizeDomain(readEnv("COGNITO_DOMAIN")) ?? null;
  const oauthBase = userPoolDomain ? `${userPoolDomain}/oauth2` : null;

  return {
    region,
    userPoolId,
    issuerUrl,
    clientId,
    clientSecret: readEnv("COGNITO_CLIENT_SECRET"),
    redirectUri: origin
      ? buildAppUrl("/api/auth/callback", origin)
      : readEnv("COGNITO_REDIRECT_URI") ?? buildAppUrl("/api/auth/callback"),
    logoutUri: origin
      ? buildAppUrl("/", origin)
      : readEnv("COGNITO_LOGOUT_URI") ?? buildAppUrl("/"),
    scopes: readEnv("COGNITO_SCOPES") ?? DEFAULT_SCOPES,
    userPoolDomain,
    authorizationEndpoint: oauthBase ? `${oauthBase}/authorize` : null,
    tokenEndpoint: oauthBase ? `${oauthBase}/token` : null,
    userinfoEndpoint: oauthBase ? `${oauthBase}/userInfo` : null,
    endSessionEndpoint: userPoolDomain ? `${userPoolDomain}/logout` : null,
  };
}

export function getAuthConfigurationStatus(origin?: string) {
  const userPoolDomain = normalizeDomain(readEnv("COGNITO_DOMAIN"));
  const missing = [
    ["COGNITO_REGION", readEnv("COGNITO_REGION") ?? readEnv("NEXT_PUBLIC_COGNITO_REGION")],
    ["COGNITO_USER_POOL_ID", readEnv("COGNITO_USER_POOL_ID") ?? readEnv("NEXT_PUBLIC_COGNITO_USER_POOL_ID")],
    ["COGNITO_CLIENT_ID", readEnv("COGNITO_CLIENT_ID") ?? readEnv("NEXT_PUBLIC_COGNITO_CLIENT_ID")],
    ["COGNITO_DOMAIN", userPoolDomain],
    ["AUTH_SESSION_SECRET", readEnv("AUTH_SESSION_SECRET")],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  let config: CognitoConfig | null = null;

  if (missing.length === 0) {
    config = getCognitoConfig(origin);
  }

  return {
    configured: missing.length === 0,
    missing,
    config,
    hasClientSecret: Boolean(readEnv("COGNITO_CLIENT_SECRET")),
  };
}

export async function getCognitoClient(config = getCognitoConfig()) {
  if (
    !config.authorizationEndpoint ||
    !config.tokenEndpoint ||
    !config.userinfoEndpoint ||
    !config.endSessionEndpoint
  ) {
    throw new Error("COGNITO_DOMAIN is required for Cognito hosted login endpoints.");
  }

  const cacheKey = [
    config.issuerUrl,
    config.clientId,
    config.redirectUri,
    Boolean(config.clientSecret),
  ].join("|");

  if (cachedClient?.key === cacheKey) {
    return cachedClient.client;
  }

  const issuer = await Issuer.discover(config.issuerUrl);
  Object.assign(issuer.metadata, {
    authorization_endpoint: config.authorizationEndpoint,
    token_endpoint: config.tokenEndpoint,
    userinfo_endpoint: config.userinfoEndpoint,
    end_session_endpoint: config.endSessionEndpoint,
  });

  const client = new issuer.Client({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uris: [config.redirectUri],
    response_types: ["code"],
    token_endpoint_auth_method: config.clientSecret ? "client_secret_basic" : "none",
  });

  cachedClient = {
    key: cacheKey,
    client,
  };

  return client;
}

export function buildCognitoLogoutUrl(config = getCognitoConfig()) {
  const endpoint = config.endSessionEndpoint ?? `${config.issuerUrl}/logout`;
  const logoutUrl = new URL(endpoint);

  logoutUrl.searchParams.set("client_id", config.clientId);
  logoutUrl.searchParams.set("logout_uri", config.logoutUri);

  return logoutUrl.toString();
}
