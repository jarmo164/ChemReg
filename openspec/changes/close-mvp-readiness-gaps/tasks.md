## 1. Source of truth and scope alignment
- [x] 1.1 Rewrite the high-level architecture section so it matches the real Spring Boot + React stack.
- [x] 1.2 Split the broad development document into **pilot-ready MVP**, **post-MVP**, and **enterprise-only** scope.
- [x] 1.3 Decide which currently documented integrations are mandatory now vs deferred: S3/MinIO, search, notifications, SSO, MFA, compliance imports.
- [x] 1.4 Define the release bar for “ready”: required flows, required tests, required infra, required documentation.

## 2. Authentication and access control
- [x] 2.1 Replace the current simplified frontend session model with real access/refresh token handling.
- [x] 2.2 Enforce authorization consistently in backend controllers/services, not only in UI routing.
- [ ] 2.3 Implement role matrix coverage for Org Admin, EHS Manager, Site Manager, User, Auditor, and Supplier where in MVP scope.
- [x] 2.4 Define tenant/site/location scoping rules and test them against direct-object access attempts.

## 3. SDS and chemical registry core
- [x] 3.1 Implement SDS document entities, file storage contract, upload flow, and version management.
- [x] 3.2 Expose live SDS APIs for list/detail/create/update/upload/download/preview.
- [x] 3.3 Replace seeded/demo SDS frontend behavior with live API-backed flows and proper empty/error/loading states.
- [x] 3.4 Expand chemical product management to include the metadata needed by SDS, labels, inventory, and risk workflows.
- [x] 3.5 Define the minimum searchable/filterable fields needed for MVP even if advanced full-text search is deferred.

## 4. Inventory and location workflows
- [x] 4.1 Implement site and hierarchical location management.
- [x] 4.2 Implement inventory item CRUD, status handling, quantity/unit fields, and product linkage.
- [x] 4.3 Deliver a real register/inventory UI instead of placeholder pages.
- [ ] 4.4 Implement manifest/export basics for the MVP reporting path.
- [ ] 4.5 Decide whether QR/barcode support is MVP-critical or should be post-MVP.

## 5. Risk, approvals, and audit trail
- [ ] 5.1 Implement risk assessment domain model, CRUD APIs, and primary UI workflow.
- [ ] 5.2 Implement submit / approve / reject lifecycle with role-based permissions.
- [ ] 5.3 Generate a printable/exportable risk report from persisted assessment data.
- [ ] 5.4 Add audit logging for authentication events, SDS changes, inventory mutations, and approvals.
- [ ] 5.5 Add notification triggers for approval and document lifecycle events.

## 6. Labels, reports, and document outputs
- [ ] 6.1 Implement at least one production-usable label template flow backed by real product/SDS/inventory data.
- [ ] 6.2 Generate PDF outputs for labels and core reports from backend services.
- [x] 6.3 Define which reports are truly required for MVP: inventory export, SDS coverage, risk register, manifest.

## 7. Quality and release readiness
- [ ] 7.1 Add backend unit + integration tests for auth, authorization, SDS, inventory, and risk workflows.
- [x] 7.2 Add frontend tests for login/session handling and critical module happy paths.
- [ ] 7.3 Add at least one E2E suite for login -> SDS/product -> inventory -> risk happy path.
- [x] 7.4 Update CI so tests and builds are mandatory gates before deploy.
- [x] 7.5 Add environment setup, secrets, backup/recovery, and deployment/runbook documentation.
- [ ] 7.6 Verify staging or production-like deployment with a clean environment rehearsal.

## 8. Verification
- [x] 8.1 Reconcile README, wiki, and development documentation so they tell the same truth.
- [ ] 8.2 Run build, tests, and spec validation before marking the readiness change complete.
