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
        String email = getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED));
        return user.getId();
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

        Farm farm = farmRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FARM_NOT_FOUND));

        return FarmResponse.from(farm);
    }

    /**
     * Get all farms (현재 사용자의 농장만 반환)
     */
    public PageResponse<FarmResponse> getAllFarms(Pageable pageable) {
        Long userId = getCurrentUserId();

        // 사용자별 농장 조회
        List<Farm> userFarms = farmRepository.findByUserId(userId);

        // 페이지네이션 적용
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), userFarms.size());

        List<FarmResponse> content = userFarms.subList(start, end)
                .stream()
                .map(FarmResponse::from)
                .collect(Collectors.toList());

        Page<FarmResponse> page = new PageImpl<>(content, pageable, userFarms.size());

        return PageResponse.from(page);
    }

    /**
     * Update farm (본인 농장만 수정 가능)
     */
    @Transactional
    @CacheEvict(value = "farms", key = "#id")
    public FarmResponse updateFarm(Long id, FarmRequest request) {
        Long userId = getCurrentUserId();

        Farm farm = farmRepository.findByIdAndUserId(id, userId)
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
                request.getContactNumber());

        log.info("Updated farm: {} for user: {}", id, userId);

        return FarmResponse.from(farm);
    }

    /**
     * Delete farm (본인 농장만 삭제 가능 - Soft delete by changing status)
     */
    @Transactional
    @CacheEvict(value = "farms", key = "#id")
    public void deleteFarm(Long id) {
        Long userId = getCurrentUserId();

        Farm farm = farmRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.FARM_NOT_FOUND));

        farm.deactivate();
        log.info("Deactivated farm: {} for user: {}", id, userId);
    }
}
