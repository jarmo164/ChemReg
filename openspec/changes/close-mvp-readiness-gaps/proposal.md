## Why

ChemReg has a strong product direction and a broad target-state document, but the current `test` branch is still much closer to a technical skeleton than a release-ready chemical management product.

Right now the biggest gaps are structural, not cosmetic:

1. **Architecture drift**: the large development document describes a NestJS-based platform, while the live repo is built on Spring Boot + React. The team needs one real source of truth before more feature work lands.
2. **Core workflow incompleteness**: the documented MVP expects SDS, chemical registry, inventory, risk approvals, labels, and reports. In the repo, only a thin auth/user/chemical API slice is real; several frontend modules are still placeholder or demo-driven.
3. **Release-readiness weakness**: test coverage, CI quality gates, security hardening, object storage/search/background jobs, and deployment confidence are not yet at the level needed for a trustworthy pilot or production rollout.

If these gaps remain open, the product may look promising in a walkthrough but will stay fragile in real customer use.

## What Changes

- Reframe ChemReg around a **pilot-ready MVP** instead of an all-at-once enterprise vision.
- Align the technical source of truth to the **actual stack in the repo**: Spring Boot backend, React frontend, PostgreSQL, Docker-based local/dev workflow.
- Define the minimum complete product flows required before ChemReg can be called ready:
  - authentication + authorization
  - SDS ingestion and retrieval
  - chemical product registry
  - inventory and location management
  - risk assessment workflow
  - labeling/reporting basics
- Add the missing operational bar: tests, CI gates, environment strategy, observability, backup/recovery, and deployment verification.

## Recommended Path

### Phase 1 — Lock the truth and finish the platform foundation
- decide that the repo architecture, not the old aspirational doc, is the implementation source of truth
- close auth/session/RBAC gaps
- settle environment contracts, migrations, storage integrations, and API conventions

### Phase 2 — Finish the chemical management happy path
- make SDS, product registry, and inventory flows fully real end-to-end
- remove placeholder/demo-only UI from critical paths
- ensure labels and reports are generated from real persisted data

### Phase 3 — Finish controlled workflows and readiness
- implement risk assessment + approval flow
- add auditability, notifications, and role-scoped access
- raise the quality bar with test automation, CI enforcement, deployment checks, and runbook-level readiness

## Capabilities

### Modified Capabilities
- `platform-foundation`
- `authentication-and-access`
- `sds-and-chemical-registry`
- `risk-and-workflow`
- `operational-readiness`

## Impact

- product scope is narrowed from “full enterprise platform” to “shippable pilot-ready MVP”
- architecture and documentation must be reconciled
- backend, frontend, infra, and CI all require coordinated work
- completion is defined by end-to-end working flows plus release-quality evidence, not by screens alone
