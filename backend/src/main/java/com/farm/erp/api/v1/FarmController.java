package com.farm.erp.api.v1;

import com.farm.erp.common.dto.ApiResponse;
import com.farm.erp.common.dto.PageResponse;
import com.farm.erp.core.farm.dto.FarmRequest;
import com.farm.erp.core.farm.dto.FarmResponse;
import com.farm.erp.core.farm.service.FarmService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Farm Management API
 */
@Tag(name = "Farm API", description = "Farm management endpoints")
@RestController
@RequestMapping("/api/v1/farms")
@RequiredArgsConstructor
public class FarmController {
    
    private final FarmService farmService;
    
    @Operation(summary = "Create a new farm")
    @PostMapping
    public ResponseEntity<ApiResponse<FarmResponse>> createFarm(@Valid @RequestBody FarmRequest request) {
        FarmResponse response = farmService.createFarm(request);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success("Farm created successfully", response));
    }
    
    @Operation(summary = "Get farm by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FarmResponse>> getFarm(@PathVariable Long id) {
        FarmResponse response = farmService.getFarm(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @Operation(summary = "Get all farms")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<FarmResponse>>> getAllFarms(
        @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageResponse<FarmResponse> response = farmService.getAllFarms(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @Operation(summary = "Update farm")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FarmResponse>> updateFarm(
        @PathVariable Long id,
        @Valid @RequestBody FarmRequest request
    ) {
        FarmResponse response = farmService.updateFarm(id, request);
        return ResponseEntity.ok(ApiResponse.success("Farm updated successfully", response));
    }
    
    @Operation(summary = "Delete farm (Deactivate)")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFarm(@PathVariable Long id) {
        farmService.deleteFarm(id);
        return ResponseEntity.ok(ApiResponse.success("Farm deactivated successfully", null));
    }
}
