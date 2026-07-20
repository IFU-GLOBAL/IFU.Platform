<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Workspace Orientation

The active IFU repository is `/Users/jrl/Code/IFU.Platform`, with app source in `/Users/jrl/Code/IFU.Platform/ifu-app`. Project documents and developer-package files remain in `/Users/jrl/Documents/ifu master` unless explicitly moved.

## Dashboard Ecosystem Tabs

The IFU ecosystems belong in the authenticated `/dashboard` hub as left-panel tabs, not as standalone public pages. `src/lib/dashboard-model.ts` is the source of truth for the tab seed order: `Dashboard Home`, then the ten ecosystem tabs (`AgriSphere`, `AgriNexus`, `AgriAcademie`, `AgriExchange`, `AgriCapital`, `AgriFunds`, `AgriFinance`, `AgriShield`, `AgriCentral`, `Data Engine`), followed by workspace and workflow tabs.

`AgriSphere` is the implemented ecosystem surface and renders its content in the dashboard center pane through `src/components/agrisphere-discovery-hub.tsx`. The other ecosystem tabs are intentional placeholders in `src/components/ifu-personal-command-center.tsx`; keep them as center-pane dashboard sections until their real workflows are built. `/agrisphere` is only an authenticated entry point that redirects into `/dashboard?section=agrisphere-dashboard`, so do not add public Join IFU or registration CTAs to AgriSphere content.

Back controls inside authenticated product surfaces should return to the previous in-app page when possible, with `/dashboard` as the hub fallback. Use `src/components/return-link.tsx` for logged-in back links instead of hard-coding a public destination or a fixed dashboard URL.

## AgriSphere Data Platform

Sprint 1.5 AgriSphere data contracts are modeled in Prisma and seeded from `src/lib/agrisphere-data.ts`. Read APIs should go through `src/lib/agrisphere-repository.ts`, which prefers the Prisma tables and uses the static corpus as a fallback for unseeded or unavailable local data services. Opportunity save/feed behavior requires persistence and should not be implemented by writing directly to the static corpus.
