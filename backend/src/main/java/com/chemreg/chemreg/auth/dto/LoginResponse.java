package com.chemreg.chemreg.auth.dto;

import com.chemreg.chemreg.user.dto.UserResponse;

import java.time.OffsetDateTime;

public class LoginResponse {

    private boolean authenticated;
    private String message;
    private OffsetDateTime loggedInAt;
    private UserResponse user;

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
}
