package com.farm.erp.api.v1;

import com.farm.erp.common.dto.ApiResponse;
import com.farm.erp.core.harvest.dto.HarvestRecordRequest;
import com.farm.erp.core.harvest.dto.HarvestRecordResponse;
import com.farm.erp.core.harvest.service.HarvestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Harvest API", description = "Harvest management endpoints")
@RestController
@RequestMapping("/api/v1/harvest")
@RequiredArgsConstructor
public class HarvestController {

    private final HarvestService harvestService;

    @Operation(summary = "Record daily harvest")
    @PostMapping("/records")
    public ResponseEntity<ApiResponse<HarvestRecordResponse>> createHarvestRecord(@Valid @RequestBody HarvestRecordRequest request) {
        HarvestRecordResponse response = harvestService.createHarvestRecord(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Harvest recorded successfully", response));
    }

    @Operation(summary = "Get harvest records for a season")
    @GetMapping("/seasons/{seasonId}/records")
    public ResponseEntity<ApiResponse<List<HarvestRecordResponse>>> getHarvestRecordsBySeason(@PathVariable Long seasonId) {
        List<HarvestRecordResponse> response = harvestService.getHarvestRecordsBySeason(seasonId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
