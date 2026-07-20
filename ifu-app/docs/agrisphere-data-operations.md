# AgriSphere Data Operations

This document defines the Sprint 1.5 ownership, validation, refresh, and recovery contract for AgriSphere discovery data.

## Sources Of Truth

- `prisma/schema.prisma` owns the persistent relational contract.
- `prisma/migrations/` owns repeatable database changes. Production schema changes must use `npm run db:deploy`; manual production DDL is not supported.
- `src/lib/agrisphere-data.ts` owns the representative non-production corpus and read-service fallback.
- `prisma/seed.ts` owns repeatable database seeding.
- The configured OpenSearch index is derived data and can be recreated with `npm run agrisphere:index`.
- Redis values are disposable caches and must never be treated as records of truth.

## Responsibility Model

- The IFU product owner approves public facts, official metrics, and changes to discovery categories.
- The designated data steward reviews country, crop, organization, treaty, producer, and opportunity content before release.
- The application maintainer changes schema, migrations, validation rules, seed behavior, and search mappings.
- The release operator provisions Aurora PostgreSQL, OpenSearch, and Redis; applies migrations; runs seeds and indexing; and captures deployment evidence.

Named owners may change, but every production release must assign a person to each responsibility above.

## Validation Rules

Run these checks before seeding or indexing:

```bash
npm run agrisphere:audit
npm run test:agrisphere
```

The audit enforces:

- unique stable identifiers and slugs;
- ISO alpha-2 country codes;
- valid continent and country relationships;
- valid latitude and longitude ranges;
- all five activity-tier definitions;
- exactly seven populated discovery search categories;
- valid opportunity, producer, and event relationships;
- valid event date ranges; and
- searchable content for countries and active opportunities.

Warnings identify incomplete representative coverage without blocking local development. Errors block seeding, indexing, and release.

## Refresh Procedure

1. Update the representative corpus or approved import source.
2. Run `npm run agrisphere:audit` and `npm run test:agrisphere`.
3. Create a Prisma migration for schema changes and review its SQL.
4. Apply migrations to a non-production database with `npm run db:deploy`.
5. Run `npm run db:seed` twice and confirm the second run does not create duplicates.
6. Run `npm run agrisphere:index` to replace OpenSearch documents.
7. Allow Redis keys to expire or flush only the `ifu:agrisphere:` namespace through an approved operational procedure.
8. Run the local and deployed smoke suites and capture `/v1/health` output.

## Dependency Failure Behavior

- PostgreSQL read failures fall back to the representative corpus for read-only discovery endpoints.
- OpenSearch failures fall back to ranked PostgreSQL search, then to the representative search corpus.
- Redis failures fall back to the process-local TTL cache.
- Opportunity saves and personalized feeds require PostgreSQL and do not write to fallback data.

## Required Environment Configuration

- `DATABASE_URL`
- `OPENSEARCH_ENDPOINT`
- `OPENSEARCH_INDEX`
- `OPENSEARCH_REGION` and `OPENSEARCH_SERVICE` for AWS SigV4, or `OPENSEARCH_USERNAME` and `OPENSEARCH_PASSWORD` for basic authentication
- `REDIS_URL`

Use `OPENSEARCH_SERVICE=aoss` for Amazon OpenSearch Serverless and `es` for a managed domain.

## Release Evidence

Production sign-off requires:

- a successful migration and repeatable seed run;
- a successful OpenSearch indexing run;
- `/v1/health` reporting PostgreSQL, OpenSearch, and Redis as available;
- database and search latency results against the agreed thresholds; and
- a deployed smoke test with zero failures.
