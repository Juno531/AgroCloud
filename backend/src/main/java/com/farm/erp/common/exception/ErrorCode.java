package com.farm.erp.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * Error codes for business exceptions
 */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    
    // Common Errors (1xxx)
    INVALID_INPUT_VALUE("1001", "Invalid input value", HttpStatus.BAD_REQUEST),
    RESOURCE_NOT_FOUND("1002", "Resource not found", HttpStatus.NOT_FOUND),
    DUPLICATE_RESOURCE("1003", "Duplicate resource", HttpStatus.CONFLICT),
    UNAUTHORIZED("1004", "Unauthorized access", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("1005", "Forbidden access", HttpStatus.FORBIDDEN),
    INTERNAL_SERVER_ERROR("1006", "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),
    
    // Farm Domain Errors (2xxx)
    FARM_NOT_FOUND("2001", "Farm not found", HttpStatus.NOT_FOUND),
    FARM_ALREADY_EXISTS("2002", "Farm already exists", HttpStatus.CONFLICT),
    FARM_NAME_REQUIRED("2003", "Farm name is required", HttpStatus.BAD_REQUEST),
    
    // Inventory Domain Errors (3xxx)
    INVENTORY_NOT_FOUND("3001", "Inventory not found", HttpStatus.NOT_FOUND),
    INSUFFICIENT_STOCK("3002", "Insufficient stock", HttpStatus.BAD_REQUEST),
    INVALID_STOCK_QUANTITY("3003", "Invalid stock quantity", HttpStatus.BAD_REQUEST),
    
    // Order Domain Errors (4xxx)
    ORDER_NOT_FOUND("4001", "Order not found", HttpStatus.NOT_FOUND),
    ORDER_ALREADY_SHIPPED("4002", "Order already shipped", HttpStatus.BAD_REQUEST),
    ORDER_CANNOT_BE_CANCELED("4003", "Order cannot be canceled", HttpStatus.BAD_REQUEST),
    INVALID_ORDER_STATUS("4004", "Invalid order status", HttpStatus.BAD_REQUEST),
    
    // Production Domain Errors (5xxx)
    CROP_NOT_FOUND("5001", "Crop not found", HttpStatus.NOT_FOUND),
    YIELD_RECORD_NOT_FOUND("5002", "Yield record not found", HttpStatus.NOT_FOUND),
    INVALID_YIELD_AMOUNT("5003", "Invalid yield amount", HttpStatus.BAD_REQUEST),
    
    // Accounting Domain Errors (6xxx)
    ACCOUNT_NOT_FOUND("6001", "Account not found", HttpStatus.NOT_FOUND),
    TRANSACTION_NOT_FOUND("6002", "Transaction not found", HttpStatus.NOT_FOUND),
    INVALID_TRANSACTION_AMOUNT("6003", "Invalid transaction amount", HttpStatus.BAD_REQUEST),
    
    // Authentication Errors (7xxx)
    INVALID_TOKEN("7001", "Invalid token", HttpStatus.UNAUTHORIZED),
    EXPIRED_TOKEN("7002", "Expired token", HttpStatus.UNAUTHORIZED),
    INVALID_CREDENTIALS("7003", "Invalid credentials", HttpStatus.UNAUTHORIZED),
    USER_NOT_FOUND("7004", "User not found", HttpStatus.NOT_FOUND),
    USER_ALREADY_EXISTS("7005", "User already exists", HttpStatus.CONFLICT);
    
    private final String code;
    private final String message;
    private final HttpStatus httpStatus;
}
