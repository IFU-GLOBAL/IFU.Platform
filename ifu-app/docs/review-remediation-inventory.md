# IFU Review Remediation Inventory

Source review: `IFU_Development_Site_Review_AWS_Amplify_2026-07-12.docx.txt`

This inventory tracks the owner review items that can be evidenced from the repository. AWS console screenshots, legal approvals, official metric certification, and production smoke evidence still need human/operator confirmation.

## Current Review Assumptions

| Decision | Current value |
| --- | --- |
| Active review URL | `https://dev.d34plke7xvuysn.amplifyapp.com/` |
| Final public-site domain | `internationalfarmunion.com` |
| Final platform/dashboard domain | `ifuplatform.com` |
| Current priority surfaces | Home page, Discovery Center, registration, and dashboard / Personal Command Center |
| Product language | Use `registration` for current user-facing flows; keep `/api/preview-applications` as a legacy compatibility endpoint for this sprint. |
| Country data scope | Real sourced country data is not required for this checkpoint unless the client explicitly applies the review document's pilot-country acceptance item. |
| OpenGraph/social image | IFU logo asset at `/images/ifu-logo-hero.png` |
| Dashboard acceptance focus | The review document's explicit checklist item is that the Personal Command Center loads after login and saved items persist. |

## Route Inventory

| Route | Status | Evidence / notes |
| --- | --- | --- |
| `/` | Partial | Serves the synced static public homepage from `public/index.html`. Static content is patched during `prebuild` by `scripts/sync-static-site.mjs`. |
| `/discovery` | Complete for current milestone | Native Next.js Role-Based Discovery Center with persona filtering, search, category filter, paged role table, role selection, share links, and embedded registration. |
| `/register` | Complete for current milestone | Custom IFU registration page backed by Cognito signup and app session creation. |
| `/login` | Complete for current milestone | Starts Cognito hosted login and exposes helpful local/dev states. |
| `/profile` | Complete for current milestone | Authenticated profile completion/edit page linked from the dashboard completion indicator. |
| `/dashboard` | MVP partial | Authenticated Personal Command Center with persisted dashboard actions, workspace items, profile/location panel, drawer interactions, and data-driven workspace/journey/pathway pages. Deeper full-product workspaces remain future enhancements. |
| `/country/[slug]` | MVP partial | IFU-owned Country Intelligence route with Overview, Commodities, Opportunities, and IFU Path views, visible seed status, source notes, and fallbacks. Seed/fallback data is acceptable for this checkpoint unless pilot-country data is required for acceptance. |
| `/invitation` | Complete for current milestone | Public invitation letter with sharing and copy-link support. |
| `/privacy` | Complete for current milestone | Short-form privacy notice and referral deletion instructions. |
| `/forgot-password` | Complete for current milestone | Routes users into Cognito recovery. |
| `/register/confirm` | Deferred by product choice | Confirmation page exists, but the current product decision is to let registration enter the dashboard immediately and handle email verification later. |
| `/api/auth/*` | Complete for current milestone | Cognito login, callback, logout, signup, signup confirmation, session, and dev-login endpoints. |
| `/api/invitations/*` and `/i/[code]` | Complete for current milestone | No-privilege invitation attribution, short links, import workflow support. |
| `/api/profile` | Complete for current milestone | Saves authenticated profile fields, selected roles, completion score, and workspace status. |
| `/api/dashboard` | Partial | Persists dashboard actions to bookmarks, workspace items, applications, and activity logs. |
| `/api/geolocation` | Complete for current milestone | Saves approximate browser/cloud location with consent metadata. |
| `/api/health/db` | Complete for current milestone | Database connectivity health check. |
| Static public routes such as `/about-us`, `/platforms`, `/programs`, `/foundation`, `/gallery`, `/insights` | Partial | Synced static public-site pages. Content is useful for launch review, but several remain descriptive rather than full application workspaces. |

## Issue Register Status

