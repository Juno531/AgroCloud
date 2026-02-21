package com.farm.erp.core.auth.repository;

import com.farm.erp.core.auth.domain.RefreshToken;
import com.farm.erp.core.auth.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByUserId(Long userId);

    Optional<RefreshToken> findByUser(User user);

    @Modifying
    int deleteByUser(User user);
}
