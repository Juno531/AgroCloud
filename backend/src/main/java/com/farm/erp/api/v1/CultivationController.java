package com.farm.erp.api.v1;

import com.farm.erp.common.dto.ApiResponse;
import com.farm.erp.core.production.domain.WorkRecord;
import com.farm.erp.core.production.dto.*;
import com.farm.erp.core.production.service.CultivationService;
import com.farm.erp.core.production.service.NutrientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Tag(name = "Cultivation API", description = "Cultivation management (Growth, Pest, Work, Nutrient)")
@RestController
@RequestMapping("/api/v1/cultivation")
@RequiredArgsConstructor
public class CultivationController {

    private final CultivationService cultivationService;
    private final NutrientService nutrientService;

    // ========== Work Records ==========

    @Operation(summary = "Create a new work record")
    @PostMapping("/work-records")
    public ResponseEntity<ApiResponse<WorkRecordResponse>> createWorkRecord(
            @Valid @RequestBody WorkRecordRequest request) {
        WorkRecordResponse response = cultivationService.createWorkRecord(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Work record created successfully", response));
    }

    @Operation(summary = "Get work records for a farm")
    @GetMapping("/farms/{farmId}/work-records")
    public ResponseEntity<ApiResponse<List<WorkRecordResponse>>> getWorkRecordsByFarm(@PathVariable Long farmId) {
        List<WorkRecordResponse> response = cultivationService.getWorkRecordsByFarm(farmId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get work records for a specific date")
    @GetMapping("/work-records/date/{workDate}")
    public ResponseEntity<ApiResponse<List<WorkRecordResponse>>> getWorkRecordsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate workDate) {
        List<WorkRecordResponse> response = cultivationService.getWorkRecordsByDate(workDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get work records for a farm and date")
    @GetMapping("/farms/{farmId}/work-records/date/{workDate}")
    public ResponseEntity<ApiResponse<List<WorkRecordResponse>>> getWorkRecordsByFarmAndDate(
            @PathVariable Long farmId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate workDate) {
        List<WorkRecordResponse> response = cultivationService.getWorkRecordsByFarmAndDate(farmId, workDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Update work record status")
    @PatchMapping("/work-records/{id}/status")
    public ResponseEntity<ApiResponse<WorkRecordResponse>> updateWorkRecordStatus(
            @PathVariable Long id,
            @RequestParam WorkRecord.CompletionStatus status) {
        WorkRecordResponse response = cultivationService.updateWorkRecordStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Work record status updated", response));
    }

    @Operation(summary = "Delete a work record")
    @DeleteMapping("/work-records/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWorkRecord(@PathVariable Long id) {
        cultivationService.deleteWorkRecord(id);
        return ResponseEntity.ok(ApiResponse.success("Work record deleted successfully", null));
    }

    // ========== Growth Records ==========

    @Operation(summary = "Create a new growth record")
    @PostMapping("/growth-records")
    public ResponseEntity<ApiResponse<GrowthRecordResponse>> createGrowthRecord(
            @Valid @RequestBody GrowthRecordRequest request) {
        GrowthRecordResponse response = cultivationService.createGrowthRecord(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Growth record created successfully", response));
    }

    @Operation(summary = "Get growth records for a planting")
    @GetMapping("/growth-records/planting/{plantingId}")
    public ResponseEntity<ApiResponse<List<GrowthRecordResponse>>> getGrowthRecordsByPlanting(
            @PathVariable Long plantingId) {
        List<GrowthRecordResponse> response = cultivationService.getGrowthRecordsByPlanting(plantingId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ========== Pest Records ==========

    @Operation(summary = "Create a new pest record")
    @PostMapping("/pest-records")
    public ResponseEntity<ApiResponse<PestRecordResponse>> createPestRecord(
            @Valid @RequestBody PestRecordRequest request) {
        PestRecordResponse response = cultivationService.createPestRecord(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Pest record created successfully", response));
    }

    @Operation(summary = "Get pest records for a farm")
    @GetMapping("/pest-records/farm/{farmId}")
    public ResponseEntity<ApiResponse<List<PestRecordResponse>>> getPestRecordsByFarm(@PathVariable Long farmId) {
        List<PestRecordResponse> response = cultivationService.getPestRecordsByFarm(farmId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ========== Nutrient Records ==========

    @Operation(summary = "Create a new nutrient record")
    @PostMapping("/nutrient-records")
    public ResponseEntity<ApiResponse<NutrientRecordResponse>> createNutrientRecord(
            @Valid @RequestBody NutrientRecordRequest request) {
        NutrientRecordResponse response = nutrientService.createNutrientRecord(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Nutrient record created successfully", response));
    }

    @Operation(summary = "Get nutrient records for a farm")
    @GetMapping("/nutrient-records/farm/{farmId}")
    public ResponseEntity<ApiResponse<List<NutrientRecordResponse>>> getNutrientRecordsByFarm(
            @PathVariable Long farmId) {
        List<NutrientRecordResponse> response = nutrientService.getNutrientRecordsByFarm(farmId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
