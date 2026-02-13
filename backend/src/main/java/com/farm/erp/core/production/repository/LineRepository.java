package com.farm.erp.core.production.repository;

import com.farm.erp.core.production.domain.Line;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LineRepository extends JpaRepository<Line, Long> {

    List<Line> findByHouseId(Long houseId);

    List<Line> findByHouseIdOrderByLineNumberAsc(Long houseId);

    List<Line> findByHouse_FarmId(Long farmId);

    boolean existsByHouseIdAndLineNumber(Long houseId, Integer lineNumber);
}
