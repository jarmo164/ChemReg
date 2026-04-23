## ADDED Requirements

### Requirement: The product SHALL define one implementation source of truth
ChemReg SHALL maintain one authoritative implementation description that matches the live repo architecture, MVP boundary, and deployment model.

#### Scenario: Architecture description matches the codebase
- **WHEN** a contributor reads the primary product or technical documentation
- **THEN** the documented backend, frontend, persistence, and deployment stack SHALL match the code actually used in the repository
- **AND** the documentation SHALL not describe a different framework stack as if it were already implemented

#### Scenario: MVP scope is explicitly separated from deferred scope
- **WHEN** a feature appears in product documentation
- **THEN** it SHALL be marked as MVP, deferred post-MVP, or enterprise-only
- **AND** delivery planning SHALL not treat all aspirational features as immediate release requirements
