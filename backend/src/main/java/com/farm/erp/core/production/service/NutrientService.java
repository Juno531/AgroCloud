package com.farm.erp.core.production.service;

import com.farm.erp.common.exception.BusinessException;
import com.farm.erp.common.exception.ErrorCode;
import com.farm.erp.core.production.domain.Bed;
import com.farm.erp.core.production.domain.NutrientRecord;
import com.farm.erp.core.production.domain.Planting;
import com.farm.erp.core.production.dto.NutrientRecordRequest;
import com.farm.erp.core.production.dto.NutrientRecordResponse;
import com.farm.erp.core.production.repository.BedRepository;
import com.farm.erp.core.production.repository.NutrientRecordRepository;
import com.farm.erp.core.production.repository.PlantingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NutrientService {

    private final NutrientRecordRepository nutrientRecordRepository;
    private final BedRepository bedRepository;
    private final PlantingRepository plantingRepository;

    /**
     * Create a new nutrient record
     */
    @Transactional
    public NutrientRecordResponse createNutrientRecord(NutrientRecordRequest request) {
        Bed bed = bedRepository.findById(request.getBedId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Bed not found"));

        Planting planting = null;
        if (request.getPlantingId() != null) {
            planting = plantingRepository.findById(request.getPlantingId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Planting not found"));
        }

        NutrientRecord record = NutrientRecord.builder()
                .bed(bed)
                .planting(planting)
                .recordDate(request.getRecordDate())
                .supplyEc(request.getSupplyEc())
                .supplyPh(request.getSupplyPh())
                .supplyAmount(request.getSupplyAmount())
                .drainEc(request.getDrainEc())
                .drainPh(request.getDrainPh())
                .drainAmount(request.getDrainAmount())
                .notes(request.getNotes())
                .build();

        // Auto-calculate drain rate
        record.calculateDrainRate();

        NutrientRecord saved = nutrientRecordRepository.save(record);
        return NutrientRecordResponse.from(saved);
    }

    /**
     * Get nutrient records by bed ID
     */
    public List<NutrientRecordResponse> getNutrientRecordsByBed(Long bedId) {
        return nutrientRecordRepository.findByBedIdOrderByRecordDateDesc(bedId)
                .stream()
                .map(NutrientRecordResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Get nutrient records by farm ID
     */
    public List<NutrientRecordResponse> getNutrientRecordsByFarm(Long farmId) {
        return nutrientRecordRepository.findByFarmIdOrderByRecordDateDesc(farmId)
                .stream()
                .map(NutrientRecordResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Get nutrient records by date range
     */
    public List<NutrientRecordResponse> getNutrientRecordsByDateRange(LocalDate startDate, LocalDate endDate) {
        return nutrientRecordRepository.findByRecordDateBetweenOrderByRecordDateDesc(startDate, endDate)
                .stream()
                .map(NutrientRecordResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Update a nutrient record
     */
    @Transactional
    public NutrientRecordResponse updateNutrientRecord(Long id, NutrientRecordRequest request) {
        NutrientRecord record = nutrientRecordRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Nutrient record not found"));

        // Update bed if changed
        if (!record.getBed().getId().equals(request.getBedId())) {
            Bed bed = bedRepository.findById(request.getBedId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Bed not found"));
            // Note: Cannot update bed in immutable entity, would need to add setter or
            // rebuild
        }

        // Update planting if changed
        if (request.getPlantingId() != null) {
            Planting planting = plantingRepository.findById(request.getPlantingId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Planting not found"));
            // Note: Cannot update planting in immutable entity
        }

        // Since entity is immutable (no setters), we need to create a new record
        // For simplicity, delete old and create new
        nutrientRecordRepository.delete(record);

        return createNutrientRecord(request);
    }

    /**
     * Delete a nutrient record
     */
    @Transactional
    public void deleteNutrientRecord(Long id) {
        if (!nutrientRecordRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Nutrient record not found");
        }
        nutrientRecordRepository.deleteById(id);
    }
}
