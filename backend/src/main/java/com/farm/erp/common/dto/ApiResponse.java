package com.farm.erp.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Standard API response wrapper
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    @io.swagger.v3.oas.annotations.media.Schema(description = "성공 여부", example = "true")
    private boolean success;

    @io.swagger.v3.oas.annotations.media.Schema(description = "응답 코드", example = "0000")
    private String code;

    @io.swagger.v3.oas.annotations.media.Schema(description = "응답 메시지", example = "Success")
    private String message;

    @io.swagger.v3.oas.annotations.media.Schema(description = "응답 데이터")
    private T data;

    @Builder.Default
    @io.swagger.v3.oas.annotations.media.Schema(description = "응답 시간")
    private LocalDateTime timestamp = LocalDateTime.now();

    /**
     * Create success response with data
     */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .code("0000")
                .message("Success")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create success response with custom message
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .code("0000")
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create success response without data
     */
    public static <T> ApiResponse<T> success() {
        return ApiResponse.<T>builder()
                .success(true)
                .code("0000")
                .message("Success")
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create error response
     */
    public static <T> ApiResponse<T> error(String code, String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(code)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create error response with data
     */
    public static <T> ApiResponse<T> error(String code, String message, T data) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(code)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
