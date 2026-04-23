## ADDED Requirements

### Requirement: The system SHALL enforce real session and authorization behavior
ChemReg SHALL use a real authenticated session model and SHALL enforce authorization in backend-protected operations as well as frontend navigation.

#### Scenario: Frontend stores real auth state instead of demo markers
- **WHEN** a user signs in successfully
- **THEN** the frontend SHALL store and use the actual access/session credentials required for API authorization
- **AND** it SHALL not treat a timestamp or demo marker as the production auth token model

#### Scenario: Unauthorized access is blocked at API level
- **WHEN** a user calls a protected endpoint without the required role or scope
- **THEN** the backend SHALL reject the request
- **AND** direct object access by guessed IDs SHALL not bypass tenant, site, or role rules

### Requirement: The system SHALL support MVP role-scoped access
ChemReg SHALL support the MVP role matrix needed for chemical management workflows.

#### Scenario: Site-scoped users cannot access unrelated site data
- **WHEN** a site manager or worker requests inventory, SDS, or risk objects outside their allowed site scope
- **THEN** the system SHALL deny or hide that data
- **AND** the response SHALL follow a consistent authorization contract
