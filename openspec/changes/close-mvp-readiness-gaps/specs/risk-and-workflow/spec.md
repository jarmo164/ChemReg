## ADDED Requirements

### Requirement: The system SHALL support an MVP risk assessment approval workflow
ChemReg SHALL provide a persisted risk assessment flow covering creation, review, approval decision, and export.

#### Scenario: Risk assessment moves through controlled states
- **WHEN** a user submits a draft risk assessment for review
- **THEN** the assessment SHALL transition through defined states such as draft, under review, approved, or rejected/returned
- **AND** only authorized roles SHALL be allowed to perform each transition

#### Scenario: Approved risk assessment is exportable
- **WHEN** a risk assessment reaches approved state
- **THEN** the system SHALL generate a printable/exportable output from persisted assessment data
- **AND** the exported content SHALL reflect the approved record version

### Requirement: Material workflow actions SHALL be auditable
Important changes in ChemReg SHALL produce audit records suitable for operational traceability.

#### Scenario: Approval and mutation events are logged
- **WHEN** a user changes an SDS, inventory item, or risk assessment state
- **THEN** the system SHALL record who performed the action, when it happened, and what object was affected
- **AND** these records SHALL remain available for review by authorized users
