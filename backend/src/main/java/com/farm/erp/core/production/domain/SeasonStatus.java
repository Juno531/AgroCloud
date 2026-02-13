package com.farm.erp.core.production.domain;

/**
 * Season status enumeration
 */
public enum SeasonStatus {
    PLANNED,
    ACTIVE, // Season is currently active
    IN_PROGRESS, // Alternative name for ACTIVE (deprecated)
    COMPLETED,
    CANCELLED
}
