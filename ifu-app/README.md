# IFU Platform App

Next.js application for the IFU Role-Based Discovery & Education Center, preview invitation form, Cognito login, and the private IFU Personal Command Center Dashboard.

## Core Routes

- `/` redirects to `/discovery`.
- `/discovery` is the public Role-Based Discovery & Education Center with the 260-role matrix.
- `/invitation` is the preview invitation letter.
- `/register` starts Cognito sign-up.
- `/login` starts Cognito sign-in.
- `/profile` is the authenticated post-login profile completion form.
- `/dashboard` is the authenticated Personal Command Center Dashboard.
- `/api/preview-applications` stores preview form submissions.
- `/api/profile` saves authenticated profile completion fields.
- `/api/dashboard` loads/persists dashboard actions.
- `/api/geolocation` stores browser/CloudFront geolocation events.
- `/api/health/db` checks PostgreSQL connectivity.

## Required Environment Variables

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/ifu_platform?schema=public&sslmode=require&uselibpqcompat=true"
APP_BASE_URL="https://main.d34plke7xvuysn.amplifyapp.com"
AUTH_SESSION_SECRET="at-least-32-characters"

COGNITO_REGION="us-east-1"
COGNITO_USER_POOL_ID="us-east-1_pfz7IT7lv"
COGNITO_CLIENT_ID="2d8h65gh2hr3sc3m2nrhbhg963"
COGNITO_DOMAIN="https://us-east-1pfz7it7lv.auth.us-east-1.amazoncognito.com"
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

`/api/maintenance/referral-cleanup` accepts `Authorization: Bearer <secret>` or `x-maintenance-secret: <secret>`, using `MAINTENANCE_SECRET` or `CRON_SECRET`. Schedule that command, or an equivalent HTTPS POST, daily from EventBridge Scheduler, Amplify/hosting cron, or another production scheduler.

## Database Model

The Prisma schema includes the package-required platform surface:

- users, user profiles, selected roles
- profile interests for post-login personalization
- role categories and the 260 role records from the developer package
- preview submissions and preview applications
- recommended contacts and referral sources
- dashboard items, workspace items, bookmarks, applications
- messages, documents, activity logs, and geo events

## AWS Notes

Amplify builds this app as a WEB_COMPUTE Next.js app from `ifu-app`.

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
