package com.farm.erp.core.production.service;

import com.farm.erp.core.farm.domain.Farm;
import com.farm.erp.core.farm.repository.FarmRepository;
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
        private final FarmRepository farmRepository;
        private final WorkKeywordRepository workKeywordRepository;

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
                Farm farm = farmRepository.findById(request.getFarmId())
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Farm not found"));

                Bed bed = null;
                if (request.getBedId() != null) {
                        bed = bedRepository.findById(request.getBedId())
                                        .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                        "Bed not found"));
                }

                WorkKeyword keyword = workKeywordRepository.findById(request.getKeywordId())
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Work keyword not found"));

                WorkRecord record = WorkRecord.builder()
                                .farm(farm)
                                .bed(bed)
                                .workDate(request.getWorkDate())
                                .workKeyword(keyword)
                                .completionStatus(request.getCompletionStatus() != null ? request.getCompletionStatus()
                                                : WorkRecord.CompletionStatus.COMPLETED)
                                .regularWorkerCount(request.getRegularWorkerCount())
                                .dailyWorkerCount(request.getDailyWorkerCount())
                                .startTime(request.getStartTime())
                                .endTime(request.getEndTime())
                                .durationMinutes(request.getDurationMinutes())
                                .manager(request.getManager())
                                .notes(request.getNotes())
                                .build();

                WorkRecord saved = workRecordRepository.save(record);
                log.info("Created work record for farm {}: keyword {}", request.getFarmId(), request.getKeywordId());
                return WorkRecordResponse.from(saved);
        }

        public List<WorkRecordResponse> getWorkRecordsByBed(Long bedId) {
                return workRecordRepository.findByBedId(bedId).stream()
                                .map(WorkRecordResponse::from)
                                .collect(Collectors.toList());
        }

        public List<WorkRecordResponse> getWorkRecordsByDate(LocalDate workDate) {
                return workRecordRepository.findByWorkDateOrderByFarmIdAndIdDesc(workDate)
                                .stream()
                                .map(WorkRecordResponse::from)
                                .collect(Collectors.toList());
        }

        public List<WorkRecordResponse> getWorkRecordsByFarmAndDate(Long farmId, LocalDate workDate) {
                return workRecordRepository.findByFarmIdAndWorkDateOrderByIdDesc(farmId, workDate).stream()
                                .map(WorkRecordResponse::from)
                                .collect(Collectors.toList());
        }

        public List<WorkRecordResponse> getWorkRecordsByFarm(Long farmId) {
                return workRecordRepository.findByFarmIdOrderByIdDesc(farmId).stream()
                                .map(WorkRecordResponse::from)
                                .collect(Collectors.toList());
        }

        @Transactional
        public WorkRecordResponse updateWorkRecordStatus(Long id, WorkRecord.CompletionStatus status) {
                WorkRecord record = workRecordRepository.findById(id)
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Work record not found"));

                record.updateStatus(status);
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

        // ========== Work Keywords ==========

        @Transactional
        public WorkKeywordResponse createWorkKeyword(WorkKeywordRequest request) {
                Farm farm = farmRepository.findById(request.getFarmId())
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Farm not found"));

                WorkKeyword keyword = WorkKeyword.builder()
                                .farm(farm)
                                .name(request.getName())
                                .colorCode(request.getColorCode())
                                .build();

                return WorkKeywordResponse.from(workKeywordRepository.save(keyword));
        }

        public List<WorkKeywordResponse> getWorkKeywords(Long farmId) {
                return workKeywordRepository.findByFarmId(farmId).stream()
                                .map(WorkKeywordResponse::from)
                                .collect(Collectors.toList());
        }

        @Transactional
        public WorkKeywordResponse updateWorkKeyword(Long keywordId, WorkKeywordRequest request) {
                WorkKeyword keyword = workKeywordRepository.findById(keywordId)
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Work keyword not found"));
                keyword.setName(request.getName());
                keyword.setColorCode(request.getColorCode());
                return WorkKeywordResponse.from(keyword);
        }

        @Transactional
        public void deleteWorkKeyword(Long keywordId) {
                WorkKeyword keyword = workKeywordRepository.findById(keywordId)
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Work keyword not found"));
                workKeywordRepository.delete(keyword);
                log.info("Deleted work keyword {}", keywordId);
        }

        // ========== Work Statistics ==========

        public WorkStatsResponse getWorkStats(Long farmId, LocalDate startDate, LocalDate endDate) {
                List<WorkRecord> records = workRecordRepository.findByFarmIdOrderByIdDesc(farmId).stream()
                                .filter(r -> (startDate == null || !r.getWorkDate().isBefore(startDate)) &&
                                                (endDate == null || !r.getWorkDate().isAfter(endDate)))
                                .collect(Collectors.toList());

                long totalTasks = records.size();
                long completedTasks = records.stream()
                                .filter(r -> r.getCompletionStatus() == WorkRecord.CompletionStatus.COMPLETED)
                                .count();
                double completionRate = totalTasks > 0 ? (double) completedTasks / totalTasks * 100 : 0;

                long totalManHours = records.stream()
                                .mapToLong(r -> {
                                        int regular = r.getRegularWorkerCount() != null ? r.getRegularWorkerCount() : 0;
                                        int daily = r.getDailyWorkerCount() != null ? r.getDailyWorkerCount() : 0;
                                        int duration = r.getDurationMinutes() != null ? r.getDurationMinutes() : 0;
                                        return (long) (regular + daily) * duration / 60;
                                })
                                .sum();

                java.util.Map<String, List<WorkRecord>> groupedByKeyword = records.stream()
                                .filter(r -> r.getWorkKeyword() != null)
                                .collect(Collectors.groupingBy(r -> r.getWorkKeyword().getName()));

                List<WorkStatsResponse.KeywordStat> keywordStats = groupedByKeyword.entrySet().stream()
                                .map(entry -> {
                                        WorkKeyword keyword = entry.getValue().get(0).getWorkKeyword();
                                        long count = entry.getValue().size();
                                        return WorkStatsResponse.KeywordStat.builder()
                                                        .keywordName(keyword.getName())
                                                        .colorCode(keyword.getColorCode())
                                                        .count(count)
                                                        .percentage(totalTasks > 0 ? (double) count / totalTasks * 100
                                                                        : 0)
                                                        .build();
                                })
                                .collect(Collectors.toList());

                return WorkStatsResponse.builder()
                                .totalTasks(totalTasks)
                                .completedTasks(completedTasks)
                                .completionRate(completionRate)
                                .totalManHours(totalManHours)
                                .keywordStats(keywordStats)
                                .build();
        }
}
