package com.chemreg.chemreg.inventory.controller;

import com.chemreg.chemreg.inventory.dto.InventoryItemResponse;
import com.chemreg.chemreg.inventory.dto.SaveInventoryItemRequest;
import com.chemreg.chemreg.inventory.service.InventoryItemService;
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
@RequestMapping("/api/inventory-items")
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    public InventoryItemController(InventoryItemService inventoryItemService) {
        this.inventoryItemService = inventoryItemService;
    }

    @GetMapping
    public ResponseEntity<List<InventoryItemResponse>> list() {
        return ResponseEntity.ok(inventoryItemService.listAllForCurrentTenant());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InventoryItemResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(inventoryItemService.getById(id));
    }

    @PostMapping
    public ResponseEntity<InventoryItemResponse> create(@Valid @RequestBody SaveInventoryItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryItemService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryItemResponse> update(@PathVariable UUID id, @Valid @RequestBody SaveInventoryItemRequest request) {
        return ResponseEntity.ok(inventoryItemService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        inventoryItemService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
