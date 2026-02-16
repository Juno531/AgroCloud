package com.farm.erp.core.company.repository;

import com.farm.erp.core.company.domain.RegistrationCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RegistrationCodeRepository extends JpaRepository<RegistrationCode, Long> {
    Optional<RegistrationCode> findByCodeAndStatus(String code, RegistrationCode.CodeStatus status);
    List<RegistrationCode> findByCompanyId(Long companyId);
    boolean existsByCode(String code);
}
