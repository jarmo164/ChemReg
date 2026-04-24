# Technical overview

## Canonical implementation stack
- Frontend: React 19 + React Router 7 + MUI 7
- Backend: Java 21 + Spring Boot 4 (WebMVC, Validation, JPA)
- Database: PostgreSQL 17
- Schema management: Flyway
- API docs: Springdoc OpenAPI / Swagger UI
- Local/dev orchestration: Docker Compose

## Architecture
ChemReg töötab klassikalise SPA + REST + Postgres kihistusena:
1. React SPA haldab route'e, session state'i ja API kutsed.
2. Spring Boot teenus teeb valideerimise, autoriseerimise ja domeeniloogika.
3. PostgreSQL salvestab tenant-scoped andmed.

## What is real today
- auth login/refresh/logout API olemas
- frontend access/refresh token session handling olemas
- user CRUD baas olemas
- chemical product CRUD baas olemas
- SDS list/detail/create/update live API slice on ehitamisel

## What is not yet complete
- SDS file upload/download/preview/version management
- inventory/location end-to-end workflow
- risk assessment approval lifecycle
- PDF/report generation
- E2E suite
