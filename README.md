# ChemReg

Keemiaregistri veebirakendus, mis koosneb React frontendist, Spring Boot backendist ja PostgreSQL andmebaasist. Kogu keskkond on konteineriseeritud Docker Compose'iga.

## Tehnoloogiad

| Kiht | Tehnoloogia |
|------|-------------|
| Frontend | React 19, Node 20 |
| Backend | Java 21, Spring Boot 4.0.3, Gradle |
| Andmebaas | PostgreSQL 17 |
| Konteinerid | Docker, Docker Compose |

## Projekti struktuur

```
ChemReg/
├── docker-compose.yaml       # Kõigi teenuste orkestratsioon
├── .env                      # Keskkonnamuutujad
├── backend/
│   ├── Dockerfile
│   ├── build.gradle.kts
│   └── src/main/java/com/chemreg/ChemReg/
│       ├── ChemRegApplication.java
│       └── HelloController.java
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── App.js
        └── index.js
```

## Eeldused

- [Docker](https://www.docker.com/) ja Docker Compose
- (Valikuline) Java 21 ja Node 20, kui soovid teenuseid lokaalselt käivitada

## Käivitamine

### Docker Compose'iga (soovituslik)

```bash
docker compose up --build
```

Teenused käivituvad järgmistel portidel:

| Teenus | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8080 |
| PostgreSQL | localhost:5432 |

### Lokaalselt ilma Dockerita

**Backend:**

```bash
cd backend
./gradlew bootRun
```

**Frontend:**

```bash
cd frontend
npm install
npm start
```

## Keskkonnamuutujad

Kopeeri `.env.example` fail `.env` failiks ja kohanda väärtusi vastavalt vajadusele:

```bash
cp .env.example .env
```

`.env.example` näidis:

```env
POSTGRES_VERSION=17

DB_CONTAINER_NAME=chemreg-db
BACKEND_CONTAINER_NAME=chemreg-backend
FRONTEND_CONTAINER_NAME=chemreg-frontend

POSTGRES_DB=db_name
POSTGRES_USER=user
POSTGRES_PASSWORD=password

DB_PORT=5432
BACKEND_PORT=8080
FRONTEND_PORT=3000
```

Keskkonnamuutujad:

| Muutuja | Vaikeväärtus | Kirjeldus |
|---------|--------------|-----------|
| `POSTGRES_VERSION` | `17` | PostgreSQL versiooni tag |
| `POSTGRES_DB` | `chemreg` | Andmebaasi nimi |
| `POSTGRES_USER` | `chemreg_user` | Andmebaasi kasutaja |
| `POSTGRES_PASSWORD` | `chemreg_pass` | Andmebaasi parool |
| `DB_PORT` | `5432` | PostgreSQL port hostis |
| `BACKEND_PORT` | `8080` | Backend port hostis |
| `FRONTEND_PORT` | `3000` | Frontend port hostis |

## API otspunktid

| Meetod | Tee | Kirjeldus |
|--------|-----|-----------|
| GET | `/` | Tervisekontroll — tagastab `"ChemReg backend töötab"` |
| GET | `/hello` | Test-otspunkt — tagastab `"Hello World"` |

## Litsents

MIT
