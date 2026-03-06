package com.farm.erp.api.v1.controller;

import com.farm.erp.core.production.domain.WorkRecord;
import com.farm.erp.core.production.dto.*;
import com.farm.erp.core.production.service.CultivationService;
import com.farm.erp.core.production.service.NutrientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Cultivation Management Controller
 * Manages growth records, pest control, and work records
 */
@Tag(name = "Cultivation", description = "재배 관리 API")
@RestController
@RequestMapping("/api/v1/cultivation")
@RequiredArgsConstructor
public class CultivationController {

    private final CultivationService cultivationService;
    private final NutrientService nutrientService;

    // ========== Growth Records ==========

    @Operation(summary = "Create growth record", description = "생육 데이터 기록 생성")
    @PostMapping("/growth-records")
    public ResponseEntity<GrowthRecordResponse> createGrowthRecord(
            @Valid @RequestBody GrowthRecordRequest request) {
        return ResponseEntity.ok(cultivationService.createGrowthRecord(request));
    }

    @Operation(summary = "Get growth records by planting", description = "정식 ID로 생육 데이터 조회")
    @GetMapping("/growth-records/planting/{plantingId}")
    public ResponseEntity<List<GrowthRecordResponse>> getGrowthRecordsByPlanting(
            @PathVariable Long plantingId) {
        return ResponseEntity.ok(cultivationService.getGrowthRecordsByPlanting(plantingId));
    }

    @Operation(summary = "Get growth records by crop", description = "작물 ID로 생육 데이터 조회")
    @GetMapping("/growth-records/crop/{cropId}")
    public ResponseEntity<List<GrowthRecordResponse>> getGrowthRecordsByCrop(
            @PathVariable Long cropId) {
        return ResponseEntity.ok(cultivationService.getGrowthRecordsByCrop(cropId));
    }

