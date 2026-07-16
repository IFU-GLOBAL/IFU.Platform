# IFU Platform App

Next.js application for the IFU Role-Based Discovery & Education Center, preview invitation form, Cognito login, and the private IFU Personal Command Center Dashboard.

## Core Routes

- `/` redirects to `/discovery`.
- `/discovery` is the public Role-Based Discovery & Education Center with the 260-role matrix.
- `/country/[slug]` is the IFU-owned Country Agricultural Intelligence Center route used by public map clicks and dashboard country links.
- Legacy `/index.html?p=...` URLs 301 redirect to clean IFU-owned routes in `next.config.ts`.
- `/invitation` is the preview invitation letter.
- `/register` is the short Tier 1 signup screen: name, email, password, required terms/data consent, optional marketing opt-in, and required 16+ attestation.
- `/login` starts Cognito sign-in.
- `/profile` is the authenticated, skippable Tier 2 profile prompt for better local and opportunity matching.
- `/dashboard` is the authenticated Personal Command Center Dashboard.
- `/api/preview-applications` stores preview form submissions.
- `/api/auth/signup` creates Cognito users from the custom IFU registration form.
- `/api/auth/confirm-signup` confirms Cognito signup codes.
- `/api/invitations` creates no-privilege invitation links for sharing/import workflows.
- `/api/invitations/[code]` validates invitation attribution for `/register?inv=...`.
- `/i/[code]` is the short invitation URL that redirects to `/register?inv=...`.
- `/api/profile` saves authenticated profile completion fields.
- `/api/dashboard` loads/persists dashboard actions.
- `/api/geolocation` stores browser/CloudFront geolocation events.
- `/api/health/db` checks PostgreSQL connectivity.

## Country Intelligence MVP

The country route currently ships as a Tier 2 MVP:

- Four views: overview, production, markets, and opportunities.
- Pilot seed records live in `src/lib/country-intelligence.ts`.
- Fallback country pages keep every public map click on an IFU-owned route.
- Each country page exposes seed status, timestamp, source notes, and remaining data-lineage gaps.

Before final acceptance, replace seed records with owner-approved country data, source citations, data licenses, and refresh cadence.

## Review Remediation Inventory

The owner review remediation inventory lives in `docs/review-remediation-inventory.md`. It maps the July 12, 2026 review issues to current route status, implemented evidence, and remaining owner/operator work.

## Required Environment Variables

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/ifu_platform?schema=public&sslmode=require&uselibpqcompat=true"
APP_BASE_URL="https://invite.ifuplatform.com"
AUTH_SESSION_SECRET="at-least-32-characters"

COGNITO_REGION="us-east-1"
COGNITO_USER_POOL_ID="us-east-1_pfz7IT7lv"
COGNITO_CLIENT_ID="2d8h65gh2hr3sc3m2nrhbhg963"
COGNITO_CLIENT_SECRET="optional-app-client-secret"
COGNITO_DOMAIN="https://us-east-1pfz7it7lv.auth.us-east-1.amazoncognito.com"
COGNITO_REDIRECT_URI="https://invite.ifuplatform.com/api/auth/callback"
COGNITO_LOGOUT_URI="https://invite.ifuplatform.com/login?signedOut=1"
COGNITO_SCOPES="openid email profile"

SES_REGION="us-east-1"
SES_FROM_EMAIL="verified-sender@example.com"
SES_REPLY_TO_EMAIL="reply@example.com"

MAINTENANCE_SECRET="long-random-maintenance-secret"
CRON_SECRET="long-random-cron-secret"
```

Do not commit real secrets.

## Local Commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm run auth:audit
```

Prisma:

```bash
npm run db:generate
npm run db:deploy
npm run db:seed
```

Maintenance:

```bash
APP_BASE_URL="https://invite.ifuplatform.com" \
CRON_SECRET="long-random-cron-secret" \
npm run maintenance:referral-cleanup
```

Invitation import:

```bash
npm --silent run invitations:import -- ./invitations.csv > generated-invitation-links.csv
```

CSV columns:

```csv
name,email,phone,country,suggested_role,invited_by,channel,expires_at
Jean Mbarga,jean@example.com,,Cameroon,Cocoa Farmer,Country Rep,whatsapp,
```

Blank `expires_at` values default to 90 days. The import prints each generated invitation code and short `/i/CODE` link.

Auth environment audit:

```bash
npm run auth:audit
npm run auth:audit -- --strict
```

The audit prints the exact Cognito callback and sign-out URLs for the current `APP_BASE_URL`, checks required auth variables without exposing secrets, and lists the AWS console values that still need manual confirmation. Use `--strict` in CI or before deployment to fail on any mismatch or missing value.

`/api/maintenance/referral-cleanup` accepts `Authorization: Bearer <secret>` or `x-maintenance-secret: <secret>`, using `MAINTENANCE_SECRET` or `CRON_SECRET`. Schedule that command, or an equivalent HTTPS POST, daily from EventBridge Scheduler, Amplify/hosting cron, or another production scheduler.

## Database Model

The Prisma schema includes the package-required platform surface:

- users, user profiles, selected roles
- profile interests, crops/livestock, farm size band, goals, and consent fields for post-login personalization
- role categories and the 260 role records from the developer package
- preview submissions and preview applications
- recommended contacts and referral sources
- dashboard items, workspace items, bookmarks, applications
- messages, documents, activity logs, and geo events

## AWS Notes

Amplify builds this app as a WEB_COMPUTE Next.js app from `ifu-app`.

Custom registration uses the Cognito User Pools `SignUp` and `ConfirmSignUp` APIs from server routes. The app client must allow self-service sign-up and write access to `email`, `name`, `given_name`, and `family_name`.

The helper script below checks the required AWS surfaces without making destructive changes:

```bash
scripts/aws-bootstrap.sh
```

Known admin/DNS-dependent items:

- Amplify SSR compute role needs SES send permissions.
- `invite.ifuplatform.com` Route 53/Amplify domain mapping remains an AWS console/DNS task.
- `internationalfarmunion.com` DNS is required for custom domain, SSL, SES domain verification, DKIM, SPF, and DMARC.
- S3 document upload/presign routes are not enabled until the media bucket policy and CORS are approved.
- QuickSight/Data Engine, WAF, CloudTrail, GuardDuty, Security Hub, and production CloudWatch alarms remain infrastructure tasks.
