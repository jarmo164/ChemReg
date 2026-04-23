# ChemReg GitHub Issues Draft

Allolevad issue draftid on tuletatud failist `openspec/changes/close-mvp-readiness-gaps/tasks.md`.

Soovitus:
- tee **1 GitHub issue per section**
- kasuta pealkirja kujul nagu all
- kopeeri iga issue plokk eraldi GitHubi
- soovi korral lisa labelid nagu `mvp`, `backend`, `frontend`, `infra`, `security`, `docs`

---

## Issue 1

**Title**
Align source of truth, architecture docs, and MVP scope

**Suggested labels**
`docs`, `planning`, `mvp`

**Body**
### Summary
ChemReg documentation currently overstates implementation reality and still describes a different architecture direction than the live repo. We need one trustworthy source of truth before continuing feature delivery.

### Why this matters
The current development documentation describes a NestJS-oriented architecture, while the actual repo runs on Spring Boot + React. That mismatch creates planning drift, wrong assumptions, and fake progress.

### Scope
- rewrite the high-level architecture section so it matches the real Spring Boot + React stack
- split the broad development document into **pilot-ready MVP**, **post-MVP**, and **enterprise-only** scope
- decide which documented integrations are mandatory now vs deferred: S3/MinIO, search, notifications, SSO, MFA, compliance imports
- define the release bar for “ready”: required flows, required tests, required infra, required documentation

### Acceptance criteria
- primary architecture documentation matches the live codebase
- MVP scope is clearly separated from post-MVP and enterprise-only scope
- required vs deferred integrations are explicitly decided
- the team has a written release bar for calling ChemReg “ready”

### Checklist
- [ ] Rewrite the high-level architecture section to match Spring Boot + React
- [ ] Split the development document into MVP / post-MVP / enterprise-only scope
- [ ] Decide which integrations are mandatory now vs deferred
- [ ] Define the release bar for readiness

---

## Issue 2

**Title**
Implement production-ready authentication and access control

**Suggested labels**
`security`, `backend`, `frontend`, `mvp`

**Body**
### Summary
ChemReg needs a real authentication and authorization model before it can be considered pilot-ready.

### Why this matters
The frontend currently uses a simplified session approach, and authorization must be enforced at API level, not only in UI routing.

### Scope
- replace the current simplified frontend session model with real access/refresh token handling
- enforce authorization consistently in backend controllers/services, not only in UI routing
- implement role matrix coverage for Org Admin, EHS Manager, Site Manager, User, Auditor, and Supplier where in MVP scope
- define tenant/site/location scoping rules and test them against direct-object access attempts

### Acceptance criteria
- login, refresh, logout, and session recovery work reliably
- protected endpoints enforce authorization server-side
- role and scope rules are documented and implemented for MVP roles
- direct-object-access attempts outside allowed scope are blocked and tested

### Checklist
- [ ] Replace the frontend session model with real access/refresh token handling
- [ ] Enforce authorization consistently in backend controllers/services
- [ ] Implement role matrix coverage for MVP roles
- [ ] Define tenant/site/location scoping rules and test them

---

## Issue 3

**Title**
Finish SDS and chemical registry core workflows

**Suggested labels**
`backend`, `frontend`, `mvp`, `sds`

**Body**
### Summary
ChemReg’s SDS and chemical registry flows need to move from demo/partial state into real persisted end-to-end workflows.

### Why this matters
SDS and chemical registry are core product paths. Right now the SDS frontend still contains seeded/demo behavior and the product model is too thin for downstream workflows.

### Scope
- implement SDS document entities, file storage contract, upload flow, and version management
- expose live SDS APIs for list/detail/create/update/upload/download/preview
- replace seeded/demo SDS frontend behavior with live API-backed flows and proper empty/error/loading states
- expand chemical product management to include the metadata needed by SDS, labels, inventory, and risk workflows
- define the minimum searchable/filterable fields needed for MVP even if advanced full-text search is deferred

### Acceptance criteria
- users can create, upload, retrieve, update, preview, and download SDS records from live persisted data
- SDS versioning is explicit and one active version is defined
- the SDS UI no longer depends on seeded-only critical-path behavior
- chemical product records include the minimum metadata needed for downstream MVP workflows
- MVP search/filter scope is explicitly defined

### Checklist
- [ ] Implement SDS entities, storage contract, upload flow, and version management
- [ ] Expose live SDS APIs
- [ ] Replace seeded/demo SDS frontend behavior with live API-backed flows
- [ ] Expand chemical product management metadata
- [ ] Define MVP searchable/filterable fields

---

## Issue 4

**Title**
Implement inventory and location workflows

**Suggested labels**
`backend`, `frontend`, `inventory`, `mvp`

**Body**
### Summary
ChemReg needs real location-aware inventory workflows instead of placeholder screens.

### Why this matters
Without site, location, and inventory flows, ChemReg is not yet a practical chemical management system.

### Scope
- implement site and hierarchical location management
- implement inventory item CRUD, status handling, quantity/unit fields, and product linkage
- deliver a real register/inventory UI instead of placeholder pages
- implement manifest/export basics for the MVP reporting path
- decide whether QR/barcode support is MVP-critical or should be post-MVP

### Acceptance criteria
- site and hierarchical location data can be created and managed
- inventory items can be created, updated, listed, and linked to products/locations
- inventory UI is API-backed and usable
- MVP manifest/export path works
- QR/barcode support is clearly classified as MVP or deferred

