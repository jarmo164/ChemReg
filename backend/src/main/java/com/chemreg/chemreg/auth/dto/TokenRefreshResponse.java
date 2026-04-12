package com.chemreg.chemreg.auth.dto;

import java.time.OffsetDateTime;

public record TokenRefreshResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        OffsetDateTime accessTokenExpiresAt
) {
}