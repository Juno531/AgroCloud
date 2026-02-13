package com.farm.erp.core.production.repository;

import com.farm.erp.core.production.domain.Season;
import com.farm.erp.core.production.domain.SeasonStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeasonRepository extends JpaRepository<Season, Long> {
    List<Season> findByFarmId(Long farmId);

    List<Season> findByFarmIdOrderByStartDateDesc(Long farmId);

    List<Season> findByFarmIdAndStatus(Long farmId, SeasonStatus status);

    Optional<Season> findByFarmIdAndStatusAndName(Long farmId, SeasonStatus status, String name);
}
