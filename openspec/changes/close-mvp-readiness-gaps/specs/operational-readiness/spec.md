## ADDED Requirements

### Requirement: The product SHALL meet a release-quality verification bar
ChemReg SHALL not be considered ready unless its critical workflows are covered by automated verification and deployment gates.

#### Scenario: Critical flows are tested before deploy
- **WHEN** code changes affect authentication, SDS, inventory, risk, or reporting flows
- **THEN** automated tests for those flows SHALL run in CI
- **AND** deployment SHALL not bypass failed required checks

#### Scenario: Release documentation supports controlled rollout
- **WHEN** the team prepares a staging or production deployment
- **THEN** the repo SHALL provide environment, secrets, migration, backup/recovery, and rollback guidance
- **AND** operators SHALL be able to rehearse deployment on a clean environment

### Requirement: The product SHALL expose only release-ready critical paths
Placeholder or seeded demo-only experiences SHALL not remain in critical product routes presented as completed functionality.

#### Scenario: Critical routes use live data or are explicitly deferred
- **WHEN** a user opens a core ChemReg workflow route
- **THEN** the route SHALL either use the real backend workflow
- **OR** be clearly marked as not in MVP scope rather than implying finished behavior
