package com.chemreg.chemreg.auth.dto;

import com.chemreg.chemreg.user.dto.UserResponse;

import java.time.OffsetDateTime;

public class LoginResponse {

    private boolean authenticated;
    private String message;
    private OffsetDateTime loggedInAt;
    private UserResponse user;
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private OffsetDateTime accessTokenExpiresAt;

    public boolean isAuthenticated() {
        return authenticated;
    }

    public void setAuthenticated(boolean authenticated) {
        this.authenticated = authenticated;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public OffsetDateTime getLoggedInAt() {
        return loggedInAt;
    }

    public void setLoggedInAt(OffsetDateTime loggedInAt) {
        this.loggedInAt = loggedInAt;
    }

    public UserResponse getUser() {
        return user;
    }

    public void setUser(UserResponse user) {
        this.user = user;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public OffsetDateTime getAccessTokenExpiresAt() {
        return accessTokenExpiresAt;
    }

    public void setAccessTokenExpiresAt(OffsetDateTime accessTokenExpiresAt) {
        this.accessTokenExpiresAt = accessTokenExpiresAt;
    }
}
