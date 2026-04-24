# Deployment

## CI gate expectation
Deploy must only run after:
- backend build + tests
- frontend tests
- frontend production build

## Current delivery shape
GitHub Actions workflow packages backend + frontend and deploys over SSH to the target host.

## Required environment/secrets
- database credentials
- JWT issuer/secret/expiry settings
- frontend API base URL
- SSH deploy credentials

## Clean-environment rehearsal
Before calling ChemReg ready, rehearse on a clean environment:
1. fresh database
2. run migrations
3. run backend/frontend build
4. log in with seeded or created user
5. verify SDS/product happy path
