# IFU Amplify Release Checklist

Use this checklist before asking the client to review a deployed IFU build.

Current client review URL: `https://dev.d34plke7xvuysn.amplifyapp.com/`

Final domain plan:

- `internationalfarmunion.com` for the public marketing site.
- `ifuplatform.com` for the platform, dashboard, registration, and authenticated workflows.

Current client-review focus:

- Home page.
- Discovery Center.
- Registration flow.
- Dashboard / Personal Command Center.

## 1. Local Preflight

```bash
npm run review:audit
npm run agrisphere:audit
npm run test:agrisphere
npx eslint
DATABASE_URL='postgresql://user:pass@host:5432/ifu_platform?schema=public&sslmode=require' npm run build
```

Expected result:

- `review:audit` passes with zero failures.
- ESLint passes.
- Production build completes and generates `/sitemap.xml` and `/robots.txt`.

## 2. Database Preflight

Only run migrations against the intended environment.

```bash
DATABASE_URL='postgresql://user:pass@host:5432/ifu_platform?schema=public&sslmode=require' npm run db:deploy
DATABASE_URL='postgresql://user:pass@host:5432/ifu_platform?schema=public&sslmode=require' npm run db:seed
DATABASE_URL='postgresql://user:pass@host:5432/ifu_platform?schema=public&sslmode=require' npm run roles:audit
DATABASE_URL='postgresql://user:pass@host:5432/ifu_platform?schema=public&sslmode=require' npm run agrisphere:index
```

Confirm:

- Migrations applied successfully.
- Role catalog seed exists before registration/profile role selection tests.
- Homepage/Discovery role catalog matches live database rows.
- RDS backup or restore point exists before production migration.

## 3. Amplify Environment Variables

Required runtime values:

- `AMPLIFY_MONOREPO_APP_ROOT=ifu-app`
- `APP_BASE_URL=https://dev.d34plke7xvuysn.amplifyapp.com` for the current review deployment
- `AUTH_SESSION_SECRET`
- `COGNITO_REGION`
- `COGNITO_USER_POOL_ID`
- `COGNITO_CLIENT_ID`
- `COGNITO_CLIENT_SECRET`, if the Cognito app client requires one
- `COGNITO_DOMAIN`
- `COGNITO_REDIRECT_URI`
- `COGNITO_LOGOUT_URI`
- `COGNITO_SCOPES`
- `DATABASE_URL`
- `OPENSEARCH_ENDPOINT`
- `OPENSEARCH_INDEX`
- `OPENSEARCH_REGION`
- `OPENSEARCH_SERVICE`
- `REDIS_URL`
- `SES_FROM_EMAIL`
- `SES_REGION`
- `SES_REPLY_TO_EMAIL`

Auth check:

```bash
npm run auth:audit
```

## 4. Cognito Console Verification

For the active Amplify URL and any custom domain, confirm the app client has:

- Callback URL: `<APP_BASE_URL>/api/auth/callback`
- Sign-out URL: `<APP_BASE_URL>/`
- OAuth flow enabled for authorization code grant
- Scopes aligned with `COGNITO_SCOPES`

For the current review URL, that means:

- Callback URL: `https://dev.d34plke7xvuysn.amplifyapp.com/api/auth/callback`
- Sign-out URL: `https://dev.d34plke7xvuysn.amplifyapp.com/`

## 5. Deploy

Amplify build should run:

```bash
node scripts/sync-static-site.mjs && prisma generate
next build
```

Confirm in build logs:

- Static marketing site synced into `public`.
- Prisma Client generated.
- Next build completed.
- Routes include `/dashboard`, `/discovery`, `/register`, `/profile`, `/country/[slug]`, `/robots.txt`, and `/sitemap.xml`.
- Routes include the complete authenticated AgriSphere `/v1` API inventory.
- `/v1/health` reports PostgreSQL, OpenSearch, and Redis as available before Sprint 1.5 sign-off.

## 6. Post-Deploy Smoke Test

Run against the deployed branch URL or custom domain:

```bash
npm run review:smoke
```

Optional DB health check:

```bash
npm run review:smoke -- --include-db
```

Expected unauthenticated behavior:

- Public pages return `200`.
- `/dashboard` redirects to `/login`.
- `/profile` redirects to `/login`.
- `/sitemap.xml` and `/robots.txt` return `200`.

## 7. Browser Acceptance

Test manually on desktop and mobile:

- Homepage loads and key CTAs stay on IFU-owned routes.
- Homepage metric counters animate from zero to the displayed values.
- Homepage hero image loads consistently.
- Homepage roles match the Discovery/database role catalog.
- Discovery Center search, filters, role count, role selection, and registration handoff work.
- Registration uses IFU registration language and records selected Discovery roles.
- Public homepage header login goes to dashboard after Cognito login.
- Registration creates account and lands in dashboard.
- Dashboard loads after login and saved items/actions persist.
- Dashboard profile completion links to `/profile` without Cognito interruption when already signed in.
- Profile completion reaches `100%` when all required fields are supplied.
- Logout through Cognito returns to the home page.
- Country map links resolve to `/country/[slug]`; seed/fallback country data is acceptable for this checkpoint unless pilot-country data is required by the client.

## 8. Evidence To Save

Save screenshots or exported evidence for:

- Amplify successful deployment
- Cognito callback/logout settings
- Home page
- Discovery Center with selected roles
- Registration success
- Login success
- Dashboard authenticated state
- Profile completion/edit page
- `/sitemap.xml`
- `/robots.txt`
- RDS backup/restore status
- CloudWatch logs after successful login/registration
- DNS/SSL blocker for the final custom domains, if still unresolved

## 9. Rollback

Application rollback:

- Use Amplify deployment history to redeploy the previous successful build.
- Keep the prior commit hash available before release.

Database rollback:

- Prisma migrations are forward-only.
- Use RDS backup/restore for production rollback.
- Do not apply production migrations without confirming a recent restore point.
