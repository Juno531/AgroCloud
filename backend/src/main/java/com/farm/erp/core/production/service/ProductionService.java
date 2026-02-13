package com.farm.erp.core.production.service;

import com.farm.erp.common.exception.BusinessException;
import com.farm.erp.common.exception.ErrorCode;
import com.farm.erp.core.auth.domain.User;
import com.farm.erp.core.auth.repository.UserRepository;
import com.farm.erp.core.farm.domain.Farm;
import com.farm.erp.core.farm.repository.FarmRepository;
import com.farm.erp.core.production.domain.*;
import com.farm.erp.core.production.dto.*;
import com.farm.erp.core.production.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Production Service
 * Handles production structure (Season, House, Line, Bed) and planting
 * management
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductionService {

        private final SeasonRepository seasonRepository;
        private final HouseRepository houseRepository;
        private final LineRepository lineRepository;
        private final BedRepository bedRepository;
        private final CropRepository cropRepository;
        private final PlantingRepository plantingRepository;
        private final FarmRepository farmRepository;

        private final UserRepository userRepository;

        private Long getCurrentUserId() {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication == null || !authentication.isAuthenticated()) {
                        throw new BusinessException(ErrorCode.UNAUTHORIZED, "User not authenticated");
                }
                String email = authentication.getName();
                return userRepository.findByEmail(email)
                                .map(User::getId)
                                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        }

        // ========== Season Management ==========

        @Transactional
        public SeasonResponse createSeason(SeasonRequest request) {
                Long userId = getCurrentUserId();
                Farm farm = farmRepository.findByIdAndUserId(request.getFarmId(), userId)
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Farm not found or access denied"));

                Season season = Season.builder()
                                .farm(farm)
                                .name(request.getName())
                                .startDate(request.getStartDate())
                                .endDate(request.getEndDate())
                                .status(SeasonStatus.PLANNED)
                                .description(request.getDescription())
                                .build();

                Season saved = seasonRepository.save(season);
                log.info("Created season: {}", saved.getName());
                return SeasonResponse.from(saved);
        }

        public List<SeasonResponse> getSeasons(Long farmId) {
                // TODO: Add read permission check?
                return seasonRepository.findByFarmIdOrderByStartDateDesc(farmId).stream()
                                .map(SeasonResponse::from)
                                .collect(Collectors.toList());
        }

        @Transactional
        public void startSeason(Long id) {
                Long userId = getCurrentUserId();
                Season season = seasonRepository.findById(id)
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Season not found"));

                if (!season.getFarm().getUserId().equals(userId)) {
                        throw new BusinessException(ErrorCode.FORBIDDEN, "Access denied");
                }

                // TODO: Add logic to check if another season is active?
                season.updateStatus(SeasonStatus.ACTIVE);
                log.info("Started season: {}", season.getName());
        }

        @Transactional
        public void endSeason(Long id) {
                Long userId = getCurrentUserId();
                Season season = seasonRepository.findById(id)
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Season not found"));

                if (!season.getFarm().getUserId().equals(userId)) {
                        throw new BusinessException(ErrorCode.FORBIDDEN, "Access denied");
                }

                season.updateStatus(SeasonStatus.COMPLETED);
                log.info("Ended season: {}", season.getName());
        }

        // ========== House Management ==========

        @Transactional
        public HouseResponse createHouse(HouseRequest request) {
                Long userId = getCurrentUserId();
                Farm farm = farmRepository.findByIdAndUserId(request.getFarmId(), userId)
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Farm not found or access denied"));

                House house = House.builder()
                                .farm(farm)
                                .name(request.getName())
                                .houseType(request.getHouseType())
                                .width(request.getWidth())
                                .length(request.getLength())
                                .area(request.getArea())
                                .description(request.getDescription())
                                .build();

                House saved = houseRepository.save(house);
                log.info("Created house: {}", saved.getName());
                return HouseResponse.from(saved);
        }

        public List<HouseResponse> getHouses(Long farmId) {
                return houseRepository.findByFarmIdOrderByNameAsc(farmId).stream()
                                .map(HouseResponse::from)
                                .collect(Collectors.toList());
        }

        // ========== Line Management ==========

        @Transactional
        public LineResponse createLine(LineRequest request) {
                Long userId = getCurrentUserId();
                House house = houseRepository.findById(request.getHouseId())
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "House not found"));

                if (!house.getFarm().getUserId().equals(userId)) {
                        throw new BusinessException(ErrorCode.FORBIDDEN, "Access denied");
                }

                if (lineRepository.existsByHouseIdAndLineNumber(house.getId(), request.getLineNumber())) {
                        throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE,
                                        "Line number already exists in this house");
                }

                Line line = Line.builder()
                                .house(house)
                                .name(request.getName())
                                .lineNumber(request.getLineNumber())
                                .bedCount(request.getBedCount())
                                .lengthMeters(request.getLengthMeters())
                                .description(request.getDescription())
                                .build();

                Line saved = lineRepository.save(line);
                log.info("Created line: {} in house {}", saved.getName(), house.getName());
                return LineResponse.from(saved);
        }

        public List<LineResponse> getLines(Long houseId) {
                return lineRepository.findByHouseIdOrderByLineNumberAsc(houseId).stream()
                                .map(LineResponse::from)
                                .collect(Collectors.toList());
        }

        // ========== Bed Management ==========

        @Transactional
        public BedResponse createBed(BedRequest request) {
                Long userId = getCurrentUserId();
                Line line = lineRepository.findById(request.getLineId())
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Line not found"));

                if (!line.getHouse().getFarm().getUserId().equals(userId)) {
                        throw new BusinessException(ErrorCode.FORBIDDEN, "Access denied");
                }

                if (bedRepository.existsByLineIdAndBedNumber(line.getId(), request.getBedNumber())) {
                        throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE,
                                        "Bed number already exists in this line");
                }

                Bed bed = Bed.builder()
                                .line(line)
                                .name(request.getName())
                                .bedNumber(request.getBedNumber())
                                .rowPosition(request.getRowPosition())
                                .columnPosition(request.getColumnPosition())
                                .lengthMeters(request.getLengthMeters())
                                .plantCapacity(request.getPlantCapacity())
                                .description(request.getDescription())
                                .build();

                Bed saved = bedRepository.save(bed);
                log.info("Created bed: {} in line {}", saved.getName(), line.getName());
                return BedResponse.from(saved);
        }

        public List<BedResponse> getBeds(Long houseId) {
                // Note: This method originally returned beds by houseId.
                // Since Bed is now under Line, we can either fetch all lines for the house and
                // then all beds,
                // or use the repository method that joins tables if available.
                // BedRepository has findByLine_HouseId
                return bedRepository.findByLine_HouseId(houseId).stream()
                                .map(BedResponse::from)
                                .collect(Collectors.toList());
        }

        public List<BedResponse> getBedsByLine(Long lineId) {
                return bedRepository.findByLineIdOrderByBedNumberAsc(lineId).stream()
                                .map(BedResponse::from)
                                .collect(Collectors.toList());
        }

        // ========== Crop Management ==========

        @Transactional
        public CropResponse createCrop(CropRequest request) {
                // Crops are global for now? Or farm specific?
                // Assuming global or no restriction for now based on previous code.
                // If farm specific, need farmId in request.

                Crop crop = Crop.builder()
                                .name(request.getName())
                                .variety(request.getVariety())
                                .scientificName(request.getScientificName())
                                .standardGrowthDays(request.getStandardGrowthDays())
                                .description(request.getDescription())
                                .build();

                Crop saved = cropRepository.save(crop);
                log.info("Created crop: {}", saved.getName());
                return CropResponse.from(saved);
        }

        public List<CropResponse> getAllCrops() {
                return cropRepository.findAll().stream()
                                .map(CropResponse::from)
                                .collect(Collectors.toList());
        }

        // ========== Planting Management ==========

        @Transactional
        public PlantingResponse createPlanting(PlantingRequest request) {
                Long userId = getCurrentUserId();
                Season season = seasonRepository.findById(request.getSeasonId())
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Season not found"));

                if (!season.getFarm().getUserId().equals(userId)) {
                        throw new BusinessException(ErrorCode.FORBIDDEN, "Access denied");
                }

                Crop crop = cropRepository.findById(request.getCropId())
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Crop not found"));

                Bed bed = bedRepository.findById(request.getBedId())
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Bed not found"));

                // Verify bed belongs to the same farm (implicit via season check, but good to
                // be safe)
                if (!bed.getLine().getHouse().getFarm().getId().equals(season.getFarm().getId())) {
                        throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE,
                                        "Bed does not belong to the season's farm");
                }

                Planting planting = Planting.builder()
                                .season(season)
                                .crop(crop)
                                .bed(bed)
                                .plantingDate(request.getPlantingDate())
                                .plantCount(request.getPlantCount())
                                .status(Planting.PlantingStatus.ACTIVE) // Default status
                                .notes(request.getNotes())
                                .build();

                Planting saved = plantingRepository.save(planting);
                log.info("Created planting for crop {} in bed {}", crop.getName(), bed.getName());
                return PlantingResponse.from(saved);
        }

        public List<PlantingResponse> getPlantingsBySeason(Long seasonId) {
                return plantingRepository.findBySeasonId(seasonId).stream()
                                .map(PlantingResponse::from)
                                .collect(Collectors.toList());
        }

        public List<PlantingResponse> getPlantingsByFarm(Long farmId) {
                Long userId = getCurrentUserId();
                // Verify user has access to this farm
                farmRepository.findByIdAndUserId(farmId, userId)
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Farm not found or access denied"));

                return plantingRepository.findByBed_Line_House_FarmId(farmId).stream()
                                .map(PlantingResponse::from)
                                .collect(Collectors.toList());
        }

        @Transactional
        public void deletePlanting(Long id) {
                Long userId = getCurrentUserId();
                Planting planting = plantingRepository.findById(id)
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Planting not found"));

                // Check if user owns the farm
                if (!planting.getSeason().getFarm().getUserId().equals(userId)) {
                        throw new BusinessException(ErrorCode.FORBIDDEN, "Access denied");
                }

                plantingRepository.delete(planting);
                log.info("Deleted planting ID: {}", id);
        }

        @Transactional
        public void deleteCrop(Long id) {
                // Note: Crops are currently global (not user-specific)
                // If we need user-specific crops in the future, add authorization check
                Crop crop = cropRepository.findById(id)
                                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND,
                                                "Crop not found"));

                cropRepository.delete(crop);
                log.info("Deleted crop: {}", crop.getName());
        }
}
