# ChemReg

ChemReg on kemikaaliohutuse ja vastavuse halduse veebirakendus. Fookus on tuua SDS-id, kemikaaliregister, inventuur ja seotud operatiivsed töövood ühte süsteemi, et organisatsioon saaks kemikaaliandmeid hallata vähem Exceli ja vähem juhuse najal.

Praegune `test` haru ei ole enam ainult karkass — siin on mitu päris MVP voogu juba live API peal, aga kogu pilot-ready latt ei ole veel täis.

## Mis on päriselt olemas

- login + access/refresh token sessioonimudel
- backend RBAC ja tenant-scoped ligipääs põhivoodudes
- chemical product CRUD koos downstream-metaandmetega
- SDS document list/detail/create/update
- SDS failide upload / preview / download
- SDS PDF assistive extraction tekstipõhiste PDF-ide jaoks
- mini-SDS editor, mis saab extraction drafti eeltäiteks
- GPV A4 chemical card preview/generation frontendis
- site + hierarchical location CRUD
- inventory item CRUD ja live inventory register
- Docker Compose lokaalne jooksutamine
- GitHub Actions deploy pipeline

## Mis on veel pooleli

- risk assessment päris approval lifecycle
- vähemalt üks backendist genereeritav ametlik PDF/report flow
- tugevam integration + E2E kate
- scanned PDF / OCR tugi SDS ingestis
- manifest/export baas MVP reporting pathis

## Tehnoloogiavirn

| Kiht | Tehnoloogia |
|------|-------------|
| Frontend | React 19, React Router 7, MUI 7 |
| Backend | Java 21, Spring Boot 4.0.3, Spring Security, JPA, Validation |
| PDF parsing | Apache PDFBox 3 |
| Andmebaas | PostgreSQL 17 |
| Migratsioonid | Flyway |
| API docs | Springdoc OpenAPI / Swagger UI |
| Konteinerid | Docker Compose |

## Olulised töövood täna

### SDS import flow

1. kasutaja loob või avab SDS kirje
2. attachib originaalse SDS PDF-i
3. backend salvestab faili ja proovib sellest teksti välja võtta
4. parser kaardistab drafti mini-SDS vormi kujule
5. frontend täidab vormi automaatselt nii palju kui võimalik
6. kasutaja kontrollib, parandab ja salvestab lõpliku SDS-i
7. originaal PDF jääb süsteemi preview/download jaoks alles

### Extraction piirid

- toetatud: tekstipõhised PDF-id
- osaliselt toetatud: räpase layoutiga tekst-PDF-id
- mitte toetatud MVP-s: scanned/OCR-only PDF-id
- extraction ei ole autoritatiivne import; inimene peab tulemuse üle vaatama

### GPV chemical card

SDS vaates saab olemasolevast mini-SDS sisust genereerida ühe lehe A4 GPV kemikaalikaardi preview. See on praegu frontend-põhine print/export flow, mitte veel backendi ametlik dokumentide genereerimine.

## Rollid ja ligipääs

MVP rollireeglid on tsentraliseeritud backendis:

- `MVP_READ_ROLES`: `ORG_ADMIN`, `EHS_MANAGER`, `SITE_MANAGER`, `USER`, `AUDITOR`, `SUPPLIER`
- `MVP_MANAGE_ROLES`: `ORG_ADMIN`, `EHS_MANAGER`, `SITE_MANAGER`
- `SDS_AUTHOR_ROLES`: `ORG_ADMIN`, `EHS_MANAGER`, `SITE_MANAGER`, `USER`

See tähendab, et SDS create/update/upload/extract voog on nüüd teadlikult lubatud ka `USER` rollile.

## Käivitamine

### Variant A — Docker Compose

Praegune backendi Dockerfile eeldab, et jar on enne builditud hostis valmis.

```bash
cd backend
./gradlew bootJar
cd ..
docker compose up --build
```

Vaikimisi pordid:

- frontend: `http://localhost:3000`
- backend: `http://localhost:8080`
- postgres: `localhost:5432`

### Variant B — lokaalne ilma Dockerita

Eeldused:
- Java 21
- Node 20
- PostgreSQL

Backend:

```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=local'
```

Frontend:

```bash
cd frontend
npm install
npm start
```

## Keskkonnamuutujad

`docker-compose.yaml` loeb väärtused juurkausta `.env` failist.

Minimaalselt peavad olemas olema:

- `POSTGRES_VERSION`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DB_PORT`
- `BACKEND_PORT`
- `FRONTEND_PORT`
- `DB_CONTAINER_NAME`
- `BACKEND_CONTAINER_NAME`
- `FRONTEND_CONTAINER_NAME`
- `APP_JWT_ISSUER`
- `APP_JWT_SECRET`
- `APP_JWT_ACCESS_TOKEN_MINUTES`
- `APP_JWT_REFRESH_TOKEN_DAYS`
- `REACT_APP_API_URL`

## Kvaliteedivärav hetkel

Kontrollitud viimases ringis:

- backend: `./gradlew test --tests com.chemreg.chemreg.sds.service.SdsPdfExtractionServiceTest`
- frontend: `npm run build`

Aga täielik MVP kvaliteedibaar vajab endiselt:

- rohkem backend integration teste
- frontend happy-path testide laiendamist SDS/inventory peale
- vähemalt ühte E2E teekonda

## Dokumentatsioon

Wiki elab nüüd eraldi GitHub wiki repos, mitte selles koodirepos.

- [Wiki home](https://github.com/jarmo164/ChemReg/wiki)
- [Technical overview](https://github.com/jarmo164/ChemReg/wiki/Technical-overview)
- [API and auth status](https://github.com/jarmo164/ChemReg/wiki/API-and-auth-status)
- [MVP scope](https://github.com/jarmo164/ChemReg/wiki/MVP)
- [Workflows](https://github.com/jarmo164/ChemReg/wiki/Workflows)
- [Testing status](https://github.com/jarmo164/ChemReg/wiki/Testing-status)
- [Deployment](https://github.com/jarmo164/ChemReg/wiki/Deployment)
- [Server runbook](https://github.com/jarmo164/ChemReg/wiki/Server-runbook)

## Litsents

MIT
