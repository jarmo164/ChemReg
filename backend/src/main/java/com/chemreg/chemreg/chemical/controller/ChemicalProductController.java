package com.chemreg.chemreg.chemical.controller;

import com.chemreg.chemreg.chemical.dto.ChemicalProductResponse;
import com.chemreg.chemreg.chemical.dto.SaveChemicalProductRequest;
import com.chemreg.chemreg.chemical.service.ChemicalProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chemical-products")
public class ChemicalProductController {

    private final ChemicalProductService chemicalProductService;

    public ChemicalProductController(ChemicalProductService chemicalProductService) {
        this.chemicalProductService = chemicalProductService;
    }

    @GetMapping
    public ResponseEntity<List<ChemicalProductResponse>> list() {
        return ResponseEntity.ok(chemicalProductService.listAllForStubTenant());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChemicalProductResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(chemicalProductService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ChemicalProductResponse> create(@Valid @RequestBody SaveChemicalProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chemicalProductService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChemicalProductResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody SaveChemicalProductRequest request
    ) {
        return ResponseEntity.ok(chemicalProductService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        chemicalProductService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
