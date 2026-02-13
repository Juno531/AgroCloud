package com.farm.erp.core.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String email;
    private String password;
    private String name;
    private String inviteCode;
    private String registerType; // "admin" or "worker"

    // 작업자 가입 시 농장 초대 코드
    private String farmInviteCode;
}
