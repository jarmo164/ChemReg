# Kemikaalihalduse Platvormi Arendusdokumentatsioon
---

## Sisukord

1. [Sissejuhatus ja toote eesmärk](#1-sissejuhatus-ja-toote-eesmärk)
2. [Kasutajarollid ja pääsuõigused (RBAC)](#2-kasutajarollid-ja-pääsuõigused-rbac)
3. [Funktsionaalsed moodulid](#3-funktsionaalsed-moodulid)
4. [Kasutajaliidese struktuur (IA/UX)](#4-kasutajaliidese-struktuur-iaux)
5. [Mittefunktsionaalsed nõuded](#5-mittefunktsionaalsed-nõuded)
6. [Tehniline arhitektuur](#6-tehniline-arhitektuur)
7. [Andmemudel](#7-andmemudel)
8. [API spetsifikatsioon](#8-api-spetsifikatsioon)
9. [Kinnituste ja töövoogude loogika](#9-kinnituste-ja-töövoogude-loogika)
10. [MVP arendusplaan](#10-mvp-arendusplaan)
11. [Testimis- ja kvaliteedikriteeriumid](#11-testimis--ja-kvaliteedikriteeriumid)
12. [Glossaar](#12-glossaar)

---

## 1. Sissejuhatus ja toote eesmärk

Käesolev dokument on kemikaalihalduse platvormi täielik tehniline spetsifikatsioon, mis on mõeldud arendusmeeskonnale tarkvara loomise alusena. Platvormi eesmärk on pakkuda organisatsioonidele tsentraliseeritud ja terviklikku lahendust kemikaalide elutsükli haldamiseks — alates ohutuskaartide (SDS) hoidmisest kuni riskihindamiste, vastavuskontrolli ja märgistamiseni.

Süsteem on kavandatud originaalse arhitektuuri ja kasutajakogemusega, lahendades samu probleeme, mida kemikaalihalduse turul olevad tooted, kuid omades iseseisvat tehnilist teostust. Platvormi saab kasutada nii väiksemad ettevõtted (kuni ~5 000 inventariühikut) kui ka suuremad organisatsioonid (100 000+), kuna arhitektuur on kavandatud skaleeruvust silmas pidades.

Platvormi põhivaldkonnad on järgmised:

- **Ohutuskaartide (SDS) haldus** — tarnijate ja ettevõtte enda kureeritud ohutuskaartide tsentraliseeritud hoidmine, versioonihaldus ja automaatsed uuendused.
- **Kemikaaliregister ja inventuur** — asukohapõhine kemikaalide register ja inventuuri haldus, sealhulgas ohtlike ainete manifesti koostamine.
- **Riskihindamised** — kemikaalide kasutusstsenaariumitepõhiste riskihinnangute loomine, haldamine ja dokumenteerimine.
- **Vastavus ja aruandlus** — regulatsioonidele vastavuse kontroll, auditijälgede loomine ja põhjalike raportite genereerimine.
- **Märgistamine** — kemikaalide konteinerite, ümbervalatud ainete ja segude jaoks vastavusmärgistuse loomine ja printimine.

---

## 2. Kasutajarollid ja pääsuõigused (RBAC)

Süsteem peab toetama rollipõhist pääsukontrolli (Role-Based Access Control, RBAC), et tagada andmete turvalisus ja funktsionaalsuse kättesaadavus vastavalt kasutaja tööülesannetele. Lisaks rollipõhistele piirangutele peavad pääsuõigused arvestama ka objektipõhist konteksti — näiteks ei tohi asukohajuht näha teise saidi inventuuri.

| Roll | Kirjeldus | Põhiõigused |
|---|---|---|
| **Org Admin** | Süsteemi üldhaldur | Täielik haldus: seadistused, rollid, integratsioonid, kõik moodulid |
| **EHS Manager** | Töökeskkonna ja -ohutuse juht | Poliitikad, riskimallid, vastavus, raportid, auditilogide lugemine |
| **Site/Area Manager** | Asukoha- või valdkonnajuht | Oma saidi inventuur, kinnituste haldus, SDS-ide lugemine |
| **User/Worker** | Tavakasutaja | SDS-ide otsing ja vaatamine, etikettide printimine, oma saidi inventuuri lugemine |
| **Auditor** | Ainult lugemisõigustega roll | Kõikide moodulite lugemisõigus, auditilogid |
| **External Supplier** | Tarnija piiratud juurdepääsuga | Ainult oma toodete SDS-ide üleslaadimine ja linkimine |

![RBAC Diagramm](rbac_diagram.png)

---

## 3. Funktsionaalsed moodulid

Süsteem koosneb seitsmest põhimoodulist, mis on omavahel tihedalt seotud, kuid arhitektuurselt eraldiseisvad.

### 3.1. SDS / Dokumendihaldus

Ohutuskaartide haldamise moodul on platvormi tuum. See võimaldab organisatsioonil hoida kõiki ohutuskaarte ühes kohas, tagada nende ajakohasuse ja seostada need kemikaaliregistris olevate toodetega.

**Põhifunktsioonid:**

SDS-i üleslaadimisel tuleb koguda järgmised metaandmed: tootja nimi, tootenimi, CAS/EC numbrid, keel, riigiformaat, väljaande kuupäev ja versiooninumber. Süsteem peab toetama erinevaid SDS-i tüüpe: tarnija originaal-SDS, ettevõtte poolt kureeritud/ülevaadatud SDS, mini-SDS ja hädaabiteave.

Versioonihaldus peab tagama, et igal ajahetkel on ühele tootele määratud täpselt üks "aktiivne" versioon, kuid varasemad versioonid on arhiivis kättesaadavad. Otsing peab toetama nii täistekstiotsingut dokumentide sisust kui ka filtreerimist metaandmete alusel (toode, CAS, tootja, asukoht, ohuklass, keel).

Süsteem peab saatma automaatseid meeldetuletusi, kui SDS on aegunud või tarnijalt on saabunud uuendus. Kõik tegevused (vaatamine, allalaadimine, uuendamine) tuleb logida auditijälje jaoks.

**Tehnilised nõuded:**

Dokumendifailid (PDF) tuleb salvestada S3-ühilduvasse objektisalvestusse. Metaandmed hoitakse SQL-andmebaasis. PDF-ide eelvaade peab olema kättesaadav otse brauseris "laisa laadimisega" (lazy-load). Allalaadimisõigused peavad olema kontrollitud rollide alusel.

### 3.2. Kemikaaliregister ja inventuur

Kemikaaliregistri moodul haldab organisatsiooni kõiki kemikaale ja nende asukohti. Moodul toetab nii kataloogikirjeid (toodete andmed) kui ka konkreetseid füüsilisi konteinereid (inventariühikud).

**Asukohtade hierarhia:**

Süsteem peab toetama paindlikku asukohtade hierarhiat: Organisatsioon → Tehas/Sait → Hoone → Korrus → Ruum → Kapp/Riiul. Iga taseme jaoks saab luua piiramatu arvu alamtasemeid.

**Andmemudeli põhiobjektid:**

*Kemikaalitoode (Chemical Product)* on kataloogikirje, mis esindab konkreetset toodet või segu. See sisaldab tootja andmeid, SKU-d ja teavet selle kohta, kas tegemist on seguga.

*Inventariühik (Inventory Item)* esindab konkreetset füüsilist konteinerit koos andmetega: kogus, ühik, kontsentratsioon, olek, aegumiskuupäev, ohtliku aine klass (DG class) ja UN number. Iga inventariühik on seotud kemikaalitoote ja selle aktiivse ohutuskaardiga.

**Funktsioonid:**

Registri vaade peab toetama tabelkujul kuvamist koos filtreerimise, sorteerimise ja eksportimise võimalusega (CSV, PDF). Ohtlike ainete manifest genereeritakse automaatselt asukoha põhiselt. Inventuuri tegemiseks peab olema mobiilisõbralik vaade koos QR- ja vöötkoodi skaneerimise toega. Ümbervalamisel (decant) luuakse uus inventariühik olemasoleva baasil ja genereeritakse automaatselt uus etikett.

### 3.3. Riskihindamise moodul

Riskihindamise moodul võimaldab luua, hallata ja dokumenteerida riskihinnanguid kemikaalide kasutusstsenaariumite põhjal.

**Põhiobjektid:**

*Riskihinnang (RiskAssessment)* on peadokument, mis sisaldab pealkirja, asukohta, tööülesande kirjeldust, kuupäeva, vastutajat ja staatust (mustand / ülevaatusel / kinnitatud / arhiveeritud).

*Kokkupuutestsenaarium (ExposureScenario)* kirjeldab konkreetset kemikaaliga kokkupuute olukorda: kasutatavad kemikaalid, protsess, kogus, sagedus, kestus, ventilatsioon ja isikukaitsevahendid (PPE).

*Kontrollmeede (ControlMeasure)* kirjeldab meetmeid riski maandamiseks, mis võivad olla tehnilised, organisatoorsed või isikukaitsevahenditega seotud.

*Riskireiting (RiskRating)* arvutatakse tõenäosuse ja tagajärje korrutisena konfigureeritava maatriksi alusel, nii enne kui ka pärast kontrollmeetmete rakendamist.

**Funktsioonid:**

Süsteem peab toetama eeldefineeritud malle levinud tegevuste jaoks (nt "laboritöö", "hooldus", "puhastamine"). Ohutuskaardilt pärinevad andmed (klassifikatsioon, H/P-laused, GHS piktogrammid) tuleb automaatselt kanda riskihinnangule. Kinnitusring hõlmab mitmeastmelist protsessi: koostaja → EHS juht → kinnitaja. Kinnitatud riskihinnangust genereeritakse automaatselt prinditav PDF-raport.

### 3.4. Märgistamine (Labeling)

Märgistamise moodul võimaldab luua ja printida GHS-nõuetele vastavaid etikette kemikaalide konteineritele.

Süsteem peab toetama konfigureeritavaid etiketimalle, mis arvestavad riigipõhiseid nõudeid ja sisaldavad GHS piktogramme. Etiketi andmed (tootenimi, koostis, H/P-laused, piktogrammid, tootja andmed) täidetakse automaatselt kemikaaliregistrist. Etikette saab printida PDF-formaadis standardsetele etiketilehtedele (nt Avery) ning valikuliselt ka termoprinteritele ZPL-vormingus.

### 3.5. Vastavus ja regulatsioonid

Vastavusmoodul võimaldab hallata regulatiivseid nimekirju ja kontrollida, kas organisatsiooni kemikaalid vastavad kehtivatele nõuetele.

Administraator saab importida ja hallata erinevaid regulatiivseid nimekirju (nt REACH SVHC, CLP Annex VI, OSHA HazCom). Süsteem märgistab automaatselt kemikaaliregistris olevad ained, mis kuuluvad mõnda regulatiivsesse nimekirja. Riigiprofiilide kaudu saab seadistada riigipõhiseid nõudeid (keel, etiketimallid, SDS-formaat). Enterprise-versioonis on võimalik integreerida välise regulatiivsete andmete teenusega perioodiliste uuenduste saamiseks.

### 3.6. Kinnitused, auditid ja töövood

Kinnituste moodul haldab mitmeastmelisi kinnitusprotsesse ja tagab tegevuste jälgitavuse.

Uue kemikaali lisamisel käivitub konfigureeritav kinnitusprotsess, mis võib hõlmata asukohajuhti, EHS juhti ja hangete osakonda. Auditi moodul võimaldab luua ja läbi viia kontrollnimekirjapõhiseid auditeid (nt "Kas SDS on olemas?", "Kas märgistus on korrektne?", "Kas ladustamine vastab nõuetele?"). Kõik olulised tegevused logitakse muutumatusse auditijälge koos ajatempli, toimija ja muudatuse kirjeldusega.

### 3.7. Raportid ja eksport

Raportite moodul võimaldab genereerida standardseid ja kohandatavaid aruandeid.

Standardraportid hõlmavad kemikaaliregistrit, ohtlike ainete manifesti, riskihinnangute registrit, SDS-ide katvuse rapoirt (mitu toodet on ilma SDS-ita või aegunud SDS-iga) ning etikettide printimise ajalugu. Administraatoritele on kättesaadavad kasutusstatistika vaated (vaatamised, allalaadimised, aktiivsed kasutajad).

---

## 4. Kasutajaliidese struktuur (IA/UX)

Kasutajaliides peab olema intuitiivne, kaasaegne ja reageeriv (responsive), tagades hea kasutuskogemuse nii laua- kui ka mobiilseadmetes.

### 4.1. Põhinavigatsioon

Rakenduse peamenüü sisaldab järgmisi sektsioone, mis vastavad funktsionaalsetele moodulitele:

| Nr | Menüüpunkt | Kirjeldus |
|---|---|---|
| 1 | **Töölaud** | Ülevaade teavitustest, aeguvate SDS-ide arv, avatud ülesanded, viimased tegevused |
| 2 | **SDS Teek** | Ohutuskaartide otsing, vaatamine, üleslaadimine ja haldamine |
| 3 | **Inventuur** | Kemikaaliregister, asukohtade puu, inventuuri tegemine |
| 4 | **Riskihindamised** | Riskihinnangute loomine, haldamine ja kinnitamine |
| 5 | **Märgised** | Etikettide loomine ja printimine |
| 6 | **Vastavus** | Regulatiivsete nimekirjade haldus, vastavuskontroll |
| 7 | **Raportid** | Standardraportite genereerimine ja vaatamine |
| 8 | **Admin** | Süsteemi seadistused (ainult Org Admin rollile) |

### 4.2. Olulisemad vaated

**SDS detailvaade** kuvab ohutuskaardi metaandmeid, versiooniajalugu, seotud inventariühikuid ja võimaldab taotleda uuendust. Vaade sisaldab ka PDF-i eelvaadet otse brauseris.

**Inventuuri nimekiri ja asukohapuu** on hierarhiline vaade, kus vasakul on asukohtade puu (sait → hoone → korrus → ruum) ja paremal on valitud asukohta kuuluvate kemikaalide nimekiri filtreerimise ja sorteerimise võimalusega.

**Riskihindamise koostaja (wizard)** on samm-sammuline protsess: (1) Kemikaali valik → (2) Tegevuse kirjeldus → (3) Kokkupuute hindamine → (4) Kontrollmeetmed → (5) Riskireiting → (6) Kinnitamine → (7) PDF eksport.

**Etiketidisainer** on administraatoritele mõeldud tööriist etiketimallide loomiseks drag-and-drop liidesega. Tavakasutajatele on mõeldud lihtne vaade, kus valitakse toode ja mall ning saadetakse prinditöö.

---

## 5. Mittefunktsionaalsed nõuded

### 5.1. Turvalisus

Süsteem peab toetama ühekordset sisselogimist (SSO) läbi SAML 2.0 ja OIDC protokollide, võimaldades integratsiooni levinud identiteedihaldusteenustega (nt Okta, Azure AD, Google Workspace). Administraatoritele peab olema kohustuslik mitmefaktoriline autentimine (MFA). Rollipõhine pääsukontroll (RBAC) peab olema kombineeritud objektipõhise kontekstiga (nt asukohapõhine piiramine). Kõik olulised tegevused tuleb logida muutumatusse auditijälge (WORM-salvestus või append-only logi).

### 5.2. Andmekaitse

Süsteem peab olema mitme rentniku (multi-tenant) toega, tagades klientide andmete täieliku eraldatuse nii andmebaasi kui ka failisalvestuse tasemel. Isikuandmete kogumine peab olema minimaalne — ainult nimi, e-posti aadress ja roll. Andmete töötlemisel tuleb järgida GDPR nõudeid.

### 5.3. Jõudlus

Otsingupäringutele vastamise aeg peab olema alla ühe sekundi. PDF-failide laadimine peab toimuma "laisa laadimisega" (lazy-load). Andmemahukad operatsioonid (SDS-ide import, metaandmete ekstraheerimine, regulatiivne märgistamine) peavad toimuma taustaprotsessidena, mitte blokeerima kasutajaliidest.

### 5.4. Kättesaadavus ja töökindlus

| Tase | Käideldavus | RPO | RTO |
|---|---|---|---|
| **MVP** | 99.5% | 24 tundi | 24 tundi |
| **Enterprise** | 99.9% | 4 tundi | 4 tundi |

Süsteem peab toetama regulaarseid automaatseid varukoopiaid ja selgelt defineeritud taasteplaan (DR) peab vastama ülaltoodud SLA-le.

### 5.5. Lokaliseerimine

Kasutajaliides peab toetama mitmekeelsust (i18n). Dokumentide ja muude andmete puhul tuleb toetada keele metaandmeid. Ajavööndeid peab saama seadistada saidi tasemel.

---

## 6. Tehniline arhitektuur

### 6.1. MVP (Modulaarne monoliit)

ChemRegi praeguse repo ja lähiaja MVP teostuse alus on modulaarne monoliit, mis kasutab olemasolevat Spring Boot + React tehnoloogiavirna. See lähenemine hoiab arenduse ja deploy vood lihtsana, kuid jätab moodulid piisavalt selgelt piiritletuks, et neid oleks võimalik hiljem vajadusel teenusteks eraldada.

| Komponent | Tehnoloogia |
|---|---|
| **Backend** | Java 21 + Spring Boot 4 (WebMVC, Data JPA, Validation, Security) |
| **Frontend** | React 19 + TypeScript + MUI 7 |
| **Andmebaas** | PostgreSQL 17 |
| **Migratsioonid** | Flyway |
| **API dokumentatsioon** | Springdoc OpenAPI / Swagger UI |
| **Failide salvestus** | MVP-s abstraktsiooniga dokumendisalvestus; S3/MinIO tugi otsustatakse eraldi scope'i järgi |
| **Otsing** | MVP-s baastaseme filtreerimine ja andmebaasipõhine otsing; eraldi otsinguplatvorm on hilisem laiendus |
| **Taustatööd** | Vajadusel Spring-põhised async/job lahendused; eraldi järjekorrasüsteem ei ole MVP eeltingimus |
| **Autentimine** | Spring Security + JWT / refresh token voog |
| **PDF genereerimine** | Backend-põhine PDF väljundi teenus (täpne teek valitakse vastava mooduli juures) |

#### 6.1.1. Integreerimisotsused pilot-ready MVP jaoks

| Teema | Otsus | Põhjendus |
|---|---|---|
| **S3 / MinIO dokumendisalvestus** | **MVP-s kohustuslik läbi abstraktsiooni** | SDS failid peavad olema salvestatavad vahetatava storage-kihi taha; lokaalis võib kasutada lihtsamat adapterit, kuid piloodi jaoks peab olema MinIO/S3-võimeline tee olemas. |
| **Otsing** | **MVP-s lihtsustatud, eraldi otsingumootor edasi lükatud** | Esmane release vajab filtreerimist ja baasotsingut, mitte OpenSearch klastri opereerimist. |
| **Teavitused** | **MVP-s kohustuslik minimaalne sündmuspõhine tase** | Riski kinnitusring ja SDS elutsükkel vajavad vähemalt baasnotifikatsioone, isegi kui kanalite valik jääb kitsaks. |
| **SSO / SAML** | **Edasi lükatud** | Praegune repo ja MVP vajadus ei õigusta enne pilooti keerukamat identiteedihalduse integratsiooni. |
| **MFA** | **Edasi lükatud post-MVP / enterprise tasemele** | Turbenõue on oluline, kuid selle sidumine SSO/IdP strateegiaga tuleb teha tervikotsusena, mitte poolikult MVP sees. |
| **Compliance import** | **Edasi lükatud** | Regulatiivsete nimekirjade automaatne import ei ole pilot-ready MVP eeltingimus; käsitsi hallatav baasvoog piisab esimeseks etapiks. |

### 6.2. Skaleeruv arhitektuur (Mikroteenused)

Pärast MVP valideerimist ja klientide lisandumist saab süsteemi refaktoreerida mikroteenuste arhitektuurile. Eraldi teenused luuakse järgmistele funktsionaalsustele: dokumendihaldus (SDS), inventuur, riskihindamine, vastavus ja raportid. Teenuste vaheline suhtlus toimub sündmustepõhiselt (event bus), kasutades Kafka või NATS platvormi.

![Süsteemi Arhitektuur](architecture_diagram.png)

### 6.3. Projekti kataloogistruktuur (MVP)

```
/
├── backend/                              # Spring Boot backend
│   ├── src/main/java/com/chemreg/chemreg/
│   │   ├── auth/                         # Autentimine, JWT, refresh tokenid
│   │   ├── chemical/                     # Kemikaalitoodete kataloog
│   │   ├── inventory/                    # Inventuur ja laoseis
│   │   ├── risk/                         # Riskihindamise domeen
│   │   ├── sds/                          # SDS halduse domeen
│   │   ├── label/                        # Märgistuse domeen
│   │   ├── workflow/                     # Kinnitused ja töövood
│   │   ├── audit/                        # Auditilogid
│   │   ├── common/                       # Ühised utiliidid, konfiguratsioon, erindid
│   │   └── ...
│   ├── src/main/resources/               # application-*.yaml, migratsioonide seadistus
│   ├── src/test/                         # Backend testid
│   └── build.gradle.kts
│
├── frontend/                             # React frontend
│   ├── src/
│   │   ├── pages/                        # Leheküljed (Dashboard, SDS, Inventory jne)
│   │   ├── components/                   # Korduvkasutatavad komponendid
│   │   ├── api/                          # API kliendi funktsioonid
│   │   ├── auth/                         # Sessiooni- ja route-kaitse loogika
│   │   ├── data/                         # Ajutised/mock andmed, mis tuleb MVP kriitilistelt radadelt eemaldada
│   │   └── ...
│   └── package.json
│
├── docker-compose.yaml                   # Lokaalne arenduskeskkond
├── README.md
└── KEMIKAALIHALDUS_ARENDUSDOKUMENTATSIOON.md
```

---

## 7. Andmemudel

Allpool on esitatud süsteemi täielik andmemudel PostgreSQL skeemina. Kõik tabelid kasutavad UUID-põhiseid primaarvõtmeid ja sisaldavad `created_at` ning `updated_at` ajatempleid (välja arvatud auditilogid, mis on muutumatud).

![Andmemudeli ERD Diagramm](erd_diagram.png)

### 7.1. Tuum (Core)

```sql
-- Rentnikud (kliendid)
CREATE TABLE tenants (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    plan        VARCHAR(50) NOT NULL DEFAULT 'mvp', -- 'mvp', 'enterprise'
    settings_json JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Kasutajad
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email       VARCHAR(255) NOT NULL,
    name        VARCHAR(255) NOT NULL,
    role        VARCHAR(50) NOT NULL, -- 'org_admin', 'ehs_manager', 'site_manager', 'user', 'auditor', 'supplier'
    status      VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'invited'
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tenant_id, email)
);

-- Saidid (tehased, kontorid)
CREATE TABLE sites (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    timezone    VARCHAR(100) NOT NULL DEFAULT 'UTC',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Asukohad (hierarhiline struktuur)
CREATE TABLE locations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id     UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    parent_id   UUID REFERENCES locations(id) ON DELETE SET NULL,
    name        VARCHAR(255) NOT NULL,
    type        VARCHAR(50) NOT NULL, -- 'building', 'floor', 'room', 'cabinet', 'shelf'
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 7.2. Ohutuskaardid (SDS)

```sql
-- SDS dokumendid (metaandmed)
CREATE TABLE sds_documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    supplier        VARCHAR(255) NOT NULL,
    product_name    VARCHAR(500) NOT NULL,
    language        VARCHAR(10) NOT NULL, -- ISO 639-1, nt 'et', 'en', 'de'
    country_format  VARCHAR(10) NOT NULL, -- ISO 3166-1, nt 'EE', 'GB', 'US'
    issued_at       DATE,
    revision        VARCHAR(50),
    status          VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'archived', 'pending_review'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SDS failid (versioonid)
CREATE TABLE sds_files (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sds_document_id UUID NOT NULL REFERENCES sds_documents(id) ON DELETE CASCADE,
    version         INTEGER NOT NULL DEFAULT 1,
    storage_key     VARCHAR(1000) NOT NULL, -- S3 objektivõti
    sha256          VARCHAR(64) NOT NULL,   -- Faili räsi terviklikkuse kontrolliks
    file_size_bytes BIGINT,
    uploaded_by     UUID NOT NULL REFERENCES users(id),
    uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (sds_document_id, version)
);

-- SDS ja kemikaalitoote seos
CREATE TABLE sds_links (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sds_document_id     UUID NOT NULL REFERENCES sds_documents(id) ON DELETE CASCADE,
    chemical_product_id UUID NOT NULL REFERENCES chemical_products(id) ON DELETE CASCADE,
    is_primary          BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (sds_document_id, chemical_product_id)
);
```

### 7.3. Kemikaalid (Chemicals)

```sql
-- Kemikaalitooted (kataloog)
CREATE TABLE chemical_products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            VARCHAR(500) NOT NULL,
    manufacturer    VARCHAR(255),
    sku             VARCHAR(100),
    mixture_bool    BOOLEAN NOT NULL DEFAULT false,
    ghs_pictograms  TEXT[],           -- GHS piktogrammide koodid, nt ['GHS02', 'GHS07']
    signal_word     VARCHAR(20),      -- 'Danger' või 'Warning'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ained (CAS/EC registri andmed)
CREATE TABLE substances (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cas     VARCHAR(20) UNIQUE,  -- CAS number
    ec      VARCHAR(20) UNIQUE,  -- EC number
    name    VARCHAR(500) NOT NULL,
    iupac_name VARCHAR(1000)
);

-- Toote koostis (toode ↔ aine seos)
CREATE TABLE product_substances (
    product_id          UUID NOT NULL REFERENCES chemical_products(id) ON DELETE CASCADE,
    substance_id        UUID NOT NULL REFERENCES substances(id),
    concentration_min   DECIMAL(5,2), -- Protsendina
    concentration_max   DECIMAL(5,2),
    PRIMARY KEY (product_id, substance_id)
);
```

### 7.4. Inventuur (Inventory)

```sql
-- Inventariühikud (füüsilised konteinerid)
CREATE TABLE inventory_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    site_id         UUID NOT NULL REFERENCES sites(id),
    location_id     UUID REFERENCES locations(id),
    product_id      UUID NOT NULL REFERENCES chemical_products(id),
    quantity        DECIMAL(12,3) NOT NULL,
    unit            VARCHAR(20) NOT NULL, -- 'kg', 'L', 'g', 'mL', 'pcs'
    container_type  VARCHAR(50),          -- 'bottle', 'drum', 'bag', 'cylinder'
    barcode         VARCHAR(100),
    status          VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'empty', 'disposed', 'quarantine'
    expiry_date     DATE,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ohtlike ainete omadused (DG)
CREATE TABLE dg_properties (
    product_id      UUID PRIMARY KEY REFERENCES chemical_products(id) ON DELETE CASCADE,
    un_number       VARCHAR(10),    -- nt 'UN1090'
    dg_class        VARCHAR(10),    -- nt '3', '8', '6.1'
    packing_group   VARCHAR(5),     -- 'I', 'II', 'III'
    proper_shipping_name VARCHAR(500),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 7.5. Riskihindamine (Risk)

```sql
-- Riskihinnangud
CREATE TABLE risk_assessments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    site_id         UUID NOT NULL REFERENCES sites(id),
    title           VARCHAR(500) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'under_review', 'approved', 'archived'
    owner_user_id   UUID NOT NULL REFERENCES users(id),
    template_id     UUID,           -- Viide mallile (kui loodi mallist)
    approved_at     TIMESTAMPTZ,
    approved_by     UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Kokkupuutestsenaariumid
CREATE TABLE risk_scenarios (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ra_id           UUID NOT NULL REFERENCES risk_assessments(id) ON DELETE CASCADE,
    description     TEXT NOT NULL,
    frequency       VARCHAR(50),    -- 'daily', 'weekly', 'monthly', 'rarely'
    duration        VARCHAR(50),    -- '< 1h', '1-4h', '> 4h'
    ventilation     VARCHAR(50),    -- 'none', 'natural', 'local_exhaust', 'general'
    ppe_required    TEXT[],         -- ['gloves', 'goggles', 'respirator']
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Kontrollmeetmed
CREATE TABLE risk_controls (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id     UUID NOT NULL REFERENCES risk_scenarios(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL, -- 'elimination', 'substitution', 'engineering', 'administrative', 'ppe'
    description     TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Riskireiting
CREATE TABLE risk_ratings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id     UUID NOT NULL REFERENCES risk_scenarios(id) ON DELETE CASCADE,
    likelihood      INTEGER NOT NULL CHECK (likelihood BETWEEN 1 AND 5),
    consequence     INTEGER NOT NULL CHECK (consequence BETWEEN 1 AND 5),
    before_score    INTEGER GENERATED ALWAYS AS (likelihood * consequence) STORED,
    after_likelihood INTEGER CHECK (after_likelihood BETWEEN 1 AND 5),
    after_consequence INTEGER CHECK (after_consequence BETWEEN 1 AND 5),
    after_score     INTEGER GENERATED ALWAYS AS (after_likelihood * after_consequence) STORED,
    matrix_version  VARCHAR(20) NOT NULL DEFAULT 'v1',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 7.6. Märgistamine (Labels)

```sql
-- Etiketimallid
CREATE TABLE label_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    country         VARCHAR(10),    -- ISO 3166-1, null = universaalne
    name            VARCHAR(255) NOT NULL,
    template_json   JSONB NOT NULL, -- Malli struktuur (väljad, paigutus, font)
    is_default      BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Etikettide prinditööd
CREATE TABLE label_print_jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id),
    template_id     UUID NOT NULL REFERENCES label_templates(id),
    item_id         UUID NOT NULL REFERENCES inventory_items(id),
    requested_by    UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    status          VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    output_key      VARCHAR(1000),  -- S3 võti genereeritud PDF-ile
    copies          INTEGER NOT NULL DEFAULT 1
);
```

### 7.7. Audit ja töövoog (Audit/Workflow)

```sql
-- Kinnitused
CREATE TABLE approvals (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    object_type         VARCHAR(50) NOT NULL,  -- 'risk_assessment', 'chemical_product', 'sds_document'
    object_id           UUID NOT NULL,
    step                INTEGER NOT NULL DEFAULT 1,
    approver_user_id    UUID NOT NULL REFERENCES users(id),
    status              VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    comment             TEXT,
    decided_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auditilogid (muutumatu)
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,  -- Ei kasuta FK-d, et log säiliks ka rentniku kustutamisel
    actor_user_id   UUID,           -- NULL = süsteemitegevus
    action          VARCHAR(100) NOT NULL, -- 'sds.viewed', 'inventory.updated', 'risk.approved' jne
    object_type     VARCHAR(50) NOT NULL,
    object_id       UUID,
    at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_address      INET,
    metadata_json   JSONB NOT NULL DEFAULT '{}'
);

-- Auditilogile ei lisata UPDATE/DELETE õigusi, ainult INSERT
```

---

## 8. API spetsifikatsioon

Süsteem eksponeerib RESTful API, mis järgib OpenAPI 3.0 spetsifikatsiooni. Kõik API otspunktid nõuavad autentimist (JWT Bearer token), välja arvatud autentimise otspunktid ise.

### 8.1. Autentimine

| Meetod | Otspunkt | Kirjeldus |
|---|---|---|
| `POST` | `/auth/token` | Vahetab SSO/OIDC koodid JWT tokeniteks |
| `POST` | `/auth/refresh` | Uuendab aegunud JWT tokeni |
| `DELETE` | `/auth/logout` | Tühistab tokeni |

### 8.2. SDS haldus

| Meetod | Otspunkt | Kirjeldus |
|---|---|---|
| `GET` | `/sds` | Ohutuskaartide otsing (`query`, `language`, `supplier`, `status` filtrid) |
| `POST` | `/sds` | Uue SDS metaandmete loomine |
| `GET` | `/sds/{id}` | Ühe SDS detailvaade |
| `PATCH` | `/sds/{id}` | SDS metaandmete uuendamine |
| `POST` | `/sds/{id}/files` | PDF faili üleslaadimine (multipart/form-data) |
| `GET` | `/sds/{id}/files/{version}` | Konkreetse versiooni allalaadimine |
| `GET` | `/sds/{id}/preview` | PDF eelvaate URL genereerimine (ajutine allkirjastatud URL) |

### 8.3. Inventuur

| Meetod | Otspunkt | Kirjeldus |
|---|---|---|
| `GET` | `/inventory/items` | Inventariühikute nimekiri (`site_id`, `location_id`, `status`, `dg_class` filtrid) |
| `POST` | `/inventory/items` | Uue inventariühiku loomine |
| `GET` | `/inventory/items/{id}` | Ühe inventariühiku detailvaade |
| `PATCH` | `/inventory/items/{id}` | Inventariühiku uuendamine |
| `POST` | `/inventory/items/{id}/decant` | Ümbervalamine (loob uue inventariühiku) |
| `GET` | `/inventory/locations` | Asukohtade puu |
| `GET` | `/inventory/manifest` | Ohtlike ainete manifest (`site_id` järgi, PDF/CSV eksport) |

### 8.4. Riskihindamine

| Meetod | Otspunkt | Kirjeldus |
|---|---|---|
| `GET` | `/risk-assessments` | Riskihinnangute nimekiri (`site_id`, `status`, `owner` filtrid) |
| `POST` | `/risk-assessments` | Uue riskihinnangu loomine |
| `GET` | `/risk-assessments/{id}` | Riskihinnangu detailvaade |
| `PATCH` | `/risk-assessments/{id}` | Riskihinnangu uuendamine |
| `POST` | `/risk-assessments/{id}/submit` | Esitamine kinnitusringile |
| `POST` | `/risk-assessments/{id}/approve` | Kinnitamine (EHS Manager / Approver) |
| `POST` | `/risk-assessments/{id}/reject` | Tagastamine muutmiseks |
| `GET` | `/risk-assessments/{id}/export` | PDF-raporti genereerimine ja allalaadimine |

### 8.5. Märgistamine

| Meetod | Otspunkt | Kirjeldus |
|---|---|---|
| `GET` | `/labels/templates` | Etiketimallide nimekiri |
| `POST` | `/labels/templates` | Uue etikettimalli loomine |
| `POST` | `/labels/print` | Etiketi printimistöö käivitamine (`item_id`, `template_id`, `copies`) |
| `GET` | `/labels/print/{job_id}` | Printimistöö staatuse kontroll |
| `GET` | `/labels/print/{job_id}/download` | Valmis PDF-etiketi allalaadimine |

### 8.6. Raportid

| Meetod | Otspunkt | Kirjeldus |
|---|---|---|
| `GET` | `/reports/manifest` | Ohtlike ainete manifest (`site_id`, `format=pdf\|csv`) |
| `GET` | `/reports/sds-coverage` | SDS katvuse raport (puuduvad/aegunud SDS-id) |
| `GET` | `/reports/risk-register` | Riskihinnangute register |
| `GET` | `/reports/inventory` | Inventuuri kokkuvõtteraport |

---

## 9. Kinnituste ja töövoogude loogika

Süsteem toetab mitmeastmelisi kinnitusprotsesse, mis on konfigureeritavad rentniku tasemel. Allpool on kirjeldatud riskihinnangu kinnitusprotsess, mis on kõige keerulisem töövoog.

![Riskihinnangu Kinnitusprotsess](workflow_diagram.png)

Riskihinnangu elutsükkel koosneb järgmistest olekutest:

| Olek | Kirjeldus | Lubatud tegevused |
|---|---|---|
| `draft` | Mustand, koostaja töötab | Muutmine, esitamine |
| `under_review` | EHS juhi ülevaatamisel | Kinnitamine, tagastamine |
| `approved` | Kinnitatud, kehtiv | PDF eksport, arhiveerimine |
| `archived` | Arhiveeritud (asendatud uuemaga) | Ainult lugemine |

Teavitused saadetakse automaatselt järgmistel sündmustel: riskihinnangu esitamisel (EHS juhile), kinnitamisel või tagastamisel (koostajale), ning aegumise lähenemisel (vastutajale).

---

## 10. MVP arendusplaan

Arendus on jaotatud kolme etappi, et tagada kiireim väärtuse pakkumine ja võimaldada tagasiside kogumist varajases faasis. Iga etapp lõpeb toimiva tarkvaraversiooniga, mida saab kasutajatele demonstreerida.

### 10.1. Scope tasemed

Et vältida olukorda, kus üks dokument segab kokku MVP, hilisema tootelaienduse ja enterprise taseme nõuded, kasutatakse ChemRegis järgnevat scope-jaotust.

| Tase | Eesmärk | Sisu |
|---|---|---|
| **Pilot-ready MVP** | Viia toode usaldusväärse esimese kliendi/piloodi tasemele | login + JWT/refresh tokenid, rollipõhine ligipääs MVP ulatuses, SDS põhitöövood, chemical registry, inventuur ja asukohad, baas-riskihinnang, vähemalt üks etiketi/PDF väljund, põhiraportid, testitav deploy |
| **Post-MVP** | Tugevdada kasutusmugavust ja vähendada käsitööd | riskimallid, mobiilne inventuur, QR/vöötkood, täpsemad teavitused, laiendatud otsing, täiendavad raportid, parem UX-polish |
| **Enterprise-only** | Suurte organisatsioonide ja rangema IT-governance vajadused | SAML/SSO, kohustuslik MFA, eraldi otsinguplatvorm, regulatiivsete nimekirjade automaatne import, kõrgemad SLA-d, keerukam multi-tenant operatsioonimudel |

Kõik järgmised peatükid kasutavad seda jaotust vaikimisi: kui funktsioon ei ole eraldi märgitud pilot-ready MVP osaks, ei tohi seda käsitleda MVP väljalaske blokeerijana.

### MVP-1 (Nädalad 1–6): Põhifunktsionaalsus

MVP-1 eesmärk on luua töötav SDS teek ja kemikaaliregister, mis on platvormi kõige kriitilisemad komponendid.

| Ülesanne | Kirjeldus | Prioriteet |
|---|---|---|
| Projekti seadistus | Monorepo, CI/CD, arenduskeskkond (Docker Compose) | Kriitiline |
| Autentimine | SSO (OIDC), JWT, RBAC middleware | Kriitiline |
| Andmebaasi skeem | Core, SDS, Chemicals, Inventory tabelid | Kriitiline |
| SDS üleslaadimine | PDF upload, metaandmed, S3 salvestus | Kriitiline |
| SDS otsing | OpenSearch integratsioon, täistekstotsing | Kõrge |
| Versioonihaldus | SDS versioonide haldamine, aktiivne versioon | Kõrge |
| Kemikaaliregister | Toodete kataloog, ainete andmebaas | Kõrge |
| Inventuur | Inventariühikute CRUD, asukohtade puu | Kõrge |
| Etiketid | Eeldefineeritud mallid, PDF genereerimine | Keskmine |
| Põhiraportid | Registri CSV/PDF eksport, SDS katvuse raport | Keskmine |

### MVP-2 (Nädalad 7–11): Tööprotsessid

MVP-2 lisab riskihindamise mooduli ja kinnitusprotsessid.

| Ülesanne | Kirjeldus | Prioriteet |
|---|---|---|
| Riskihindamise moodul | Wizard, stsenaariumid, kontrollmeetmed, reiting | Kriitiline |
| Kinnitusring | Mitmeastmeline kinnitusvoog | Kõrge |
| PDF raport | Riskihinnangu PDF genereerimine | Kõrge |
| Teavitused | E-posti teavitused (BullMQ + SendGrid) | Kõrge |
| Rakendusesisesed teavitused | In-app notifikatsioonid | Keskmine |
| Mallid | Riskihindamise mallid | Keskmine |

### MVP-3 (Nädalad 12–16): Vastavus ja mobiilsus

MVP-3 lisab regulatiivse vastavuse ja mobiilse inventuuri.

| Ülesanne | Kirjeldus | Prioriteet |
|---|---|---|
| Vastavusmoodul | Regulatiivsete nimekirjade import, automaatne märgistamine | Kõrge |
| Riigiprofiilid | Riigipõhised seadistused (keel, etiketimall) | Kõrge |
| Mobiilne inventuur | Reageeriv disain, QR/vöötkoodi skaneerimise tugi | Kõrge |
| Auditilogide vaade | Auditilogide filtreeritav vaade | Keskmine |
| Kasutusstatistika | Administraatori statistika vaated | Madal |

---

## 11. Testimis- ja kvaliteedikriteeriumid

Kvaliteedi tagamiseks tuleb läbi viia põhjalik testimine, mis katab nii funktsionaalsed kui ka mittefunktsionaalsed nõuded. Eesmärk on saavutada vähemalt 85% koodikatvus ühiktestidega.

### 11.1. Testimisstrateegia

| Testimise tüüp | Tööriist | Eesmärk |
|---|---|---|
| **Ühiktestid** | Jest (backend), Vitest (frontend) | Äriloogika ja utiliitide testimine |
| **Integratsioonitestid** | Supertest + testcontainers | API otspunktide ja andmebaasi testimine |
| **E2E testid** | Playwright | Kriitiliste kasutajavoogude testimine |
| **Jõudlustestid** | k6 | Otsingu ja API vastusaegade testimine |
| **Visuaalsed regressioonitestid** | Chromatic / Percy | Etikettide ja UI komponentide visuaalne kontroll |

### 11.2. Kriitilised testjuhtumid

Järgmised testjuhtumid on kohustuslikud enne iga versiooni väljalaskmist:

**Pääsuõiguste testimine:** Tuleb veenduda, et kasutajad näevad ja haldavad ainult neid andmeid, millele neil on õigus. Näiteks ei tohi Saidi A kasutaja näha Saidi B inventuuri, isegi kui ta teab inventariühiku ID-d.

**SDS versioonihalduse testimine:** Ohutuskaardi aktiivne versioon peab olema üheselt mõistetav ja kuvatud korrektselt kõikides seotud vaadetes — inventuuri detailvaates, riskihinnangus ja etiketil.

**Andmete terviklikkuse testimine:** Inventuuri koguste muutused peavad olema jälgitavad auditilogis ja vastama tegelikele tegevustele. Auditilogist ei tohi puududa ühtegi kirjet.

**Riskihinnangu PDF-i reprodutseeritavuse testimine:** Genereeritud PDF-raportid peavad olema reprodutseeritavad — sama sisendandmetega peab alati genereerima identse väljundi.

**Etiketi visuaalse vastavuse testimine:** Prinditud etiketid peavad visuaalselt vastama valitud mallile. Soovitatav on kasutada visuaalse regressiooni testimise tööriistu (nt Chromatic).

---

## 12. Glossaar

| Mõiste | Selgitus |
|---|---|
| **SDS** | Safety Data Sheet — ohutuskaart, mis sisaldab teavet kemikaali ohtude, käitlemise ja hädaabimeetmete kohta. |
| **GHS** | Globally Harmonized System — kemikaalide klassifitseerimise ja märgistamise ülemaailmne ühtlustatud süsteem. |
| **CAS number** | Chemical Abstracts Service number — unikaalne numbriline identifikaator keemilisele ainele. |
| **EC number** | European Community number — Euroopa Liidus kasutatav kemikaali identifikaator (EINECS/ELINCS). |
| **REACH** | Registration, Evaluation, Authorisation and Restriction of Chemicals — EL-i kemikaalide registreerimise määrus. |
| **SVHC** | Substances of Very High Concern — väga ohtlikud ained REACH-i tähenduses. |
| **CLP** | Classification, Labelling and Packaging — EL-i kemikaalide klassifitseerimise, märgistamise ja pakendamise määrus. |
| **DG** | Dangerous Goods — ohtlikud kaubad, mille transport on reguleeritud (ADR, IATA, IMDG). |
| **UN number** | United Nations number — neljakohaline number ohtlike ainete identifitseerimiseks transpordis. |
| **RBAC** | Role-Based Access Control — rollipõhine pääsukontroll. |
| **SSO** | Single Sign-On — ühekordne sisselogimine, mis võimaldab kasutajal autentida end ühe korraga mitme süsteemi jaoks. |
| **OIDC** | OpenID Connect — autentimisprotokoll, mis põhineb OAuth 2.0-l. |
| **SAML** | Security Assertion Markup Language — XML-põhine autentimisstandard SSO jaoks. |
| **MFA** | Multi-Factor Authentication — mitmefaktoriline autentimine. |
| **WORM** | Write Once, Read Many — andmesalvestuse põhimõte, kus andmeid saab kirjutada ainult üks kord. |
| **RPO** | Recovery Point Objective — maksimaalne lubatav andmekadu katastroofi korral (ajas mõõdetuna). |
| **RTO** | Recovery Time Objective — maksimaalne lubatav taastumisaeg katastroofi korral. |
| **i18n** | Internationalisation — tarkvara kohandamine eri keelte ja regioonide jaoks. |
| **PPE** | Personal Protective Equipment — isikukaitsevahendid. |
| **EHS** | Environment, Health and Safety — keskkond, tervishoid ja ohutus. |
| **ETL** | Extract, Transform, Load — andmete ekstraheerimise, teisendamise ja laadimise protsess. |
| **MVP** | Minimum Viable Product — minimaalne elujõuline toode, mis sisaldab ainult põhifunktsionaalsust. |
| **SLA** | Service Level Agreement — teenustaseme leping, mis määrab käideldavuse ja jõudluse nõuded. |
