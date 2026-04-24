# Server runbook

## Minimum runbook items
- required secrets and env vars
- deploy command/path
- smoke-check after deploy
- rollback path
- backup/recovery ownership

## Smoke-check after deploy
- frontend loads
- backend health/API reachable
- login works
- SDS list loads
- chemical product list loads

## Rollback baseline
- keep last known-good deployment package or image
- restore previous env if secrets changed
- rerun compose with prior artifact
