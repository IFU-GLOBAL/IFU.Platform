# IFU API Inventory

This inventory reflects the API routes currently implemented under `src/app/api` and the AgriSphere `/v1` contract.

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

## AgriSphere Discovery Routes

| Route | Methods | Auth required | Purpose | Main dependencies |
| --- | --- | --- | --- | --- |
| `/v1/health` | `GET` | No | Public AgriSphere health check and corpus status. | Prisma AgriSphere tables when seeded; static Sprint 1.5 fallback |
| `/v1/agrisphere/map` | `GET` | Yes | Returns country activity tiers, continent metadata, and map country signals. | Signed app session, Prisma AgriSphere tables, static fallback, Redis with process TTL fallback |
| `/v1/agrisphere/search` | `GET` | Yes | Searches countries, crops, organizations, treaties, sectors, top producers, and continents. Supports `q`, `category`, and `limit`. | Signed app session, OpenSearch, ranked Prisma/static fallback, Redis with process TTL fallback |
| `/v1/stats/live` | `GET` | Yes | Returns the six AgriSphere statistics used by the dashboard discovery surface. | Signed app session, latest platform stats snapshot, static fallback, Redis with process TTL fallback |
| `/v1/dashboard/feed` | `GET` | Yes | Returns the top-20 ranked AgriSphere opportunity feed for the signed-in member. | Signed app session, Prisma user profile, AgriSphere opportunities |
| `/v1/countries` | `GET` | Yes | Returns the AgriSphere country list. | Signed app session, Prisma AgriSphere tables, static fallback |
| `/v1/countries/[code]` | `GET` | Yes | Returns one country by ISO code, slug, or name. | Signed app session, Prisma AgriSphere tables, static fallback |
| `/v1/continents` | `GET` | Yes | Returns continent summaries and priority crop signals. | Signed app session, Prisma AgriSphere tables, static fallback |
| `/v1/continents/[code]/countries` | `GET` | Yes | Returns countries for one continent code or name. | Signed app session, Prisma AgriSphere tables, static fallback |
| `/v1/opportunities/[id]` | `GET` | Yes | Returns one active opportunity by database id or slug. | Signed app session, Prisma AgriSphere opportunities, static fallback |
| `/v1/opportunities/[id]/save` | `POST`, `DELETE` | Yes | Adds or removes a persistent saved opportunity signal for the signed-in member. | Signed app session, Prisma saved items |
| `/v1/organizations` | `GET` | Yes | Returns the AgriSphere organization directory. | Signed app session, Prisma AgriSphere organizations, static fallback |
| `/v1/treaties` | `GET` | Yes | Returns the AgriSphere treaty and trade-framework directory. | Signed app session, Prisma AgriSphere treaties, static fallback |
| `/v1/sectors` | `GET` | Yes | Returns the AgriSphere sector directory. | Signed app session, Prisma AgriSphere sectors, static fallback |
| `/v1/producers/top` | `GET` | Yes | Returns the Sprint 1.5 top farming country list. | Signed app session, Prisma AgriSphere producers, static fallback |
| `/v1/events` | `GET` | Yes | Returns AgriSphere events and webinars. | Signed app session, Prisma AgriSphere events, static fallback |
| `/v1/partners` | `GET` | Yes | Returns the AgriSphere partner directory. | Signed app session, Prisma AgriSphere partners, static fallback |

## Review Notes

- Public routes that write to the database still depend on a valid `DATABASE_URL` at runtime.
- Authenticated routes rely on the signed app session cookie, not direct Cognito tokens in the browser.
- `/api/auth/dev-login` is intentionally unavailable in production.
- `/agrisphere` is an authenticated entry point that redirects into the dashboard hub AgriSphere tab.
- `/api/preview-applications` remains for this sprint because existing static or referral flows may still call it; renaming it later should be a compatibility decision.
- AgriSphere `/v1` routes now read through `src/lib/agrisphere-repository.ts`, which prefers Prisma-managed Sprint 1.5 tables and falls back to the static corpus for read endpoints when local data services are unavailable or unseeded.
- The Sprint 1.5 implementation uses Redis when configured, with a process-level TTL fallback. Search prefers OpenSearch, then ranked PostgreSQL search, then the representative corpus.
- Aurora, OpenSearch, and Redis still require environment provisioning. Agreed database and search performance thresholds still require production-like measurement before sign-off.
- Data ownership, validation, refresh, and recovery procedures are defined in `docs/agrisphere-data-operations.md`.
- Run `npm run review:audit` before deploy and `npm run review:smoke -- --base-url=<deployed-url>` after deploy.
