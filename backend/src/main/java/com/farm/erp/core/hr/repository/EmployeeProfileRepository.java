package com.farm.erp.core.hr.repository;

import com.farm.erp.core.hr.domain.EmployeeProfile;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeProfileRepository extends JpaRepository<EmployeeProfile, Long> {
    @EntityGraph(attributePaths = { "user" })
    Optional<EmployeeProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    @EntityGraph(attributePaths = { "user" })
    List<EmployeeProfile> findByFarmId(Long farmId);

    @EntityGraph(attributePaths = { "user" })
    List<EmployeeProfile> findByUserCompanyCode(String companyCode);

    @Override
    @EntityGraph(attributePaths = { "user" })
    List<EmployeeProfile> findAll();
}