    @Operation(summary = "Get growth records by date range", description = "기간별 생육 데이터 조회")
    @GetMapping("/growth-records")
    public ResponseEntity<List<GrowthRecordResponse>> getGrowthRecordsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(cultivationService.getGrowthRecordsByDateRange(startDate, endDate));
    }

    @Operation(summary = "Delete growth record", description = "생육 데이터 삭제")
    @DeleteMapping("/growth-records/{id}")
    public ResponseEntity<Void> deleteGrowthRecord(@PathVariable Long id) {
        cultivationService.deleteGrowthRecord(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Pest Records ==========

    @Operation(summary = "Create pest record", description = "병해충 기록 생성")
    @PostMapping("/pest-records")
    public ResponseEntity<PestRecordResponse> createPestRecord(
            @Valid @RequestBody PestRecordRequest request) {
        return ResponseEntity.ok(cultivationService.createPestRecord(request));
    }

    @Operation(summary = "Get pest records by bed", description = "베드 ID로 병해충 기록 조회")
    @GetMapping("/pest-records/bed/{bedId}")
    public ResponseEntity<List<PestRecordResponse>> getPestRecordsByBed(
            @PathVariable Long bedId) {
        return ResponseEntity.ok(cultivationService.getPestRecordsByBed(bedId));
    }

    @Operation(summary = "Get pest records by farm", description = "농장 ID로 병해충 기록 조회")
    @GetMapping("/pest-records/farm/{farmId}")
    public ResponseEntity<List<PestRecordResponse>> getPestRecordsByFarm(
            @PathVariable Long farmId) {
        return ResponseEntity.ok(cultivationService.getPestRecordsByFarm(farmId));
    }

    @Operation(summary = "Get pest records by date range", description = "기간별 병해충 기록 조회")
    @GetMapping("/pest-records")
    public ResponseEntity<List<PestRecordResponse>> getPestRecordsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(cultivationService.getPestRecordsByDateRange(startDate, endDate));
    }

    @Operation(summary = "Delete pest record", description = "병해충 기록 삭제")
    @DeleteMapping("/pest-records/{id}")
    public ResponseEntity<Void> deletePestRecord(@PathVariable Long id) {
        cultivationService.deletePestRecord(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Work Records ==========

    @Operation(summary = "Create work record", description = "작업 기록 생성")
    @PostMapping("/work-records")
    public ResponseEntity<WorkRecordResponse> createWorkRecord(
            @Valid @RequestBody WorkRecordRequest request) {
        return ResponseEntity.ok(cultivationService.createWorkRecord(request));
    }

    @Operation(summary = "Get work records by bed", description = "베드 ID로 작업 기록 조회")
    @GetMapping("/work-records/bed/{bedId}")
    public ResponseEntity<List<WorkRecordResponse>> getWorkRecordsByBed(
            @PathVariable Long bedId) {
        return ResponseEntity.ok(cultivationService.getWorkRecordsByBed(bedId));
    }

    @Operation(summary = "Get work records by date", description = "날짜별 작업 기록 조회")
    @GetMapping("/work-records/date/{workDate}")
    public ResponseEntity<List<WorkRecordResponse>> getWorkRecordsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate workDate) {
        return ResponseEntity.ok(cultivationService.getWorkRecordsByDate(workDate));
    }

    @Operation(summary = "Get work records by farm and date", description = "농장 및 날짜별 작업 기록 조회")
    @GetMapping("/work-records/farm/{farmId}/date/{workDate}")
    public ResponseEntity<List<WorkRecordResponse>> getWorkRecordsByFarmAndDate(
            @PathVariable Long farmId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate workDate) {
        return ResponseEntity.ok(cultivationService.getWorkRecordsByFarmAndDate(farmId, workDate));
    }

    @Operation(summary = "Get work records by farm", description = "농장 ID로 작업 기록 조회")
    @GetMapping("/work-records/farm/{farmId}")
    public ResponseEntity<List<WorkRecordResponse>> getWorkRecordsByFarm(
            @PathVariable Long farmId) {
        return ResponseEntity.ok(cultivationService.getWorkRecordsByFarm(farmId));
    }

    @Operation(summary = "Update work record status", description = "작업 기록 상태 업데이트")
    @PatchMapping("/work-records/{id}/status")
    public ResponseEntity<WorkRecordResponse> updateWorkRecordStatus(
            @PathVariable Long id,
            @RequestParam WorkRecord.CompletionStatus status) {
        return ResponseEntity.ok(cultivationService.updateWorkRecordStatus(id, status));
    }

    @Operation(summary = "Delete work record", description = "작업 기록 삭제")
    @DeleteMapping("/work-records/{id}")
    public ResponseEntity<Void> deleteWorkRecord(@PathVariable Long id) {
        cultivationService.deleteWorkRecord(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Nutrient Records ==========

    @Operation(summary = "Create nutrient record", description = "양액 기록 생성")
    @PostMapping("/nutrient-records")
    public ResponseEntity<NutrientRecordResponse> createNutrientRecord(
            @Valid @RequestBody NutrientRecordRequest request) {
        return ResponseEntity.ok(nutrientService.createNutrientRecord(request));
    }

    @Operation(summary = "Get nutrient records by bed", description = "베드 ID로 양액 기록 조회")
    @GetMapping("/nutrient-records/bed/{bedId}")
    public ResponseEntity<List<NutrientRecordResponse>> getNutrientRecordsByBed(
            @PathVariable Long bedId) {
        return ResponseEntity.ok(nutrientService.getNutrientRecordsByBed(bedId));
    }

    @Operation(summary = "Get nutrient records by farm", description = "농장 ID로 양액 기록 조회")
    @GetMapping("/nutrient-records/farm/{farmId}")
    public ResponseEntity<List<NutrientRecordResponse>> getNutrientRecordsByFarm(
            @PathVariable Long farmId) {
        return ResponseEntity.ok(nutrientService.getNutrientRecordsByFarm(farmId));
    }

    @Operation(summary = "Get nutrient records by date range", description = "기간별 양액 기록 조회")
    @GetMapping("/nutrient-records")
    public ResponseEntity<List<NutrientRecordResponse>> getNutrientRecordsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(nutrientService.getNutrientRecordsByDateRange(startDate, endDate));
    }

    @Operation(summary = "Update nutrient record", description = "양액 기록 수정")
    @PutMapping("/nutrient-records/{id}")
    public ResponseEntity<NutrientRecordResponse> updateNutrientRecord(
            @PathVariable Long id,
            @Valid @RequestBody NutrientRecordRequest request) {
        return ResponseEntity.ok(nutrientService.updateNutrientRecord(id, request));
    }

    @Operation(summary = "Delete nutrient record", description = "양액 기록 삭제")
    @DeleteMapping("/nutrient-records/{id}")
    public ResponseEntity<Void> deleteNutrientRecord(@PathVariable Long id) {
        nutrientService.deleteNutrientRecord(id);
        return ResponseEntity.noContent().build();
    }

    // ========== Work Keywords ==========

    @Operation(summary = "Create work keyword", description = "작업 키워드 생성")
    @PostMapping("/work-keywords")
    public ResponseEntity<WorkKeywordResponse> createWorkKeyword(
            @Valid @RequestBody WorkKeywordRequest request) {
        return ResponseEntity.ok(cultivationService.createWorkKeyword(request));
    }

    @Operation(summary = "Get work keywords by farm", description = "농장 ID로 작업 키워드 목록 조회")
    @GetMapping("/work-keywords/farm/{farmId}")
    public ResponseEntity<List<WorkKeywordResponse>> getWorkKeywords(
            @PathVariable Long farmId) {
        return ResponseEntity.ok(cultivationService.getWorkKeywords(farmId));
    }

    @Operation(summary = "Update work keyword", description = "작업 키워드 수정")
    @PutMapping("/work-keywords/{keywordId}")
    public ResponseEntity<WorkKeywordResponse> updateWorkKeyword(
            @PathVariable Long keywordId,
            @Valid @RequestBody WorkKeywordRequest request) {
        return ResponseEntity.ok(cultivationService.updateWorkKeyword(keywordId, request));
    }

    @Operation(summary = "Delete work keyword", description = "작업 키워드 삭제")
    @DeleteMapping("/work-keywords/{keywordId}")
    public ResponseEntity<Void> deleteWorkKeyword(@PathVariable Long keywordId) {
        cultivationService.deleteWorkKeyword(keywordId);
        return ResponseEntity.noContent().build();
    }

    // ========== Work Statistics ==========

    @Operation(summary = "Get work statistics", description = "작업 통계 조회")
    @GetMapping("/work-stats/farm/{farmId}")
    public ResponseEntity<WorkStatsResponse> getWorkStats(
            @PathVariable Long farmId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(cultivationService.getWorkStats(farmId, startDate, endDate));
    }
}
