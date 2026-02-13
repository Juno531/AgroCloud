package com.farm.erp.core.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private UserDto user;

    public AuthResponse(String token, UserDto user) {
        this.token = token;
        this.user = user;
    }
}
