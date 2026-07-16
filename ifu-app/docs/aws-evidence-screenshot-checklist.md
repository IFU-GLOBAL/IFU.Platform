# AWS Evidence Screenshot Checklist

Current review URL: `https://dev.d34plke7xvuysn.amplifyapp.com/`

Final domain plan:

- Public marketing site: `internationalfarmunion.com`
- Platform, dashboard, registration, and authenticated workflows: `ifuplatform.com`

Use this checklist to collect operator-owned evidence for the client review. Save screenshots with the date visible where practical.

## Amplify

Capture:

- Amplify app overview showing app name and region.
- Branch list showing the active `Dev` branch.
- Latest successful deployment for the review URL.
- Build log section showing `node scripts/sync-static-site.mjs`, `prisma generate`, and `next build`.
- Environment variables list with values redacted but names visible.
- Custom domain screen showing current DNS/SSL status, even if unresolved.

Notes to record:

- Review URL tested:
- Build date/time:
- Commit hash:
- Any SSL/DNS blocker:

## Cognito

Capture:

- User pool overview.
- App client overview for the web client.
- OAuth flow settings.
- Callback URLs showing `<APP_BASE_URL>/api/auth/callback`.
- Sign-out URLs showing `<APP_BASE_URL>/login?signedOut=1`.
- Managed login domain screen.
- Test user list or a single test user detail view with email redacted.

Functional evidence to capture:

- Registration starts from IFU custom registration page.
- Registration lands in dashboard.
- Regular login lands in dashboard.
- Dashboard Edit Profile opens `/profile` directly while signed in.
- Logout returns to `/login?signedOut=1`.
- Password reset opens Cognito recovery.

## RDS / Database

Capture:

- RDS instance overview with endpoint redacted if needed.
- Connectivity/security group summary.
- Backup retention setting.
- Latest automated backup or snapshot.
- Database engine/version.
- CloudWatch metrics tab for recent activity.

Notes to record:

- Migration command run:
- Seed command run:
- Backup/restore point before migration:

## CloudWatch

Capture:

- Amplify/Next runtime log group.
- Recent successful login callback log window.
- Recent successful registration log window.
- Any current error log filters with zero or known expected results.
- Retention setting for relevant log groups.

Suggested search terms:

- `Cognito callback failed`
- `registration`
- `PrismaClientKnownRequestError`
- `Unauthorized`

## CloudTrail

Capture:

- Trail status showing management events enabled, if configured.
- Event history filtered to recent Cognito, Amplify, RDS, or IAM activity.
- Log storage destination, if configured.

## IAM

Capture:

- Amplify service role summary.
- Policies attached to the Amplify role.
- SES sending identity permissions, if applicable.
- Any database access or secret access policy summary.

Do not expose plaintext secrets in screenshots.

## SES

Capture:

- Verified sender identity for `SES_FROM_EMAIL`.
- Verified reply-to domain/address if configured.
- Sandbox/production sending status.
- Recent send metrics, if available.

## Security / WAF / Budgets

Capture if configured:

- WAF web ACL attached to the app or CloudFront distribution.
- AWS Budgets alert for the environment.
- GuardDuty/Security Hub status, if enabled.
- Any SSL certificate validation record required for the custom domain.

## Application Smoke Evidence

After deployment, run:

```bash
npm run review:smoke
```

Or explicitly:

```bash
npm run review:smoke -- --base-url=https://dev.d34plke7xvuysn.amplifyapp.com
```

Capture:

- Terminal output from `npm run review:audit`.
- Terminal output from `npm run review:smoke`.
- Homepage.
- Discovery Center role selection.
- Registration page.
- Dashboard after login.
- Profile edit page.
- `/sitemap.xml`.
- `/robots.txt`.

## Client Review Focus

For the current sprint, prioritize evidence for:

- Home page.
- Discovery Center.
- Registration flow.
- Dashboard / Personal Command Center.

Country Intelligence pages can remain seed/fallback data for this checkpoint unless the client requires the review document's pilot-country data item before acceptance.
