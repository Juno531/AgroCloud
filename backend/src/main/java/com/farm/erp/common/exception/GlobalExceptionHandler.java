package com.farm.erp.common.exception;

import com.farm.erp.common.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle business exceptions
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException ex) {
        log.error("Business exception: code={}, message={}", ex.getErrorCode().getCode(), ex.getMessage());

        ApiResponse<Void> response = ApiResponse.error(
                ex.getErrorCode().getCode(),
                ex.getMessage());

        return ResponseEntity
                .status(ex.getErrorCode().getHttpStatus())
                .body(response);
    }

    /**
     * Handle validation exceptions
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.error("Validation exception: {}", errors);

        ApiResponse<Map<String, String>> response = ApiResponse.error(
                ErrorCode.INVALID_INPUT_VALUE.getCode(),
                "Validation failed",
                errors);

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    /**
     * Handle authentication exceptions
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentialsException(BadCredentialsException ex) {
        log.error("Bad credentials: {}", ex.getMessage());

        ApiResponse<Void> response = ApiResponse.error(
                ErrorCode.INVALID_CREDENTIALS.getCode(),
                "Invalid username or password");

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(response);
    }

    /**
     * Handle access denied exceptions
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(AccessDeniedException ex) {
        log.error("Access denied: {}", ex.getMessage());

        ApiResponse<Void> response = ApiResponse.error(
                ErrorCode.FORBIDDEN.getCode(),
                "Access denied");

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(response);
    }

    /**
     * Handle runtime exceptions (especially from AuthService)
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntimeException(RuntimeException ex) {
        String message = ex.getMessage();
        HttpStatus status = HttpStatus.BAD_REQUEST;
        String errorCode = ErrorCode.INVALID_INPUT_VALUE.getCode();

        // Map specific error messages to appropriate HTTP status codes
        if (message != null) {
            if (message.contains("Email already in use")) {
                status = HttpStatus.CONFLICT;
                errorCode = "DUPLICATE_EMAIL";
            } else if (message.contains("Invalid admin invite code")) {
                status = HttpStatus.UNAUTHORIZED;
                errorCode = "INVALID_ADMIN_CODE";
                message = "Invalid admin invite code";
            } else if (message.contains("Invalid farm invite code")) {
                status = HttpStatus.UNAUTHORIZED;
                errorCode = "INVALID_FARM_CODE";
                message = "Invalid farm invite code";
            } else if (message.contains("Invalid register type")) {
                status = HttpStatus.BAD_REQUEST;
                errorCode = "INVALID_REGISTER_TYPE";
            } else if (message.contains("User not found")) {
                status = HttpStatus.NOT_FOUND;
                errorCode = "USER_NOT_FOUND";
            }
        }

        log.error("Runtime exception: {}", message);

        ApiResponse<Void> response = ApiResponse.error(errorCode, message);

        return ResponseEntity
                .status(status)
                .body(response);
    }

    /**
     * Handle Method Not Allowed (405) exceptions
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodNotAllowed(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        log.error("Method not allowed: method={}, uri={}, supported_methods={}",
                request.getMethod(), request.getRequestURI(), ex.getSupportedHttpMethods());

        // System.err for forced visibility in logs
        System.err.println(">>> 405 METHOD NOT ALLOWED DETECTED <<<");
        System.err.println("Request URI: " + request.getRequestURI());
        System.err.println("Attempted Method: " + request.getMethod());
        System.err.println("Supported Methods: " + ex.getSupportedHttpMethods());

        ApiResponse<Void> response = ApiResponse.error(
                "405",
                "Method '" + request.getMethod() + "' not supported for this endpoint.");

        return ResponseEntity
                .status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(response);
    }

    /**
     * Handle all other exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception ex, HttpServletRequest request) {
        // SYSTEM.ERR LOGGING (FORCED)
        System.err.println(">>> CRITICAL EXCEPTION CAUGHT IN GLOBAL HANDLER <<<");
        System.err.println("Request URI: " + request.getRequestURI());
        System.err.println("Method: " + request.getMethod());
        System.err.println("Exception Type: " + ex.getClass().getName());
        System.err.println("Message: " + ex.getMessage());
        ex.printStackTrace(); // Print full stack trace to console

        log.error("Unexpected exception at {}: ", request.getRequestURI(), ex);

        ApiResponse<Void> response = ApiResponse.error(
                ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
                "Internal Error: " + ex.getClass().getName() + " - " + ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
    }
}
