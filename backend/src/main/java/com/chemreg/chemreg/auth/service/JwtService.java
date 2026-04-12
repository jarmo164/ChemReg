package com.chemreg.chemreg.auth.service;

import com.chemreg.chemreg.common.config.JwtProperties;
import com.chemreg.chemreg.user.entity.User;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final JwtProperties jwtProperties;

    public JwtService(JwtEncoder jwtEncoder, JwtProperties jwtProperties) {
        this.jwtEncoder = jwtEncoder;
        this.jwtProperties = jwtProperties;
    }

    public IssuedAccessToken createAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(jwtProperties.accessTokenMinutes(), ChronoUnit.MINUTES);

        String authority = "ROLE_" + user.getRole().name().toUpperCase(Locale.ROOT);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(jwtProperties.issuer())
                .issuedAt(now)
                .expiresAt(expiresAt)
                .subject(user.getId().toString())
                .id(UUID.randomUUID().toString())
                .claim("tenantId", user.getTenant().getId().toString())
                .claim("email", user.getEmail())
                .claim("authorities", List.of(authority))
                .build();

        JwsHeader jwsHeader = JwsHeader.with(MacAlgorithm.HS256).type("JWT").build();

        String token = jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();

        return new IssuedAccessToken(
                token,
                OffsetDateTime.ofInstant(expiresAt, ZoneOffset.UTC)
        );
    }

    public record IssuedAccessToken(
            String token,
            OffsetDateTime expiresAt
    ) {
    }
}