### Checklist
- [ ] Implement site and hierarchical location management
- [ ] Implement inventory item CRUD and linkage
- [ ] Deliver a real register/inventory UI
- [ ] Implement manifest/export basics
- [ ] Decide whether QR/barcode support is MVP-critical or deferred

---

## Issue 5

**Title**
Implement risk workflow, approvals, and audit trail

**Suggested labels**
`backend`, `frontend`, `workflow`, `mvp`

**Body**
### Summary
Risk assessment and approval flow is one of ChemReg’s main product promises and needs to be fully implemented for MVP readiness.

### Why this matters
The current risk area is not yet a real product flow. Approval logic and auditability are essential for safety/compliance software.

### Scope
- implement risk assessment domain model, CRUD APIs, and primary UI workflow
- implement submit / approve / reject lifecycle with role-based permissions
- generate a printable/exportable risk report from persisted assessment data
- add audit logging for authentication events, SDS changes, inventory mutations, and approvals
- add notification triggers for approval and document lifecycle events

### Acceptance criteria
- users can create and manage risk assessments from persisted data
- risk assessments move through controlled approval states with role-based permissions
- approved risk data can be exported in printable form
- critical events produce audit records
- approval/document lifecycle notifications are triggered for the right events

### Checklist
- [ ] Implement risk assessment domain model, CRUD APIs, and UI workflow
- [ ] Implement submit / approve / reject lifecycle
- [ ] Generate printable/exportable risk report
- [ ] Add audit logging for critical events
- [ ] Add notification triggers for approval and document lifecycle events

---

## Issue 6

**Title**
Implement labels, reports, and document output basics

**Suggested labels**
`backend`, `reports`, `labels`, `mvp`

**Body**
### Summary
ChemReg needs at least one real label flow and the minimum required report outputs to support practical MVP use.

### Why this matters
A chemical management app without usable output artifacts stays half-finished, even if the data model exists.

### Scope
- implement at least one production-usable label template flow backed by real product/SDS/inventory data
- generate PDF outputs for labels and core reports from backend services
- define which reports are truly required for MVP: inventory export, SDS coverage, risk register, manifest

### Acceptance criteria
- at least one label template works against real application data
- label and report PDFs are generated from backend services
- required MVP report set is explicitly decided and documented

### Checklist
- [ ] Implement at least one production-usable label template flow
- [ ] Generate PDF outputs for labels and core reports
- [ ] Define which reports are truly required for MVP

---

## Issue 7

**Title**
Raise quality gates and release readiness to pilot level

**Suggested labels**
`qa`, `ci`, `infra`, `mvp`

**Body**
### Summary
ChemReg needs meaningful automated verification and deploy readiness before it can be called pilot-ready.

### Why this matters
Current test and CI posture is too weak for confident delivery. Broken auth, SDS, or workflow behavior must be caught before deploy.

### Scope
- add backend unit + integration tests for auth, authorization, SDS, inventory, and risk workflows
- add frontend tests for login/session handling and critical module happy paths
- add at least one E2E suite for login -> SDS/product -> inventory -> risk happy path
- update CI so tests and builds are mandatory gates before deploy
- add environment setup, secrets, backup/recovery, and deployment/runbook documentation
- verify staging or production-like deployment with a clean environment rehearsal

### Acceptance criteria
- backend critical flows are covered by automated tests
- frontend critical happy paths are covered by automated tests
- at least one E2E happy path runs successfully
- CI blocks deploy on failed required checks
- deployment/runbook/backup basics are documented
- deployment is rehearsed in a clean environment

### Checklist
- [ ] Add backend unit + integration tests for critical workflows
- [ ] Add frontend tests for critical happy paths
- [ ] Add at least one E2E suite
- [ ] Update CI so tests/builds are mandatory gates before deploy
- [ ] Add environment, secrets, backup/recovery, and runbook documentation
- [ ] Verify deployment in a clean environment rehearsal

---

## Issue 8

**Title**
Complete readiness verification and documentation reconciliation

**Suggested labels**
`docs`, `qa`, `release`

**Body**
### Summary
Before closing the MVP readiness change, ChemReg needs one final verification pass to confirm that docs, code, and validation results all align.

### Why this matters
Without a final reconciliation step, the team can easily claim readiness while documentation, tests, or specs still disagree.

### Scope
- reconcile README, wiki, and development documentation so they tell the same truth
- run build, tests, and spec validation before marking the readiness change complete

### Acceptance criteria
- README, wiki, and development documentation are aligned
- required build/tests/spec validation have been run successfully
- readiness change can be closed with evidence

### Checklist
- [ ] Reconcile README, wiki, and development documentation
- [ ] Run build, tests, and spec validation before marking the change complete

---

## Optional label mapping

- `docs` — architecture/docs/source-of-truth work
- `planning` — scope, prioritization, release bar
- `security` — auth/RBAC/authorization
- `backend` — Spring Boot / API / DB work
- `frontend` — React UI work
- `inventory` — register / locations / stock flow
- `sds` — safety data sheet workflows
- `workflow` — approval / business process logic
- `reports` — exports / reporting
- `labels` — label generation
- `qa` — testing and verification
- `ci` — pipeline gating
- `infra` — environments / deployment / backup / runbooks
- `release` — final readiness validation
