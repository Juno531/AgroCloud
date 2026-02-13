package com.farm.erp.core.harvest.domain;

/**
 * Harvest Grade Enumeration
 * Standard strawberry grades
 */
public enum HarvestGrade {
    SPECIAL("특"),
    HIGH("상"),
    MEDIUM("중"),
    LOW("하"),
    WASTE("폐기");

    private final String label;

    HarvestGrade(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
