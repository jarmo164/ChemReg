# ChemReg Backlog

Prioriteetne backlog, mis on tuletatud `KEMIKAALIHALDUS_ARENDUSDOKUMENTATSIOON.md` sihtpildist ja reaalsest `test` haru seisust.

Eesmärk: viia ChemReg demo-/karkassitasemest **pilot-ready MVP** seisuni.

## Kuidas seda backlogi lugeda

- **P0** = blokeeriv; ilma selleta ei ole mõistlik toodet valmis nimetada
- **P1** = väga oluline järgmine kiht, et põhitöövood oleksid päriselt kasutatavad
- **P2** = väärtuslik, aga võib tulla pärast MVP tuuma valmimist
- **Done when** kirjeldab minimaalset lõpetamiskriteeriumi

---

## P0 — Source of truth, security, core platform

### 1. Joonda dokumentatsioon reaalse stackiga
**Miks:** suur arendusdokk kirjeldab NestJS arhitektuuri, aga repo kasutab Spring Boot + React. See tekitab valeplaani.

**Tasks**
- kirjuta ümber arhitektuuri osa nii, et see vastaks päris repole
- jaga scope kolmeks: MVP / post-MVP / enterprise-only
- märgi selgelt, millised integratsioonid on praegu kohustuslikud ja millised edasi lükatud

**Done when**
- README, wiki ja arendusdokk räägivad sama juttu
- tiim saab ühe pilguga aru, mis on MVP scope

### 2. Paranda autentimine ja sessioonimudel
**Miks:** frontend kasutab praegu lihtsustatud auth-mudelit; see ei ole production-ready.

**Tasks**
- vii frontend üle päris access/refresh token mudelile
- lisa 401/refresh/re-login voog
- ühtlusta auth state haldus kogu rakenduses

**Done when**
- login, refresh, logout ja sessiooni taastamine töötavad usaldusväärselt
- frontend ei kasuta enam demo-laadset tokeni asendust

### 3. Rakenda backendis päris autoriseerimine
**Miks:** valmis UI ilma backend enforcement’ita on turvaauk, mitte funktsioon.

**Tasks**
- kaitse endpointid rollide ja scope'idega
- lisa tenant/site/location taseme autoriseerimisreeglid
- kata direct-object-access juhtumid testidega

**Done when**
- kasutaja ei pääse API kaudu ligi objektidele, milleks tal õigust pole
- rollimaatriks on testidega tõestatud vähemalt MVP ulatuses

### 4. Standardiseeri backend foundation
**Miks:** enne suuremate moodulite lõpetamist peab põhi olema stabiilne.

**Tasks**
- ühtne error response formaat
- DTO validation ja sisendi range kontroll
- migratsioonide korrastamine
- keskkonnamuutujate ja profiilide selge leping

**Done when**
- API käitub järjepidevalt veaolukordades
- lokaal / dev / deploy config on arusaadav ja korratav

---

## P0 — Core product flows

### 5. Tee SDS moodul päriselt backendiga töötavaks
**Miks:** SDS on toote tuum, aga praegu on frontendis palju seeded/demo käitumist.

**Tasks**
- loo SDS entity/model, service ja controllerid
- toeta create/list/detail/update/upload/download/preview voogu
- toeta versioonihaldust ja aktiivset versiooni
- asenda frontendis hardcoded/seeded SDS vaated live API-ga

**Done when**
- kasutaja saab SDS-i üles laadida, näha, uuendada ja alla laadida päris andmete pealt
- üks aktiivne versioon on selgelt määratud

### 6. Laienda chemical product management MVP tasemeni
**Miks:** chemical registry ei saa olla ainult õhuke CRUD, kui sellest sõltuvad SDS, inventory, labels ja risk.

**Tasks**
- lisa vajalikud väljad: manufacturer, SKU, hazard metadata, ainekoosseisu miinimum
- seo tooted SDS-ide ja inventari kirjetega
- tee chemical register UI pärisandmetega kasutatavaks

**Done when**
- chemical product kirje on piisav, et seda kasutada SDS, inventory ja label voogudes
- chemical register ei ole enam placeholder

### 7. Implementi sites + locations + inventory
**Miks:** ilma inventuurita ei ole ChemReg kemikaalihaldus, vaid lihtsalt andmekataloog.

**Tasks**
- saidid ja hierarhilised asukohad
- inventory item CRUD
- kogus, ühik, staatus, aegumine, märkused
- toote ja asukoha seosed
- inventuuri UI tabeli/filtri vaade

**Done when**
- kasutaja saab luua ja hallata inventariühikuid pärisandmete pealt
- location context töötab läbivalt

### 8. Too vähemalt üks töötav report/export flow
**Miks:** kasutatavus ilma väljundita jääb poolikuks.

**Tasks**
- vali MVP jaoks kohustuslikud raportid: inventory export, SDS coverage, manifest
- tee vähemalt CSV/PDF baasväljundid

**Done when**
- vähemalt kriitilised raportid tulevad backendist pärisandmete pealt

---

## P1 — Workflow layer

### 9. Ehita risk assessment workflow valmis
**Miks:** riskihindamine on üks põhiväärtusi, aga repo seisus on see sisuliselt placeholder.

**Tasks**
- risk assessment domain model
- CRUD API
- scenario / control measure / rating struktuur
- frontend wizard või vähemalt kasutatav vormivoog

**Done when**
- risk assessmenti saab luua, muuta, vaadata ja salvestada
- voog ei ole enam demo placeholder

