package com.farm.erp.core.auth.dto;

import com.farm.erp.core.auth.domain.User;
import lombok.Getter;

@Getter
public class UserDto {
    private Long id;
    private String email;
    private String name;
    private String role;
    private Long farmId;
    private Long companyId;
    private String companyCode;

    public UserDto(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.name = user.getName();
        this.role = user.getRole().name();
        if (user.getCompany() != null) {
            this.companyId = user.getCompany().getId();
            this.companyCode = user.getCompany().getCode();
        }
    }

    public UserDto(User user, Long farmId) {
        this(user);
        this.farmId = farmId;
    }
}
