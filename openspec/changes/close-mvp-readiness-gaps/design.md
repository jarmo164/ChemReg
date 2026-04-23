## Context

`KEMIKAALIHALDUS_ARENDUSDOKUMENTATSIOON.md` is useful as a product ambition document, but it currently overstates implementation reality.

Observed repo reality on the `test` branch:

- backend stack is **Java 21 + Spring Boot 4**, not NestJS
- frontend stack is **React + MUI**
- live backend controllers are currently limited to auth, users, and chemical products
- the SDS UI contains substantial seeded/demo data, while other major modules are placeholder-level
- README itself says the project is still a technical base with limited real MVP flow coverage

Because of that, readiness cannot mean “implement every enterprise idea in the document.” It needs a sharper definition.

## Decisions

### Decision: Target a pilot-ready MVP, not full enterprise parity
The product document contains enterprise-grade scope: SSO/SAML/OIDC breadth, multi-tenant isolation, OpenSearch, S3, BullMQ-style workers, compliance engines, advanced reporting, and mobile inventory. Trying to finish all of that at once will turn ChemReg into an endless half-built program.

Readiness for this change means:
- a coherent MVP scope
- real persisted data flows
- enforceable authorization
- production-safe deploy/test basics
- enough operational trust to onboard an early customer or pilot

### Decision: Treat the repo stack as canonical
The repo is already committed to Spring Boot + React. The old document should be adapted to the real stack, not vice versa, unless the team explicitly decides to restart the backend architecture.

This removes fake certainty and prevents planning against the wrong platform.

### Decision: Define readiness around end-to-end workflows
A module is not “done” because a route exists or a table renders. A module is ready only when its primary user journey works against persisted data, authorization rules are enforced, errors are handled, and the flow is test-covered at the right level.

### Decision: Sequence by dependency, not by document chapter order
The correct order is:
1. foundation
2. SDS/product/inventory core
3. risk/workflow/reporting layer
4. operational hardening

That order follows actual system coupling and de-risks delivery.

## Plan

### Stage 1 — Foundation and source-of-truth alignment
- reconcile the big development document with the real Spring Boot/React architecture
- define the exact MVP boundary
- finish auth/session/token model and route/API authorization rules
- standardize error responses, DTO validation, migrations, and environment config
- choose the real integration plan for file storage, document preview, and async/background processing

### Stage 2 — SDS, product, and inventory core
- implement a real SDS backend surface: document records, file upload, versioning, retrieval, preview/download policy
- connect frontend SDS workflows to live APIs and remove seeded-only behavior from critical paths
- complete chemical product CRUD beyond a thin base implementation
- implement sites/locations/inventory item management and location-scoped views
- generate label/report outputs from persisted records, not mock state

### Stage 3 — Risk, approvals, and auditability
- implement risk assessment domain entities and API surface
- support submission, review, approval/rejection, and export flow
- add audit logging for material actions
- add notifications for approval and document-change events

### Stage 4 — Operational readiness
- add automated unit/integration/E2E coverage for critical flows
- make CI fail on tests/build/lint quality gates instead of deploying around them
- define backup/recovery, environment promotion, secrets handling, and deployment verification
- add runbook-grade documentation for local setup, staging, production deploy, and incident recovery

## Risks / Trade-offs

- **Biggest risk:** continuing to build against the oversized doc will create more fake progress than usable product.
- **Trade-off:** narrowing to a pilot-ready MVP means some enterprise ideas must be explicitly deferred.
- **Technical risk:** auth/session work and SDS storage decisions will affect nearly every downstream module.
- **Delivery risk:** if CI keeps skipping meaningful validation, regressions will stack faster than features.

## Success Criteria

ChemReg is considered ready for this change when:

- the documented MVP boundary matches the actual codebase and roadmap
- auth and RBAC are enforced consistently across UI and API
- SDS, chemical registry, and inventory have real end-to-end persisted workflows
- risk assessment and approval flow works for the defined MVP path
- release-critical tests and CI gates exist and are passing
- deployment/runbook/backup basics are documented well enough for controlled rollout
