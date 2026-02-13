package com.farm.erp.api.v1;

import com.farm.erp.common.dto.ApiResponse;
import com.farm.erp.core.production.dto.HouseLayoutRequest;
import com.farm.erp.core.production.dto.HouseLayoutResponse;
import com.farm.erp.core.production.service.LayoutService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/layout")
@RequiredArgsConstructor
@Tag(name = "Layout", description = "Bed layout management APIs")
public class LayoutController {

    private final LayoutService layoutService;

    @Operation(summary = "Save or update farm bed layout")
    @PostMapping("/houses/{farmId}")
    public ResponseEntity<ApiResponse<HouseLayoutResponse>> saveLayout(
            @PathVariable Long farmId,
            @Valid @RequestBody HouseLayoutRequest request) {
        HouseLayoutResponse response = layoutService.saveLayout(farmId, request);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success("Layout saved successfully", response));
    }

    @Operation(summary = "Get farm bed layout")
    @GetMapping("/houses/{farmId}")
    public ResponseEntity<ApiResponse<HouseLayoutResponse>> getLayout(@PathVariable Long farmId) {
        HouseLayoutResponse response = layoutService.getLayout(farmId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