| ID | Review area | Current repository status | Remaining owner/operator work |
| --- | --- | --- | --- |
| IFU-001 | Data credibility | Static sync patches homepage counters, keeps metric spans starting at `0`, and injects an IFU count-up script so Countries/Farmers/Partners/Projects animate where the bar appears. Metrics remain labeled as official placeholders / 2030 vision where implemented. | Owner must confirm which metrics are current verified results versus targets before final production language. |
| IFU-002 | Authentication | App supports environment-driven Cognito callback/logout URLs and `npm run auth:audit`. Current review URLs are `https://dev.d34plke7xvuysn.amplifyapp.com/api/auth/callback` and `https://dev.d34plke7xvuysn.amplifyapp.com/`. | Operator must confirm Cognito console callback/sign-out lists for the review URL and later for `ifuplatform.com`. |
| IFU-003 | Map external link | Static sync rewrites the country popup click target to IFU-owned `/country/[slug]` routes and removes disruptive WPMapPlugins credit link markup where matched. | Browser acceptance test on deployed homepage. |
| IFU-004 | Legacy URLs | `next.config.ts` redirects known `index.html?p=...` post IDs and known sitemap legacy paths to clean IFU-owned routes. | Deployed smoke test and final canonical domain decision. |
| IFU-005 | Ecosystem consistency | Static sync adds AgriFinance beside AgriFunds where matched and Discovery uses 10 ecosystem pathways. | Owner-approved final ecosystem copy across every static legacy page. |
| IFU-006 | Scope completion | This inventory identifies Complete, Partial, MVP partial, Deferred, and descriptive static routes. `docs/api-inventory.md` documents the current API surface. Dashboard sample pages have been replaced with MVP data-driven workspace surfaces. | Owner/developer acceptance on what counts as production workspace completeness. |
| IFU-007 | Country Intelligence | `/country/[slug]` exists with Overview, Commodities, Opportunities, and IFU Path views. The page exposes source register, timestamp, refresh cadence, license status, attribution, seed notes, and fallback states. | Approved country data and source licenses only if the client requires complete pilot-country data before acceptance. |
| IFU-008 | Security evidence | README documents required env vars and auth audit; `next.config.ts` adds conservative security headers; `docs/release-evidence-package.md` and `docs/amplify-release-checklist.md` list AWS evidence still required. | AWS console/IaC evidence for WAF, CloudTrail, CloudWatch, IAM, backups, secrets, and deployed header verification. |
| IFU-009 | Editorial quality | Static sync fixes repeated known issues: duplicate `roles roles`, `ai powered`, `Quantum Sphere`, `scalable.How`, ecosystem count wording, and public login target regressions. `npm run review:audit` checks known stale wording and generated static HTML regressions. | Full editorial pass on remaining static public pages. |
| IFU-010 | Role matrix UX | Discovery role matrix is searchable, category-filtered, persona-filtered, table-based, and paged in 40-role increments. | Browser UX acceptance on desktop/mobile. |
| IFU-011 | Role personalization | Role catalog and preview values are seeded and wired to registration selections. Homepage roles are generated from the same catalog used by Discovery and database seeding; `npm run roles:audit` compares that catalog to live database rows when `DATABASE_URL` is available. | Priority-role copywriting for deeper benefits/tools/training/pathways. |
| IFU-012 | Information architecture | Discovery and auth flows have moved into native Next.js routes; static homepage remains broad. | Larger homepage content strategy and final public IA decision. |
| IFU-013 | Accessibility | Forms use semantic labels, buttons, links, focusable controls, live status regions, accessible progress bars, and named Discovery search/filter/table controls; map/profile controls are reachable. | WCAG test report, keyboard walkthrough, contrast audit, mobile screenshots. |
| IFU-014 | SEO/routes | Clean redirects are configured for known WordPress post IDs and known sitemap legacy paths. App metadata, country canonical metadata, `sitemap.xml`, and `robots.txt` are generated from app config. The IFU logo is the selected OpenGraph/social image. `npm run review:smoke` verifies deployed public routes and auth guards. | Custom-domain DNS/SSL evidence for `internationalfarmunion.com` and `ifuplatform.com`, plus deployed redirect smoke tests. |

## Evidence Commands

```bash
npm run auth:audit
npm run roles:audit
npm run review:audit
DATABASE_URL='postgresql://user:pass@localhost:5432/ifu_platform?schema=public' npm run build
npm run review:smoke
npx eslint src/app/api/profile/route.ts src/app/profile/page.tsx src/app/layout.tsx src/app/sitemap.ts src/app/robots.ts src/app/country/[slug]/page.tsx src/components/country-intelligence-tabs.tsx src/components/profile-completion-form.tsx src/components/mini-geo-global-map.tsx src/components/discovery-center.tsx src/components/registration-form.tsx src/components/ifu-personal-command-center.tsx src/lib/site-url.ts
```

Use a real `DATABASE_URL` only when running migration, seed, or authenticated browser smoke tests.
