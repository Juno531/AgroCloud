package com.farm.erp.core.auth.repository;

import com.farm.erp.core.auth.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByRole(User.Role role);

    java.util.List<User> findAllByCompanyId(Long companyId);

    java.util.List<User> findAllByCompany_Code(String companyCode);
}
