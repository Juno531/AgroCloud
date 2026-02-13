package com.farm.erp.core.hr.repository;

import com.farm.erp.core.hr.domain.EmployeeProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeProfileRepository extends JpaRepository<EmployeeProfile, Long> {
    Optional<EmployeeProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    List<EmployeeProfile> findByFarmId(Long farmId);
}
