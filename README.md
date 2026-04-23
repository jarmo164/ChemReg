# ChemReg

ChemReg on kemikaaliohutuse ja vastavuse halduse veebirakendus. Projekti eesmark on viia koondatud vaatesse kemikaalide register, SDS haldus, riskihinnangud ja auditiks vajaliku toe funktsioonid, et organisatsioon saaks oigusnouded paremini kontrolli all hoida.

Praegune repos olev versioon on tehniline baas, kus on olemas rakenduse karkass, peamised tehnoloogilised kihid ja osa API pinnast. Mitmed toote tuumavood on veel iteratiivses arenduses.

## Miks see projekt olemas on

- Vahendada hajutatud kemikaaliinfot (tabelid, failid, meilid) uhesse hallatavasse rakendusse.
- Anda meeskonnale uhtne toovoog kemikaaliandmete ja nendega seotud riskide haldamiseks.
- Luua platvorm, mida saab laiendada tootmiskupsuseks samm-sammult, ilma et arhitektuur tuleks hiljem umber teha.

## Arhitektuur ja tehnoloogiavirn

| Kiht | Tehnoloogia | Staatus |
|------|-------------|---------|
| Frontend | React 19, React Router 7, MUI 7 | olemas |
| Backend | Java 21, Spring Boot 4.0.3 (WebMVC, JPA, Validation) | olemas |
| Andmebaas | PostgreSQL 17 | olemas |
| Migratsioonid | Flyway | olemas |
| API dokumentatsioon | Springdoc OpenAPI / Swagger UI | olemas |
| Konteinerid | Docker + Docker Compose | olemas |

Teenuste paigutus `docker-compose.yaml` pohjal:

- `db` (PostgreSQL)
- `backend` (Spring Boot, soltub `db` teenusest)
- `frontend` (React, soltub `backend` teenusest)

## Süsteemi arhitektuur

ChemReg on ehitatud 3-kihilise rakendusena:

- Frontend: React SPA, mis haldab kasutajaliidest, route'e ja API kutseid.
- Backend: Spring Boot REST teenus, kus asuvad domeeniloogika, valideerimine ja endpointid.
- Andmekiht: PostgreSQL andmebaas, mille skeemi haldab Flyway migratsioonide kaudu.

Pohiandmevoog:

- Kasutaja teeb tegevuse brauseris -> frontend saadab REST paringu backendile -> backend loeb/salvestab andmed PostgreSQL-i -> frontend kuvab tulemuse kasutajale.

Deploy voog:

- Arendusharu muudatused kaivitavad GitHub Actions workflow -> builditakse frontend ja backend -> artefakt juurutatakse serverisse.

Auth seis kõrgtasemel:

- Login voog backendi endpointiga on tootavas osas olemas.
- Taielik sessiooni/tokeni elutsukkel (nt tugevam tokeni haldus ja taastumine 401 olukordadest) on veel arenduses.

Detailne tehniline vaade:

- [Technical overview](wiki/Technical-overview.md)
- [API and auth status](wiki/API-and-auth-status.md)

## Hetkeseis (aus vaade)

### Praegu olemas

