package com.farm.erp.core.auth.dto;

import com.farm.erp.core.auth.domain.User;
import lombok.Getter;

@Getter
public class UserDto {
    private Long id;
    private String email;
    private String name;
    private String role;

    public UserDto(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.name = user.getName();
        this.role = user.getRole().name();
    }
}
