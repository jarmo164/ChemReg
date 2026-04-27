# ChemReg backend

Spring Boot backend ChemRegi jaoks.

## Stack
- Java 21
- Spring Boot 4.0.3
- Spring Security
- Spring Data JPA
- Flyway
- PostgreSQL
- Apache PDFBox

## Mida see kiht praegu teeb
- auth login / refresh / logout
- tenant-scoped chemical product CRUD
- tenant-scoped SDS CRUD
- SDS file upload / preview / download
- SDS PDF assistive extraction draftiks
- site / location / inventory baasvood

## Useful commands

Run locally:
```bash
./gradlew bootRun --args='--spring.profiles.active=local'
```

Run tests:
```bash
./gradlew test
```

Run targeted SDS extraction test:
```bash
./gradlew test --tests com.chemreg.chemreg.sds.service.SdsPdfExtractionServiceTest
```

Build jar for Docker image:
```bash
./gradlew bootJar
```

## Notes
- current Docker image copies in `build/libs/*.jar`, so `bootJar` must exist before image build
- scanned/OCR-only SDS PDF support is not part of current MVP slice
