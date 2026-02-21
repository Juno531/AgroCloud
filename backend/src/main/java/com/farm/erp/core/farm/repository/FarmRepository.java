package com.farm.erp.core.farm.repository;

import com.farm.erp.core.farm.domain.Farm;
import com.farm.erp.core.farm.domain.FarmStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Farm repository
 */
@Repository
public interface FarmRepository extends JpaRepository<Farm, Long> {

    /**
     * Find farm by name
     */
    Optional<Farm> findByName(String name);

    /**
     * Find farms by status
     */
    List<Farm> findByStatus(FarmStatus status);

    /**
     * Find farms by status (paginated)
     */
    Page<Farm> findByStatus(FarmStatus status, Pageable pageable);

    /**
     * Find farms by location containing keyword
     */
    @Query("SELECT f FROM Farm f WHERE LOWER(f.location) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Farm> findByLocationContaining(@Param("keyword") String keyword);

    /**
     * Find active farms
     */
    @Query("SELECT f FROM Farm f WHERE f.status = 'ACTIVE' ORDER BY f.name")
    List<Farm> findActiveFarms();

    /**
     * Check if farm exists by name
     */
    boolean existsByName(String name);

    /**
     * Count farms by status
     */
    long countByStatus(FarmStatus status);

    // ========== 사용자별 농장 조회 메서드 ==========

    /**
     * Find farms by user ID
     */
    /**
     * Find farms by user ID
     */
    List<Farm> findByUserId(Long userId);

    /**
     * Find farms by user ID and status
     */
    List<Farm> findByUserIdAndStatus(Long userId, FarmStatus status);

    /**
     * Find farm by ID and user ID (권한 체크용)
     */
    Optional<Farm> findByIdAndUserIdAndStatus(Long id, Long userId, FarmStatus status);

    /**
     * Find farm by ID and user ID (ignoring status)
     */
    Optional<Farm> findByIdAndUserId(Long id, Long userId);

    /**
     * Check if farm exists by name and user ID
     */
    boolean existsByNameAndUserId(String name, Long userId);

    /**
     * Find farms by company code
     */
    @Query("SELECT f FROM Farm f WHERE f.user.company.code = :companyCode AND f.status = :status")
    List<Farm> findByCompanyCodeAndStatus(@Param("companyCode") String companyCode, @Param("status") FarmStatus status);
}
