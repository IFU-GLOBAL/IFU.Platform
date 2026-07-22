import crypto from "node:crypto";

export type InternalJobAuthorization =
  | { authorized: true }
  | { authorized: false; status: 401 | 503; error: string };

export function authorizeInternalJob(request: Request): InternalJobAuthorization {
  const configuredSecret = process.env.INTERNAL_JOB_SECRET?.trim();

  if (!configuredSecret || configuredSecret.length < 32) {
    return {
      authorized: false,
      status: 503,
      error: "Internal job authentication is not configured.",
    };
  }

  const authorization = request.headers.get("authorization") ?? "";
  const suppliedSecret = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
  const expected = Buffer.from(configuredSecret);
  const supplied = Buffer.from(suppliedSecret);
  const authorized =
    expected.length === supplied.length && crypto.timingSafeEqual(expected, supplied);

  return authorized
    ? { authorized: true }
    : { authorized: false, status: 401, error: "Unauthorized" };
}
