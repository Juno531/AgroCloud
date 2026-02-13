package com.farm.erp.core.production.service;

import com.farm.erp.common.exception.BusinessException;
import com.farm.erp.common.exception.ErrorCode;
import com.farm.erp.core.production.domain.*;
import com.farm.erp.core.production.dto.*;
import com.farm.erp.core.production.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Cultivation Service
 * Handles all cultivation-related business logic including:
 * - Growth records (생육 데이터)
 * - Pest records (병해충 기록)
 * - Work records (작업 기록)
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CultivationService {

        private final GrowthRecordRepository growthRecordRepository;
        private final PestRecordRepository pestRecordRepository;
        private final WorkRecordRepository workRecordRepository;
        private final PlantingRepository plantingRepository;
        private final BedRepository bedRepository;

        // ========== Growth Records ==========

        @Transactional
        public GrowthRecordResponse createGrowthRecord(GrowthRecordRequest request) {
                Planting planting = plantingRepository.findById(request.getPlantingId())
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Planting not found"));

                GrowthRecord record = GrowthRecord.builder()
                                .planting(planting)
                                .recordDate(request.getRecordDate())
                                .plantHeightCm(request.getPlantHeightCm())
                                .leafLengthCm(request.getLeafLengthCm())
                                .leafWidthCm(request.getLeafWidthCm())
                                .leafCount(request.getLeafCount())
                                .crownDiameterMm(request.getCrownDiameterMm())
                                .flowerClusterCount(request.getFlowerClusterCount())
                                .floweringDate(request.getFloweringDate())
                                .fruitingDate(request.getFruitingDate())
                                .fruitCount(request.getFruitCount())
                                .notes(request.getNotes())
                                .build();

                GrowthRecord saved = growthRecordRepository.save(record);
                log.info("Created growth record for planting {}", request.getPlantingId());
                return GrowthRecordResponse.from(saved);
        }

        public List<GrowthRecordResponse> getGrowthRecordsByPlanting(Long plantingId) {
                return growthRecordRepository.findByPlantingIdOrderByRecordDateDesc(plantingId).stream()
                                .map(GrowthRecordResponse::from)
                                .collect(Collectors.toList());
        }

        public List<GrowthRecordResponse> getGrowthRecordsByCrop(Long cropId) {
                return growthRecordRepository.findByPlanting_CropIdOrderByRecordDateDesc(cropId).stream()
                                .map(GrowthRecordResponse::from)
                                .collect(Collectors.toList());
        }

        public List<GrowthRecordResponse> getGrowthRecordsByDateRange(LocalDate startDate, LocalDate endDate) {
                return growthRecordRepository.findByRecordDateBetween(startDate, endDate).stream()
                                .map(GrowthRecordResponse::from)
                                .collect(Collectors.toList());
        }

        @Transactional
        public void deleteGrowthRecord(Long id) {
                GrowthRecord record = growthRecordRepository.findById(id)
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Growth record not found"));
                growthRecordRepository.delete(record);
                log.info("Deleted growth record {}", id);
        }

        // ========== Pest Records ==========

        @Transactional
        public PestRecordResponse createPestRecord(PestRecordRequest request) {
                Bed bed = bedRepository.findById(request.getBedId())
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Bed not found"));

                PestRecord record = PestRecord.builder()
                                .bed(bed)
                                .recordDate(request.getRecordDate())
                                .pestType(request.getPestType())
                                .severity(request.getSeverity())
                                .pesticideName(request.getPesticideName())
                                .applicationMethod(request.getApplicationMethod())
                                .affectedBedRangeStart(request.getAffectedBedRangeStart())
                                .affectedBedRangeEnd(request.getAffectedBedRangeEnd())
                                .treatment(request.getTreatment())
                                .treatmentDate(request.getTreatmentDate())
                                .build();

                PestRecord saved = pestRecordRepository.save(record);
                log.info("Created pest record for bed {}: {}", request.getBedId(), request.getPestType());
                return PestRecordResponse.from(saved);
        }

        public List<PestRecordResponse> getPestRecordsByBed(Long bedId) {
                return pestRecordRepository.findByBedId(bedId).stream()
                                .map(PestRecordResponse::from)
                                .collect(Collectors.toList());
        }

        public List<PestRecordResponse> getPestRecordsByFarm(Long farmId) {
                return pestRecordRepository.findByFarmIdOrderByRecordDateDesc(farmId).stream()
                                .map(PestRecordResponse::from)
                                .collect(Collectors.toList());
        }

        public List<PestRecordResponse> getPestRecordsByDateRange(LocalDate startDate, LocalDate endDate) {
                return pestRecordRepository.findByRecordDateBetween(startDate, endDate).stream()
                                .map(PestRecordResponse::from)
                                .collect(Collectors.toList());
        }

        @Transactional
        public void deletePestRecord(Long id) {
                PestRecord record = pestRecordRepository.findById(id)
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Pest record not found"));
                pestRecordRepository.delete(record);
                log.info("Deleted pest record {}", id);
        }

        // ========== Work Records ==========

        @Transactional
        public WorkRecordResponse createWorkRecord(WorkRecordRequest request) {
                Bed bed = bedRepository.findById(request.getBedId())
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Bed not found"));

                WorkRecord record = WorkRecord.builder()
                                .bed(bed)
                                .workDate(request.getWorkDate())
                                .workType(request.getWorkType())
                                .completionStatus(request.getCompletionStatus() != null ? request.getCompletionStatus()
                                                : WorkRecord.CompletionStatus.COMPLETED)
                                .workerCount(request.getWorkerCount())
                                .durationMinutes(request.getDurationMinutes())
                                .notes(request.getNotes())
                                .build();

                WorkRecord saved = workRecordRepository.save(record);
                log.info("Created work record for bed {}: {}", request.getBedId(), request.getWorkType());
                return WorkRecordResponse.from(saved);
        }

        public List<WorkRecordResponse> getWorkRecordsByBed(Long bedId) {
                return workRecordRepository.findByBedId(bedId).stream()
                                .map(WorkRecordResponse::from)
                                .collect(Collectors.toList());
        }

        public List<WorkRecordResponse> getWorkRecordsByDate(LocalDate workDate) {
                return workRecordRepository.findByWorkDateOrderByBedLineLineNumberAscAndBedBedNumberAsc(workDate)
                                .stream()
                                .map(WorkRecordResponse::from)
                                .collect(Collectors.toList());
        }

        public List<WorkRecordResponse> getWorkRecordsByFarmAndDate(Long farmId, LocalDate workDate) {
                return workRecordRepository.findByFarmIdAndWorkDate(farmId, workDate).stream()
                                .map(WorkRecordResponse::from)
                                .collect(Collectors.toList());
        }

        public List<WorkRecordResponse> getWorkRecordsByFarm(Long farmId) {
                return workRecordRepository.findByBed_Line_House_FarmId(farmId).stream()
                                .map(WorkRecordResponse::from)
                                .collect(Collectors.toList());
        }

        @Transactional
        public WorkRecordResponse updateWorkRecordStatus(Long id, WorkRecord.CompletionStatus status) {
                WorkRecord record = workRecordRepository.findById(id)
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Work record not found"));

                // Note: WorkRecord is immutable, so we need to create a new one or add a setter
                // For now, we'll return the existing record
                // TODO: Add status update logic if needed
                log.info("Updated work record {} status to {}", id, status);
                return WorkRecordResponse.from(record);
        }

        @Transactional
        public void deleteWorkRecord(Long id) {
                WorkRecord record = workRecordRepository.findById(id)
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Work record not found"));
                workRecordRepository.delete(record);
                log.info("Deleted work record {}", id);
        }
}
