# MVP scope split

## Pilot-ready MVP
Must be real before calling ChemReg ready:
- auth + refresh-token session handling
- backend RBAC + tenant-scoped access enforcement
- SDS document list/detail/create/update against persisted data
- chemical product CRUD with SDS linkage-ready schema
- site/location/inventory core workflow
- risk assessment draft/review/approve flow
- at least one production-usable report or label output
- CI gates for required tests/builds
- deploy/runbook + env/secrets + backup basics documented

## Post-MVP
- richer inventory automation
- broader reporting set
- notifications beyond essential workflow triggers
- better search UX and indexing improvements
- stronger audit exploration UI

## Enterprise-only / deferred by default
- SSO/SAML/OIDC breadth
- MFA enforcement
- external compliance imports
- advanced full-text search stack
- object storage hardening beyond MVP contract
- multi-channel notification system

## Integration decisions for now
Mandatory now:
- Docker-based local/dev path
- PostgreSQL + Flyway
- JWT access/refresh token auth

Deferred until justified by real pilot need:
- S3/MinIO as hard dependency
- OpenSearch/Elasticsearch class search infra
- notification broker/work queue platform
- SSO/MFA breadth
- compliance import connectors

## MVP searchable/filterable fields
Even before advanced search, MVP should support filtering on:
- SDS: product name, supplier, status, revision date, expiry date, CAS preview from composition section
- Chemical products: name, CAS, EC number, physical state, restricted flag, linked SDS
- Inventory: site, location, product, status, expiry date, barcode/QR when present

## Required MVP reports
- inventory export
- SDS coverage report
- risk register export
- manifest/export basic view

## QR/barcode decision
QR/barcode is useful but not MVP-blocking unless a specific pilot explicitly requires scanner-based receiving or labeling.
