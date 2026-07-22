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
| `/v1/agrisphere/map` | `GET` | Yes | Returns country activity tiers, continent metadata, and map country signals. Enforces the configured per-member request window and records suspicious velocity/impossible-travel signals after the response. | Signed app session, Prisma AgriSphere tables, static fallback, Redis with process TTL/rate-limit fallback |
| `/v1/agrisphere/search` | `GET` | Yes | Searches countries, crops, organizations, treaties, sectors, top producers, and continents. Validates `q` (maximum 120 characters), `category`, and `limit` (1–50), enforces the configured request window, and records suspicious velocity/impossible-travel signals after the response. | Signed app session, OpenSearch, ranked Prisma/static fallback, Redis with process TTL/rate-limit fallback |
| `/v1/stats/live` | `GET` | Yes | Returns the six AgriSphere statistics used by the dashboard discovery surface. | Signed app session, latest platform stats snapshot, static fallback, Redis with process TTL fallback |
| `/v1/dashboard/feed` | `GET` | Yes | Returns up to 20 active opportunities ranked with TF-IDF/cosine similarity from role, category, geography, crops, interests, and saved history. Uses a persisted six-persona cluster ranking for cold start when a real cluster refresh is available. | Signed app session, Prisma user profile and saved items, AgriSphere opportunities, Redis persona-cluster cache |
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

## AgriSphere Internal Job Routes

These routes require `Authorization: Bearer <INTERNAL_JOB_SECRET>` and must also be excluded from the public CloudFront behavior in production.

| Route | Methods | Auth required | Purpose | Main dependencies |
| --- | --- | --- | --- | --- |
| `/v1/internal/dashboard-feed/refresh-clusters` | `POST` | Internal job secret | Rebuilds six deterministic K-Means persona centroids from real profiles, persists the versioned TF-IDF model/centroids, and replaces the hourly Redis rankings. Returns `skipped` rather than generating synthetic clusters when fewer than six profiles exist. | Prisma users/profiles/saved items/opportunities, Redis |

## Review Notes

- Public routes that write to the database still depend on a valid `DATABASE_URL` at runtime.
- Authenticated routes rely on the signed app session cookie, not direct Cognito tokens in the browser.
- `/api/auth/dev-login` is intentionally unavailable in production.
- `/agrisphere` is an authenticated entry point that redirects into the dashboard hub AgriSphere tab.
- `/api/preview-applications` remains for this sprint because existing static or referral flows may still call it; renaming it later should be a compatibility decision.
- AgriSphere `/v1` routes now read through `src/lib/agrisphere-repository.ts`, which prefers Prisma-managed Sprint 1.5 tables and falls back to the static corpus for read endpoints when local data services are unavailable or unseeded.
- The Sprint 1.5 discovery implementation uses Redis when configured, with a process-level TTL fallback. Search prefers OpenSearch, then ranked PostgreSQL search, then the representative corpus.
- Sprint 2 recommendation ranking is deterministic and explainable. Saved opportunity history changes the ranking signal; closed and draft opportunities are excluded by the repository query.
- Sprint 2.5 rate limits default to 120 search and 240 map requests per member per minute, with earlier audit-only alerts at 60 and 120. All four values are environment-configurable and require owner approval before production sign-off.
- Sprint 2.5 audit records use keyed hashes rather than raw IP addresses, user agents, queries, or authentication tokens. The current Prisma table is a durable deployment foundation; the Milestone 2 production architecture still requires the owner-selected DynamoDB/AgriShield delivery path.
- Aurora, OpenSearch, and Redis still require environment provisioning. Agreed database and search performance thresholds still require production-like measurement before sign-off.
- Data ownership, validation, refresh, and recovery procedures are defined in `docs/agrisphere-data-operations.md`.
- Run `npm run review:audit` before deploy and `npm run review:smoke -- --base-url=<deployed-url>` after deploy.