### 10. Lisa approval workflow
**Miks:** riskihinnang ilma kinnitusringita ei täida dokumenteeritud äriloogikat.

**Tasks**
- submit / approve / reject staatused
- rollipõhised transitionid
- activity/audit kirjed kinnitustele

**Done when**
- kinnitusring töötab vähemalt MVP rollidega
- ainult õiged rollid saavad olekut muuta

### 11. Genereeri risk assessment PDF
**Miks:** dokumenteeritud väljund on päris kasutuse jaoks vajalik.

**Tasks**
- backend export service
- kujundatud printable output
- eksporditav ainult lubatud seisudes

**Done when**
- kinnitatud riskihinnangust saab genereerida stabiilse PDF väljundi

### 12. Audit log kriitilistele tegevustele
**Miks:** jälgitavus on kemikaali- ja ohutustarkvaras põhifunktsioon, mitte nice-to-have.

**Tasks**
- logi auth sündmused
- logi SDS muudatused
- logi inventory muudatused
- logi approval sündmused

**Done when**
- kriitiliste tegevuste kohta jääb alles kontrollitav audit trail

---

## P1 — Labels, notifications, operational trust

### 13. Tee üks päriselt kasutatav label flow
**Miks:** etikett on üks praktilisemaid väljundeid ja peab jooksma pärisandmete peal.

**Tasks**
- vali 1 MVP mall
- seo label chemical + SDS + inventory andmetega
- genereeri PDF väljund

**Done when**
- vähemalt üks label template on reaalselt kasutatav

### 14. Lisa teavitused olulistele workflow sündmustele
**Miks:** ilma teavitusteta jäävad review ja SDS elutsükli vood uimaseks.

**Tasks**
- risk approval notificationid
- SDS muutuse / uuenduse teavitusbaas
- minimaalne delivery mehhanism

**Done when**
- süsteem teavitab vähemalt kriitilistel hetkedel õigeid rolle

### 15. Otsusta storage/search/background-jobs MVP piir
**Miks:** dokk eeldab S3/OpenSearch/queue’d, aga need tuleb kas päriselt teha või teadlikult edasi lükata.

**Tasks**
- otsusta: S3/MinIO nüüd või local/dev abstractioniga
- otsusta: lihtotsing DB pealt või päris search engine
- otsusta: async tööde MVP vajadus

**Done when**
- integratsioonide osas on teadlik arhitektuuriotsus, mitte hägune “kunagi lisame”

---

## P1 — Quality gates

### 16. Tõsta backend testikate kriitiliste voogude jaoks
**Miks:** ilma testideta lähevad auth ja workflow regressioonid kohe käest ära.

**Tasks**
- auth testid
- authorization testid
- SDS integratsioonitestid
- inventory testid
- risk workflow testid

**Done when**
- kriitilised backend vood on automaatselt valideeritud

### 17. Lisa frontend testid päris happy pathidele
**Miks:** placeholder-ajastu testid ei kaitse toodet.

**Tasks**
- login/session flow
- SDS list/detail/create põhitestid
- inventory/risk põhitestid

**Done when**
- frontend testid katavad vähemalt peamised kasutajateekonnad

### 18. Lisa vähemalt üks E2E suite
**Miks:** ChemReg vajab tõendit, et frontend + backend + DB töötavad koos.

**Tasks**
- login -> SDS/product -> inventory -> risk happy path

**Done when**
- üks täisvoog jookseb automaatselt läbi

### 19. Muuda CI päris gate’iks
**Miks:** deploy ei tohi toimuda “ehk buildis”.

**Tasks**
- eemalda backend buildist testide vahelejätmine
- lisa frontend testide samm
- lisa build + test kohustuslikud kontrollid enne deployd

**Done when**
- katkine build või test ei jõua deploy etappi

---

## P2 — MVP+ / post-MVP

### 20. Mobiilne inventuur ja QR/vöötkood
**Done when**
- kasutaja saab mobiilis inventuuri teha ja skaneerida

### 21. Compliance moodul ja regulatiivsed nimekirjad
**Done when**
- vähemalt üks regulatiivne nimekiri on imporditav ja seotud toodetega

### 22. Riigiprofiilid, i18n ja lokaliseerimine
**Done when**
- mitmekeelsus ja riigipõhised seadistused on kasutatavad vähemalt baasulatuses

### 23. SSO / SAML / MFA enterprise tasemel
**Done when**
- enterprise auth laiendused on integreeritud ja dokumenteeritud

### 24. Advanced reporting / usage analytics
**Done when**
- admin saab usaldusväärseid kasutus- ja kvaliteedinäitajaid

---

## Release checklist before calling ChemReg “ready”

ChemReg ei ole valmis enne, kui allolev on täidetud:

- [ ] dokumentatsioon vastab reaalsele arhitektuurile
- [ ] auth + RBAC toimib nii UI-s kui API-s
- [ ] SDS workflow töötab pärisandmetega
- [ ] chemical registry töötab pärisandmetega
- [ ] inventory + locations töötab pärisandmetega
- [ ] risk assessment + approval workflow töötab
- [ ] vähemalt baasraportid / label output on olemas
- [ ] audit trail katab kriitilised tegevused
- [ ] backend + frontend + E2E testid jooksevad CI-s
- [ ] deploy/runbook/backup/rollback juhised on olemas

---

## Soovituslik tööjärjekord

1. Source of truth + auth/RBAC
2. SDS
3. Chemical registry
4. Inventory + locations
5. Reports/labels baasvood
6. Risk assessment
7. Approval + audit + notifications
8. CI/test/release hardening
9. Post-MVP laiendused
