## ADDED Requirements

### Requirement: The system SHALL provide a real SDS lifecycle for MVP
ChemReg SHALL support persisted SDS document management suitable for pilot use.

#### Scenario: SDS upload creates a managed persisted record
- **WHEN** an authorized user uploads an SDS with required metadata
- **THEN** the backend SHALL persist the document metadata and file reference
- **AND** the SDS SHALL become retrievable through authenticated list/detail flows

#### Scenario: SDS version history is explicit
- **WHEN** a new SDS file version is uploaded for an existing document
- **THEN** the system SHALL preserve prior versions
- **AND** exactly one active version SHALL be clearly identified for downstream use

### Requirement: The system SHALL connect SDS, products, and inventory through live data
Critical chemical management views SHALL run from persisted relationships, not seeded demo-only UI state.

#### Scenario: Product detail supports downstream workflows
- **WHEN** a chemical product is created or updated
- **THEN** it SHALL carry the minimum metadata required for SDS linkage, labeling, inventory, and risk flows
- **AND** dependent views SHALL consume the saved record rather than hardcoded fixtures

#### Scenario: Inventory uses linked products and locations
- **WHEN** inventory records are created or viewed
- **THEN** each inventory item SHALL reference a real product and location context
- **AND** registry and inventory screens SHALL reflect the current stored state
