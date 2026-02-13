package com.farm.erp.api.v1;

import com.farm.erp.common.dto.ApiResponse;
import com.farm.erp.core.production.dto.*;
import com.farm.erp.core.production.service.ProductionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Production API", description = "Production management (Season, Structure, Planting)")
@RestController
@RequestMapping("/api/v1/production")
@RequiredArgsConstructor
public class ProductionController {

    private final ProductionService productionService;

    @Operation(summary = "Create a new season")
    @PostMapping("/seasons")
    public ResponseEntity<ApiResponse<SeasonResponse>> createSeason(@Valid @RequestBody SeasonRequest request) {
        SeasonResponse response = productionService.createSeason(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Season created successfully", response));
    }

    @Operation(summary = "Get seasons for a farm")
    @GetMapping("/farms/{farmId}/seasons")
    public ResponseEntity<ApiResponse<List<SeasonResponse>>> getSeasons(@PathVariable Long farmId) {
        List<SeasonResponse> response = productionService.getSeasons(farmId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Start a season")
    @PostMapping("/seasons/{id}/start")
    public ResponseEntity<ApiResponse<Void>> startSeason(@PathVariable Long id) {
        productionService.startSeason(id);
        return ResponseEntity.ok(ApiResponse.success("Season started", null));
    }

    @Operation(summary = "End a season")
    @PostMapping("/seasons/{id}/end")
    public ResponseEntity<ApiResponse<Void>> endSeason(@PathVariable Long id) {
        productionService.endSeason(id);
        return ResponseEntity.ok(ApiResponse.success("Season ended", null));
    }

    // --- Structure Endpoints ---

    @Operation(summary = "Create a new house")
    @PostMapping("/houses")
    public ResponseEntity<ApiResponse<HouseResponse>> createHouse(@Valid @RequestBody HouseRequest request) {
        HouseResponse response = productionService.createHouse(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("House created successfully", response));
    }

    @Operation(summary = "Get houses for a farm")
    @GetMapping("/farms/{farmId}/houses")
    public ResponseEntity<ApiResponse<List<HouseResponse>>> getHouses(@PathVariable Long farmId) {
        List<HouseResponse> response = productionService.getHouses(farmId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Create a new bed")
    @PostMapping("/beds")
    public ResponseEntity<ApiResponse<BedResponse>> createBed(@Valid @RequestBody BedRequest request) {
        BedResponse response = productionService.createBed(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Bed created successfully", response));
    }

    @Operation(summary = "Get beds for a house")
    @GetMapping("/houses/{houseId}/beds")
    public ResponseEntity<ApiResponse<List<BedResponse>>> getBeds(@PathVariable Long houseId) {
        List<BedResponse> response = productionService.getBeds(houseId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // --- Line Endpoints ---

    @Operation(summary = "Create a new line")
    @PostMapping("/lines")
    public ResponseEntity<ApiResponse<LineResponse>> createLine(@Valid @RequestBody LineRequest request) {
        LineResponse response = productionService.createLine(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Line created successfully", response));
    }

    @Operation(summary = "Get lines for a house")
    @GetMapping("/houses/{houseId}/lines")
    public ResponseEntity<ApiResponse<List<LineResponse>>> getLines(@PathVariable Long houseId) {
        List<LineResponse> response = productionService.getLines(houseId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get beds for a line")
    @GetMapping("/lines/{lineId}/beds")
    public ResponseEntity<ApiResponse<List<BedResponse>>> getBedsByLine(@PathVariable Long lineId) {
        List<BedResponse> response = productionService.getBedsByLine(lineId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // --- Crop Endpoints ---

    @Operation(summary = "Create a new crop")
    @PostMapping("/crops")
    public ResponseEntity<ApiResponse<CropResponse>> createCrop(@Valid @RequestBody CropRequest request) {
        CropResponse response = productionService.createCrop(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Crop created successfully", response));
    }

    @Operation(summary = "Get all crops")
    @GetMapping("/crops")
    public ResponseEntity<ApiResponse<List<CropResponse>>> getAllCrops() {
        List<CropResponse> response = productionService.getAllCrops();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // --- Planting Endpoints ---

    @Operation(summary = "Register a planting")
    @PostMapping("/plantings")
    public ResponseEntity<ApiResponse<PlantingResponse>> createPlanting(@Valid @RequestBody PlantingRequest request) {
        PlantingResponse response = productionService.createPlanting(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Planting registered successfully", response));
    }

    @Operation(summary = "Get plantings for a season")
    @GetMapping("/seasons/{seasonId}/plantings")
    public ResponseEntity<ApiResponse<List<PlantingResponse>>> getPlantingsBySeason(@PathVariable Long seasonId) {
        List<PlantingResponse> response = productionService.getPlantingsBySeason(seasonId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get all plantings for a farm")
    @GetMapping("/farms/{farmId}/plantings")
    public ResponseEntity<ApiResponse<List<PlantingResponse>>> getPlantingsByFarm(@PathVariable Long farmId) {
        List<PlantingResponse> response = productionService.getPlantingsByFarm(farmId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Delete a planting")
    @DeleteMapping("/plantings/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePlanting(@PathVariable Long id) {
        productionService.deletePlanting(id);
        return ResponseEntity.ok(ApiResponse.success("Planting deleted successfully", null));
    }

    @Operation(summary = "Delete a crop/variety")
    @DeleteMapping("/crops/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCrop(@PathVariable Long id) {
        productionService.deleteCrop(id);
        return ResponseEntity.ok(ApiResponse.success("Crop deleted successfully", null));
    }
}
