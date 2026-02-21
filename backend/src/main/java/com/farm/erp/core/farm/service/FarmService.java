package com.farm.erp.core.farm.service;

import com.farm.erp.common.dto.PageResponse;
import com.farm.erp.common.exception.BusinessException;
import com.farm.erp.common.exception.ErrorCode;
import com.farm.erp.core.auth.domain.User;
import com.farm.erp.core.auth.repository.UserRepository;
import com.farm.erp.core.farm.domain.Farm;
import com.farm.erp.core.farm.domain.FarmStatus;
import com.farm.erp.core.farm.dto.FarmRequest;
import com.farm.erp.core.farm.dto.FarmResponse;
import com.farm.erp.core.farm.repository.FarmRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Farm domain service
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FarmService {

    private final FarmRepository farmRepository;
    private final UserRepository userRepository;
    private final com.farm.erp.core.hr.repository.EmployeeProfileRepository employeeProfileRepository;
    private final com.farm.erp.core.attendance.repository.AttendanceRepository attendanceRepository;

    /**
     * 현재 로그인한 사용자의 email 가져오기
     */
    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            return ((UserDetails) authentication.getPrincipal()).getUsername();
        }
        throw new BusinessException(ErrorCode.UNAUTHORIZED);
    }

    /**
     * 현재 로그인한 사용자의 ID 가져오기
     */
    private Long getCurrentUserId() {
        return getCurrentUser().getId();
    }

    /**
     * 현재 로그인한 사용자 정보 가져오기
     */
    private User getCurrentUser() {
        String email = getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
    }

    /**
     * Create a new farm
     */
    @Transactional
    @CacheEvict(value = "farms", allEntries = true)
    public FarmResponse createFarm(FarmRequest request) {
        Long userId = getCurrentUserId();

        // 같은 사용자의 농장 중 이름 중복 체크
        if (farmRepository.existsByNameAndUserId(request.getName(), userId)) {
            throw new BusinessException(ErrorCode.FARM_ALREADY_EXISTS);
        }

        Farm farm = Farm.builder()
                .name(request.getName())
                .location(request.getLocation())
                .area(request.getArea())
                .description(request.getDescription())
                .ownerName(request.getOwnerName())
                .contactNumber(request.getContactNumber())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .attendanceRadius(request.getAttendanceRadius() != null ? request.getAttendanceRadius() : 300) // Default
                                                                                                               // 300m
                .attendanceWifiSsid(request.getAttendanceWifiSsid())
                .attendanceWifiBssid(request.getAttendanceWifiBssid())
                .attendanceIpAddress(request.getAttendanceIpAddress())
                .status(FarmStatus.ACTIVE)
                .userId(userId) // 현재 사용자 ID 설정
                .build();

        Farm savedFarm = farmRepository.save(farm);
        log.info("Created new farm: {} for user: {}", savedFarm.getId(), userId);

        return FarmResponse.from(savedFarm);
    }

    /**
     * Get farm by ID (본인 농장만 조회 가능)
     */
    @Cacheable(value = "farms", key = "#id")
    public FarmResponse getFarm(Long id) {
        Long userId = getCurrentUserId();

        Farm farm = farmRepository.findByIdAndUserIdAndStatus(id, userId, FarmStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException(ErrorCode.FARM_NOT_FOUND));

        return FarmResponse.from(farm);
    }

    /**
     * Get all farms
     * - ADMIN: 본인의 농장만 반환
     * - USER (Employee): 소속 회사의 모든 농장 반환
     */
    public PageResponse<FarmResponse> getAllFarms(Pageable pageable) {
        User currentUser = getCurrentUser();
        List<Farm> farms;

        if (currentUser.getRole() == User.Role.USER) {
            // 직원의 경우 소속 회사의 모든 농장 조회
            if (currentUser.getCompany() == null) {
                log.warn("User {} (USER role) has no assigned company code", currentUser.getEmail());
                farms = List.of();
            } else {
                String companyCode = currentUser.getCompany().getCode();
                log.info("Fetching farms for company: {} for user: {}", companyCode, currentUser.getEmail());
                farms = farmRepository.findByCompanyCodeAndStatus(companyCode, FarmStatus.ACTIVE);
                log.info("Found {} farms for company code: {}", farms.size(), companyCode);
            }
        } else {
            // 어드민의 경우 본인의 농장만 조회
            log.info("Fetching farms for admin: {}", currentUser.getEmail());
            farms = farmRepository.findByUserIdAndStatus(currentUser.getId(), FarmStatus.ACTIVE);
            log.info("Found {} farms for admin user ID: {}", farms.size(), currentUser.getId());
        }

        // 페이지네이션 적용
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), farms.size());

        List<FarmResponse> content = (start < farms.size())
                ? farms.subList(start, end).stream()
                        .map(FarmResponse::from)
                        .collect(Collectors.toList())
                : List.of();

        Page<FarmResponse> page = new PageImpl<>(content, pageable, farms.size());

        return PageResponse.from(page);
    }

    /**
     * Update farm (본인 농장만 수정 가능)
     */
    @Transactional
    @CacheEvict(value = "farms", key = "#id")
    public FarmResponse updateFarm(Long id, FarmRequest request) {
        Long userId = getCurrentUserId();

        Farm farm = farmRepository.findByIdAndUserIdAndStatus(id, userId, FarmStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException(ErrorCode.FARM_NOT_FOUND));

        // Check name uniqueness if name is changed (같은 사용자 내에서)
        if (!farm.getName().equals(request.getName()) &&
                farmRepository.existsByNameAndUserId(request.getName(), userId)) {
            throw new BusinessException(ErrorCode.FARM_ALREADY_EXISTS);
        }

        farm.update(
                request.getName(),
                request.getLocation(),
                request.getArea(),
                request.getDescription(),
                request.getOwnerName(),
                request.getContactNumber(),
                request.getLatitude(),
                request.getLongitude(),
                request.getAttendanceRadius(),
                request.getAttendanceWifiSsid(),
                request.getAttendanceWifiBssid(),
                request.getAttendanceIpAddress());

        log.info("Updated farm: {} for user: {}", id, userId);

        return FarmResponse.from(farm);
    }

    /**
     * Delete farm (Hard Delete)
     * - Unlink employees
     * - Delete attendance records
     * - Delete farm entity
     */
    @Transactional
    @CacheEvict(value = "farms", key = "#id")
    public void deleteFarm(Long id) {
        Long userId = getCurrentUserId();

        Farm farm = farmRepository.findByIdAndUserIdAndStatus(id, userId, FarmStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException(ErrorCode.FARM_NOT_FOUND));

        // 1. Unlink employees
        List<com.farm.erp.core.hr.domain.EmployeeProfile> employees = employeeProfileRepository.findByFarmId(id);
        for (com.farm.erp.core.hr.domain.EmployeeProfile employee : employees) {
            employee.unassignFarm();
            // Transactional context will automatically flush changes (Dirty Checking)
        }

        // 2. Delete attendance records
        attendanceRepository.deleteByFarmId(id);

        // 3. Delete farm entity (Hard Delete)
        farmRepository.delete(farm);

        log.info("Deleted farm (Hard Delete): {} for user: {}", id, userId);
    }
}
