package com.chemreg.chemreg.common.exception;

import org.junit.jupiter.api.Test;
import org.springframework.dao.RecoverableDataAccessException;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void mapsDataAccessFailureToServiceUnavailable() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/chemical-products");

        ResponseEntity<ApiErrorResponse> response = handler.handleDataAccess(
                new RecoverableDataAccessException("database down"),
                request
        );

        assertEquals(503, response.getStatusCode().value());
        assertEquals("Data store unavailable. Please try again shortly.", response.getBody().getMessage());
        assertEquals("/api/chemical-products", response.getBody().getPath());
    }
}
