package com.farm.erp.core.production.repository;

import com.farm.erp.core.production.domain.Bed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {

    List<Bed> findByLineId(Long lineId);

    List<Bed> findByLineIdAndActiveTrue(Long lineId);

    List<Bed> findByLine_HouseId(Long houseId);

    List<Bed> findByLine_House_FarmId(Long farmId);

    List<Bed> findByLineIdOrderByBedNumberAsc(Long lineId);

    boolean existsByLineIdAndBedNumber(Long lineId, Integer bedNumber);
}
