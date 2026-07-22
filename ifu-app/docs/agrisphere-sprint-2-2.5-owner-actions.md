# AgriSphere Sprint 2 And 2.5 Owner Actions

This checklist separates the implementation now present in the repository from decisions and AWS work that cannot be completed safely from a local checkout.

## Ready In The Repository

- Authenticated recommendation feed ranked with TF-IDF and cosine similarity.
- Role, category, country, region, crop, interest, and saved-opportunity signals.
- Active-only top-20 feed with a non-empty direct-ranking cold-start fallback.
- Save/unsave controls in the authenticated AgriSphere dashboard.
- Deterministic six-persona K-Means refresh using real profiles only, protected by an internal job secret.
- Strict search query/category/limit validation.
- Redis-backed per-member map/search request windows with process fallback.
- Non-blocking suspicious-velocity and impossible-travel evaluation.
- Privacy-minimized append-only security events with confidence, severity, triggers, correlation IDs, review state, and 90-day expiry timestamps.
- Dependency-free Isolation Forest implementation and tests, ready for real baseline traffic once its training source is approved.

## Deployment Instructions

1. Apply `prisma/migrations/20260722120000_agrisphere_sprint_2_5_security_audit` to a non-production database and capture the migration output.
2. Configure `INTERNAL_JOB_SECRET` and `AGRISPHERE_AUDIT_HASH_SECRET` as separate high-entropy secrets. Do not reuse Cognito credentials or store either value in the repository.
3. Configure/confirm the four map/search rate and alert thresholds from `.env.example`.
4. Confirm Redis is available; otherwise limits are per application process and are not sufficient for multi-instance production enforcement.
5. Once at least six real profiles exist, invoke `/v1/internal/dashboard-feed/refresh-clusters` with its bearer secret and confirm `clusterCount: 6`.
6. Restrict `/v1/internal/*` at the private-origin/VPC layer before adding the hourly EventBridge invocation.
7. Run `npm run test:agrisphere`, `npm run review:audit`, the normal build, and deployed smoke tests.
8. Exercise save/unsave with two materially different profiles and capture before/after feed ordering for ranking acceptance.

## Decisions Needed From You

1. **Role mapping:** Should the nine AgriSphere roles be a new coarse role field, or should the existing IFU role catalog map into those nine personas? The code currently uses the member's existing primary IFU role/category as ranking text and does not invent a second role authority.
2. **Partner boost:** Approve a numeric partner/featured-opportunity boost, or confirm that partner status remains only a ranking term. No undisclosed paid-placement boost has been added.
3. **Rate limits:** Approve or replace the provisional per-member defaults: search alert/limit `60/120` per minute and map alert/limit `120/240` per minute.
4. **Audit destination:** The migration provides a durable PostgreSQL audit foundation. Should production dual-write/deliver these records to the planned DynamoDB table, or should PostgreSQL remain the outbox and DynamoDB be deferred?
5. **Retention:** Confirm the documented 90-day security-event retention and who is authorized to acknowledge, dismiss, or escalate events.
6. **AgriShield contract:** Provide the consumer format/queue or approve the current event fields as the initial internal contract. An admin query endpoint is intentionally not public until its role policy is decided.
7. **Isolation Forest training:** Identify the approved normal-traffic dataset and minimum sample size. The model is implemented and tested, but it is not trained on fabricated traffic or wired to make production judgments without a real baseline.
8. **Interaction signals:** Confirm whether opportunity views and map-country selections, in addition to saves, may be retained as personalization signals and for how long.

## External Work Still Required

- Real Aurora migration/seed and production-like query evidence.
- OpenSearch indexing and Redis availability evidence.
- EventBridge/private invoker setup for hourly persona refresh and eventual six-hour anomaly retraining.
- DynamoDB and AgriShield delivery, if selected.
- Admin authorization policy and UI for security-event review.
- Production threshold tuning from representative traffic and false-positive review.
