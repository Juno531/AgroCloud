package com.farm.erp.api.v1.controller;

import com.farm.erp.core.auth.dto.AuthResponse;
import com.farm.erp.core.auth.dto.LoginRequest;
import com.farm.erp.core.auth.dto.RegisterRequest;
import com.farm.erp.core.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Diagnostic endpoint to detect if POST is redirected to GET (causing 405)
     */
    @GetMapping("/login")
    public ResponseEntity<String> loginGetDiagnostic() {
        log.warn(
                "GET request received for /login - This usually indicates an infrastructure redirect (HTTP->HTTPS) converted POST to GET");
        return ResponseEntity.status(405)
                .body("405 Method Not Allowed: You sent a GET request to /login. If you intended a POST, your request might have been redirected by HTTPS enforcement.");
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/me")
    public ResponseEntity<com.farm.erp.core.auth.dto.UserDto> getMe(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        return ResponseEntity.ok(authService.me(userDetails.getUsername()));
    }

    @PostMapping("/change-password")
    public ResponseEntity<com.farm.erp.common.dto.ApiResponse<Void>> changePassword(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @jakarta.validation.Valid @RequestBody com.farm.erp.core.auth.dto.ChangePasswordRequest request) {
        authService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(com.farm.erp.common.dto.ApiResponse.success("비밀번호가 성공적으로 변경되었습니다.", null));
    }

    @PostMapping("/verify-password")
    public ResponseEntity<com.farm.erp.common.dto.ApiResponse<Void>> verifyPassword(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @jakarta.validation.Valid @RequestBody com.farm.erp.core.auth.dto.PasswordVerifyRequest request) {

        // DEBUG LOG
        System.out.println("DEBUG: verifyPassword called");
        if (userDetails != null) {
            System.out.println("DEBUG: userDetails username = " + userDetails.getUsername());
        } else {
            System.out.println("DEBUG: userDetails is NULL");
        }
        System.out.println("DEBUG: password provided = " + (request.getPassword() != null ? "***" : "NULL"));

        if (userDetails == null) {
            throw new RuntimeException("인증 정보가 없습니다.");
        }
        authService.verifyPassword(userDetails.getUsername(), request.getPassword());
        return ResponseEntity.ok(com.farm.erp.common.dto.ApiResponse.success("비밀번호가 확인되었습니다.", null));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(
            @RequestBody com.farm.erp.core.auth.dto.RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request.getRefreshToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<com.farm.erp.common.dto.ApiResponse<Void>> logout(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        if (userDetails != null) {
            authService.logout(userDetails.getUsername());
        }
        return ResponseEntity.ok(com.farm.erp.common.dto.ApiResponse.success("로그아웃 되었습니다.", null));
    }
}
