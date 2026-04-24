# Testing status

## Current minimum quality bar
- backend unit/integration tests for auth, authz, SDS, inventory, risk workflows
- frontend tests for session handling and core happy paths
- at least one E2E flow for login -> SDS/product -> inventory -> risk
- CI must fail before deploy if required checks fail

## What is covered now
- backend unit tests exist for user, chemical product, and SDS tenant-scope logic
- frontend session helper and API refresh handling tests exist
- frontend production build passes

## Known gaps
- backend integration tests still sparse
- no E2E suite yet
- inventory/risk workflow tests still missing
