# IFU Release Evidence Package

This package lists the evidence that can be produced from the repository for the AWS Amplify development-site review. Console screenshots, legal approvals, production credentials, and official metric certification remain operator-owned.

## Release Identity

| Item | Evidence |
| --- | --- |
| App root | `ifu-app` |
| Framework | Next.js application with synced static public site assets |
| Branch under test | Confirm in Git before release, normally `Dev` for development validation |
| Release commit | Operator to record the exact commit hash before deployment |
| Current review URL | `https://dev.d34plke7xvuysn.amplifyapp.com/` |
| Final public-site domain | `internationalfarmunion.com` |
| Final platform/dashboard domain | `ifuplatform.com` |
| Priority client-review surfaces | Home page, Discovery Center, registration, and dashboard |
| Product language | Use `registration`, not preview application, for current user-facing flows |
| OpenGraph/social image | IFU logo asset at `/images/ifu-logo-hero.png` |

## Route And Feature Evidence

Primary route coverage is tracked in `docs/review-remediation-inventory.md`.
API route coverage is tracked in `docs/api-inventory.md`.
Amplify release steps are tracked in `docs/amplify-release-checklist.md`.
AWS screenshot collection is tracked in `docs/aws-evidence-screenshot-checklist.md`.

Key release routes:

- `/` synced static public homepage, patched by `scripts/sync-static-site.mjs`
- `/discovery` role-based Discovery Center
- `/register` custom registration backed by Cognito signup
- `/login` Cognito managed-login entry
- `/dashboard` authenticated Personal Command Center
- `/profile` authenticated profile completion and edit route
- `/country/[slug]` IFU-owned country intelligence route
- `/invitation`, `/i/[code]`, and `/api/invitations/*` invitation acquisition flow
- `/privacy`, `/forgot-password`, and `/register/confirm` support routes

## Auth Evidence

Repo evidence:

- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/callback/route.ts`
- `src/app/api/auth/signup/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/lib/auth.ts`
- `scripts/audit-auth-config.mjs`

Operator evidence still required:

- Cognito app client callback URLs for each active Amplify URL and custom domain
- Cognito sign-out URLs for each active Amplify URL and custom domain
- App client OAuth flow settings
- Test login, logout, registration, and password reset screenshots from deployed environment

## Database Evidence

Repo evidence:

- `prisma/schema.prisma`
- `prisma/migrations/`
- `scripts/seed-role-catalog.ts`
- `src/app/api/profile/route.ts`
- `src/app/api/dashboard/route.ts`
- `src/app/api/health/db/route.ts`

Verification commands:

```bash
node scripts/review-audit.mjs
DATABASE_URL='postgresql://user:pass@host:5432/ifu_platform?schema=public&sslmode=require' npm run db:deploy
DATABASE_URL='postgresql://user:pass@host:5432/ifu_platform?schema=public&sslmode=require' npm run db:seed
DATABASE_URL='postgresql://user:pass@host:5432/ifu_platform?schema=public&sslmode=require' npm run build
```

Operator evidence still required:

- RDS backup policy
- Restore test or backup screenshot
- Production secret storage confirmation

## Country Intelligence Evidence

Repo evidence:

- `src/lib/country-intelligence.ts`
- `src/components/country-intelligence-tabs.tsx`
- `src/app/country/[slug]/page.tsx`
- `src/app/sitemap.ts`

Implemented release behavior:

- Public map clicks stay on IFU-owned `/country/[slug]` routes.
- Country pages use Overview, Commodities, Opportunities, and IFU Path tabs.
- Seed, fallback, timestamp, refresh cadence, license status, and map attribution are visible on page.

Owner evidence still required:

- Approved country datasets, if the client requires the review document's pilot-country acceptance item before signoff
- External source licenses, if real sourced country data is introduced
- Final refresh cadence
- Priority-country completeness checklist, if pilot countries are named for this sprint

## Static Site Sync Evidence

Repo evidence:

- `scripts/sync-static-site.mjs`
- `public/` generated static assets

The sync script patches:

- Discovery navigation and registration links
- Header login target
- Legacy map country links
- Known editorial issues
- Placeholder metric labels
- AgriFinance ecosystem insertion where matched
- Known external map vendor markup where matched

## Security Evidence

Repo evidence:

- `next.config.ts` adds HSTS, content-type, frame, referrer, and permissions-policy headers.
- `scripts/audit-auth-config.mjs` checks critical Cognito environment alignment.
- `src/app/robots.ts` prevents indexing of private dashboard/profile and API paths.

Operator evidence still required:

- WAF configuration, if enabled
- CloudTrail and CloudWatch retention screenshots
- IAM least-privilege review
- RDS backup and restore evidence
- Secrets handling confirmation in Amplify environment variables
- Screenshots listed in `docs/aws-evidence-screenshot-checklist.md`

## SEO And Redirect Evidence

Repo evidence:

- `next.config.ts` known legacy redirects
- `src/app/layout.tsx` default metadata, OpenGraph, Twitter, and canonical metadata
- `src/app/country/[slug]/page.tsx` country canonical metadata
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `scripts/review-audit.mjs`
- `scripts/review-smoke.mjs`

Operator evidence still required:

- Deployed redirect smoke test
- Custom-domain DNS/SSL evidence when `internationalfarmunion.com` and `ifuplatform.com` are connected

## Accessibility Evidence

Repo evidence:

- Discovery search/filter/table controls have accessible names.
- Registration and profile forms expose busy and live status states.
- Dashboard and profile completion progress bars expose progress semantics.
- Decorative icons are hidden from assistive technology where appropriate.

Suggested smoke checks:

```bash
npm run review:audit
npx eslint src/components/discovery-center.tsx src/components/registration-form.tsx src/components/profile-completion-form.tsx src/components/mini-geo-global-map.tsx src/components/ifu-personal-command-center.tsx
npm run review:smoke
```

Operator evidence still required:

- Keyboard walkthrough
- Mobile screenshots
- Contrast check
- WCAG report, if the client requires formal accessibility evidence

## Rollback Notes

Application rollback:

- Use Amplify deployment history to redeploy the previous successful build.
- Use Git to identify the prior known-good commit before starting release.

Database rollback:

- Prisma migrations are forward-only in this repo.
- Use RDS backup/restore procedures for production rollback.
- Test migration changes in development before applying to production.
