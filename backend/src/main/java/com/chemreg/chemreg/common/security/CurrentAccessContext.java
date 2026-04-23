package com.chemreg.chemreg.common.security;

import com.chemreg.chemreg.common.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class CurrentAccessContext {

    public UUID currentTenantId() {
        Object tenantIdClaim = currentJwt().getClaim("tenantId");
        if (tenantIdClaim == null) {
            throw new UnauthorizedException("Authenticated tenant scope is missing.");
        }

        return UUID.fromString(tenantIdClaim.toString());
    }

    private Jwt currentJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication instanceof JwtAuthenticationToken jwtAuthenticationToken)) {
            throw new UnauthorizedException("Authenticated JWT context is required.");
        }

        return jwtAuthenticationToken.getToken();
    }
}
