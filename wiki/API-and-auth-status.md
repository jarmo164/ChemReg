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

## Chemical product downstream metadata
MVP chemical product API kannab nuud minimaalselt kaasa:
- identifikaatorid: `name`, `productCode`, `casNumber`, `ecNumber`
- SDS/label context: `supplierName`, `signalWord`, `physicalState`, `sdsDocumentId`
- inventory/risk defaults: `defaultUnit`, `storageClass`, `useDescription`, `restricted`

## Site and hierarchical location API
Praegune backend slice katab:
- site list/create/update tenant scope'is
- location list/create/update konkreetse site all
- parent location võib olla ainult sama tenant'i sama site'i sees
- see loob reaalse aluse 4.2 inventory item CRUD jaoks

## Inventory item API
Praegune backend slice katab:
- inventory item list/detail/create/update/delete tenant scope'is
- item seotakse alati tenant-scoped producti ja location'iga
- payload sisaldab `quantity`, `unit`, `status`, `containerType`, `barcode`, `qrCode`, `lotNumber`, `openedAt`, `expiryDate`, `minStock`
- response tagastab lisaks `productName` ja `locationName`, et UI saaks kohe reaalse register-vaate ehitada

## Inventory frontend status
Praegune frontend slice katab:
- eraldi `Inventory Register` route: `/inventory`
- live laadimine `chemical-products`, `sites`, `locations`, `inventory-items` API-de pealt
- inventory item create/update/delete dialog päris backendiga
- otsing, status-filter ja basic low-stock summary chipid

## Tenant/site/location scope
MVP-s kehtib järgmine scope:
- tenant on primaarne eralduspiir kõikidele domeeniandmetele
- direct-object access peab alati olema tenant-scoped repository/service lookupiga
- SDS file access käib ainult läbi tenant-scoped SDS document lookupi
- site/location scope on järgmine kitsendus inventuuri ja riski voogudes, mitte tenanti asendus
- site/location API enforce'b tenant scope'i ja parent-location peab kuuluma samasse site'i

## Current live API surface
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/users`
- `GET/POST/PUT/DELETE /api/chemical-products`
  - payload/response sisaldab nuud ka `productCode`, `supplierName`, `defaultUnit`, `storageClass`, `useDescription`, `sdsDocumentId`
- `GET/POST/PUT /api/sds-documents`
- `POST /api/sds-documents/{id}/files`
- `GET /api/sds-documents/{documentId}/files/{fileId}/download`
- `GET /api/sds-documents/{documentId}/files/{fileId}/preview`
- `GET/POST/PUT /api/sites`
- `GET/POST/PUT /api/sites/{siteId}/locations`
- `GET/POST/PUT/DELETE /api/inventory-items`
