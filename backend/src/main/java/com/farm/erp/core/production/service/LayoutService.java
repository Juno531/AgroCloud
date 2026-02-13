package com.farm.erp.core.production.service;

import com.farm.erp.common.exception.BusinessException;
import com.farm.erp.common.exception.ErrorCode;
import com.farm.erp.core.auth.domain.User;
import com.farm.erp.core.auth.repository.UserRepository;
import com.farm.erp.core.farm.domain.Farm;
import com.farm.erp.core.farm.repository.FarmRepository;
import com.farm.erp.core.production.domain.HouseLayout;
import com.farm.erp.core.production.dto.HouseLayoutRequest;
import com.farm.erp.core.production.dto.HouseLayoutResponse;
import com.farm.erp.core.production.repository.HouseLayoutRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class LayoutService {

    private final HouseLayoutRepository houseLayoutRepository;
    private final FarmRepository farmRepository;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.UNAUTHORIZED, "User not found"));
        return user.getId();
    }

    @Transactional
    public HouseLayoutResponse saveLayout(Long farmId, HouseLayoutRequest request) {
        Long userId = getCurrentUserId();

        // Verify farm exists and user has access
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Farm not found"));

        if (!farm.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Access denied");
        }

        // Check if layout already exists
        HouseLayout layout = houseLayoutRepository.findByFarmId(farmId)
                .orElse(null);

        if (layout == null) {
            // Create new layout
            layout = HouseLayout.builder()
                    .farm(farm)
                    .layoutData(request.getLayoutData())
                    .build();
            log.info("Creating new layout for farm ID: {}", farmId);
        } else {
            // Update existing layout
            layout.updateLayoutData(request.getLayoutData());
            log.info("Updating existing layout for farm ID: {}", farmId);
        }

        HouseLayout saved = houseLayoutRepository.save(layout);
        return HouseLayoutResponse.from(saved);
    }

    public HouseLayoutResponse getLayout(Long farmId) {
        Long userId = getCurrentUserId();

        // Verify farm exists and user has access
        Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Farm not found"));

        if (!farm.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN, "Access denied");
        }

        HouseLayout layout = houseLayoutRepository.findByFarmId(farmId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Layout not found"));

        return HouseLayoutResponse.from(layout);
    }
}
