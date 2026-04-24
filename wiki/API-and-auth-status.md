# API and auth status

## Auth/session model
Frontend kasutab nüüd päris sessioonimudelit:
- `accessToken`
- `refreshToken`
- `tokenType`
- `accessTokenExpiresAt`
- `user`

`frontend/src/api/apiClient.ts` teeb:
- bearer headeri lisamise
- refresh tokeniga access tokeni uuenduse enne päringut, kui token on aegunud
- ühe 401 retry pärast refreshi
- sessiooni puhastamise, kui refresh ebaõnnestub

## Backend authorization
MVP rollireeglid on tsentraliseeritud `AuthorizationRules` klassi:
- `MVP_READ_ROLES`: Org Admin, EHS Manager, Site Manager, User, Auditor, Supplier
- `MVP_MANAGE_ROLES`: Org Admin, EHS Manager, Site Manager

## SDS storage contract
Praegune MVP storage contract on local filesystem-based:
- binaar kirjutatakse serveri lokaalsesse storage root kausta
- `sds_files.s3_key` sisaldab storage key'd, mitte garantiid AWS S3 kasutusest
- uus upload märgib eelmise faili mitte-current versiooniks
- see jätab hilisema MinIO/S3 adapteri vahetuse avatuks ilma SDS API kuju murdmata

## Tenant/site/location scope
MVP-s kehtib järgmine scope:
- tenant on primaarne eralduspiir kõikidele domeeniandmetele
- direct-object access peab alati olema tenant-scoped repository/service lookupiga
- SDS file access käib ainult läbi tenant-scoped SDS document lookupi
- site/location scope on järgmine kitsendus inventuuri ja riski voogudes, mitte tenanti asendus

## Current live API surface
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/users`
- `GET/POST/PUT/DELETE /api/chemical-products`
- `GET/POST/PUT /api/sds-documents`
- `POST /api/sds-documents/{id}/files`
- `GET /api/sds-documents/{documentId}/files/{fileId}/download`
- `GET /api/sds-documents/{documentId}/files/{fileId}/preview`
