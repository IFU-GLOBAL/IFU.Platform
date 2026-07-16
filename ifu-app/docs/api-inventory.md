# IFU API Inventory

This inventory reflects the API routes currently implemented under `src/app/api`.

## Public Auth Routes

| Route | Methods | Auth required | Purpose | Main dependencies |
| --- | --- | --- | --- | --- |
| `/api/auth/login` | `GET` | No | Starts Cognito managed-login OAuth flow and preserves `returnTo`. | `COGNITO_DOMAIN`, `COGNITO_CLIENT_ID`, `APP_BASE_URL` |
| `/api/auth/callback` | `GET` | No | Handles Cognito OAuth callback, syncs/creates local user, and creates app session. | Cognito, Prisma, `AUTH_SESSION_SECRET` |
| `/api/auth/logout` | `GET` | Session optional | Clears local app session and redirects to Cognito logout when configured. | Cognito, `APP_BASE_URL` |
| `/api/auth/session` | `GET` | Session optional | Returns current app session state for client UI. | Signed app session cookie |
| `/api/auth/signup` | `POST` | No | Creates Cognito user, records registration fields, and starts app session where possible. | Cognito, Prisma |
| `/api/auth/register` | `POST` | No | Compatibility registration endpoint for the custom registration flow. | Cognito, Prisma |
| `/api/auth/confirm-signup` | `POST` | No | Confirms Cognito signup code when email verification is re-enabled. | Cognito |
| `/api/auth/dev-login` | `GET` | No, development only | Creates a local preview session outside production. | `NODE_ENV !== "production"` |

## User And Dashboard Routes

| Route | Methods | Auth required | Purpose | Main dependencies |
| --- | --- | --- | --- | --- |
| `/api/dashboard` | `GET`, `POST` | Yes | Reads dashboard view model and records dashboard actions/bookmarks/workspace activity. | Prisma, app session |
| `/api/profile` | `POST` | Yes | Saves progressive profile fields, selected roles, completion score, and workspace profile data. | Prisma, app session |
| `/api/geolocation` | `POST` | Yes | Saves approximate browser/cloud location with consent metadata. | Prisma, app session |

## Invitation And Referral Routes

| Route | Methods | Auth required | Purpose | Main dependencies |
| --- | --- | --- | --- | --- |
| `/api/invitations` | `POST` | No | Creates no-privilege invitation links for invite/referral acquisition. | Prisma, request origin |
| `/api/invitations/[code]` | `GET` | No | Validates an invitation code and returns attribution metadata. | Prisma |
| `/api/referrals/delete` | `GET`, `POST` | No | Validates and processes referral deletion requests. | Prisma, referral delete token |
| `/api/maintenance/referral-cleanup` | `GET`, `POST` | Maintenance secret | Removes expired referral records. | Prisma, maintenance token |

## Legacy Preview Intake Route

| Route | Methods | Auth required | Purpose | Main dependencies |
| --- | --- | --- | --- | --- |
| `/api/preview-applications` | `POST` | No | Legacy intake endpoint retained for earlier preview/referral workflows. For this sprint, keep the endpoint for compatibility while user-facing copy refers to registration/invitation. | Prisma, SES |

## Health Route

| Route | Methods | Auth required | Purpose | Main dependencies |
| --- | --- | --- | --- | --- |
| `/api/health/db` | `GET` | No | Checks database connectivity for deployment diagnostics. | Prisma, `DATABASE_URL` |

## Review Notes

- Public routes that write to the database still depend on a valid `DATABASE_URL` at runtime.
- Authenticated routes rely on the signed app session cookie, not direct Cognito tokens in the browser.
- `/api/auth/dev-login` is intentionally unavailable in production.
- `/api/preview-applications` remains for this sprint because existing static or referral flows may still call it; renaming it later should be a compatibility decision.
- Run `npm run review:audit` before deploy and `npm run review:smoke -- --base-url=<deployed-url>` after deploy.