- Frontendi route-karkass ja sisse-logimise UX voog (`/login`, kaitstud route'id `RequireAuth` kaudu).
- Frontendi login on uhendatud backendi autentimise endpointiga (`POST /api/auth/login`) ning kasutab uhtset API kliendikihti.
- Dashboard ning mitmed moodulivaated (osa lehti on teadlikult placeholder-staatuses).
- Backendis toimivad endpointid:
  - `POST /api/auth/login`
  - `POST /api/users`
  - `GET/POST/PUT/DELETE /api/chemical-products`
- Flyway migratsioonide tugi ja PostgreSQL uhendus.
- Deploy workflow GitHub Actionsis, mis buildib frontend + backend ning juurutab serverisse.

### Pooleli / jargmine samm

- Sessiooni/tokeni mudel on praegu lihtsustatud: `localStorage` tokeniks salvestatakse login response'i `loggedInAt`, mitte eraldi juurdepaaasutoken.
- API kliendikiht on olemas (`frontend/src/api/apiClient.ts`), kuid uhtne tokeni uuenduse/401 taaskaivituse strateegia vajab rakendamist.
- Rakenduse HTTP turbekiht ja autoriseerimisreeglid vajavad laiendamist kogu API pinnal.
- Automaatsete testide katvus on napp ning CI pipeline ei valiideri teste enne deployd.
- MVP funktsioonid (SDS toovood, riskihinnangu taisvood, inventuur) on osaliselt planeeritud, mitte taielikult implementeeritud.

## Release bar: millal ChemReg on "ready"

ChemRegi ei loeta pilot-ready seisus olevaks enne, kui allolev minimaalne valmidusbar on taidetud.

### Noutud toovood

- autentimine, sessiooni taastumine ja logout toimivad usaldusvaarsete tokenitega
- RBAC ja scope-kontroll toimivad backendis, mitte ainult route-kihis
- SDS loomine / uleslaadimine / detail / versioonihaldus toimib parisandmetega
- chemical registry ja inventory + location flow toimivad parisandmetega
- riskihinnangu baasvoog ja kinnitusring toimivad MVP ulatuses
- vahemalt uks raport voi dokumendivaljund (nt label voi risk PDF) on kasutatav

### Noutud kvaliteedikontrollid

- backendi kriitilistele voogudele on unit/integration testid
- frontendil on vahemalt peamiste happy pathide testid
- olemas on vahemalt uks E2E test login -> core workflow teekonnale
- CI peatab deploy, kui kohustuslik build voi test kukub labi

### Noutud infra ja operatiivne valmisolek

- keskkonnamuutujad ja secretsi kasutus on dokumenteeritud
- migratsioonid jooksevad korratavalt puhtas keskkonnas
- deploy/runbook kirjeldab buildi, juurutust, rollbacki ja taaste baasvoogu
- storage/search/notification integratsioonide MVP piir on selgelt otsustatud

### Noutud dokumentatsioon

- README, wiki ja arendusdokument kirjeldavad sama stacki ja scope'i
- MVP, post-MVP ja enterprise-only piirid on selgelt eristatud
- teadaolevad piirangud on ausalt dokumenteeritud

## Kaivitamine

### 1) Soovituslik: Docker Compose

Eeldused:

- Docker Desktop (voi Docker Engine + Compose plugin)
- Kohandatud `.env` fail projekti juurkaustas

Kaivitus:

```bash
docker compose up --build
```

Vaikimisi pordid:

| Teenus | Aadress |
|--------|---------|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8080 |
| PostgreSQL | localhost:5432 |

### 2) Lokaalne kaivitus ilma Dockerita

Eeldused:

- Java 21
- Node.js 20
- Jooksev PostgreSQL instants

Backend:

```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=local'
```

Windows CMD korral:

```bat
cd backend
gradlew.bat bootRun --args="--spring.profiles.active=local"
```

Frontend:

```bash
cd frontend
npm install
npm start
```

## Keskkonnamuutujad

`docker-compose.yaml` loeb vaartused `.env` failist. Alustuseks kopeeri juurkaustas `.env.example` fail nimega `.env` ja kohanda vaartused oma keskkonnale.

Minimaalselt peavad olema maaratud:

- `POSTGRES_VERSION`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DB_PORT`
- `BACKEND_PORT`
- `FRONTEND_PORT`
- konteinerinimed (`DB_CONTAINER_NAME`, `BACKEND_CONTAINER_NAME`, `FRONTEND_CONTAINER_NAME`)
- JWT seaded (`APP_JWT_ISSUER`, `APP_JWT_SECRET`, `APP_JWT_ACCESS_TOKEN_MINUTES`, `APP_JWT_REFRESH_TOKEN_DAYS`)

Marge: repo voib sisaldada erinevaid vaikenaitedokumente; arvesta alati jooksva `docker-compose.yaml` sisuga kui todeallikaga.

`REACT_APP_API_URL` kasutus:

- Lokaalarenduses kasuta vaartust `http://localhost:8080` (see on ka frontendi vaikimisi fallback).
- Docker Compose lokaalses kaivituses toimib sama aadress, sest backend eksponeeritakse hosti pordile `${BACKEND_PORT}`.
- Kui backend on teisel domeenil voi pordil, sea `REACT_APP_API_URL` frontendi buildi ajal vastavaks sellele avalikule API aadressile.

JWT muutujad local profiiliga:

- `backend/src/main/resources/application-local.yaml` loeb JWT vaartused keskkonnast (`APP_JWT_*`), vaikimisi fallbackidega `APP_JWT_ISSUER=ChemReg`, `APP_JWT_ACCESS_TOKEN_MINUTES=15`, `APP_JWT_REFRESH_TOKEN_DAYS=30`.
- `APP_JWT_SECRET` tuleb alati ise maarata (turvaline ja piisavalt pikk saladus), sest sellele fallbacki ei ole.

## API ja auth staatus (luhidalt)

- Backendis on auth endpoint olemas (`POST /api/auth/login`) ning user/chemical mooduli baas-API samuti olemas.
- Frontendi login kutsub reaalselt backendi `/api/auth/login` endpointi ja kasutab `apiClient` kihti.
- Frontendi auth pusiandmete mudel vajab koondamist tugevamaks sessiooni/tokeni lahenduseks.
- OpenAPI/Swagger on arenduskeskkonnas saadaval (`/swagger-ui.html` ja `/v3/api-docs` local profiiliga).

Detailne ja uuenev seis:

- [API and auth status](wiki/API-and-auth-status.md)

## Testimine ja kvaliteet

Praegune seis:

- Backendis on testisoltuvused olemas, aga testikate on minimaalne.
- Frontendis on vaikimisi CRA testifail, mis ei peegelda tegelikku UI kasutusjuhtu.
- Deploy workflow buildib, kuid:
  - backend build kaib `-x test` lipuga
  - frontendis `npm test` sammu ei kaivitata

Detailid ja soovituslik minimaalne testibaas:

- [Testing status](wiki/Testing-status.md)

## Deploy ja CI/CD

- Juurutus toimub GitHub Actions workflow kaudu: `.github/workflows/deploy.yml`
- Trigger: `push` harule `dev`
- Pipeline buildib backendi + frontendi, pakib artefakti ja juurutab serverisse SSH kaudu.
- Tulemusena valideeritakse peamiselt build/deploy terviklikkust, mitte taismahus testikvaliteeti.

Taielik deploy kirjeldus:

- [Deployment](wiki/Deployment.md)

## Wiki navigeerimine

Peamised wiki lehed:

- [Home](wiki/Home.md)
- [API and auth status](wiki/API-and-auth-status.md)
- [Testing status](wiki/Testing-status.md)
- [Deployment](wiki/Deployment.md)
- [Workflows](wiki/Workflows.md)
- [MVP](wiki/MVP.md)
- [Presentation video script](wiki/Presentation-video-script.md)

Lisaks:

- [Source assignment](wiki/Source-assignment.md)
- [Technical overview](wiki/Technical-overview.md)
- [Server runbook](wiki/Server-runbook.md)
- [User stories](wiki/User-stories.md)

## Litsents

MIT
