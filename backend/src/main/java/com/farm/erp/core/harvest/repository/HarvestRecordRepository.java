package com.farm.erp.core.harvest.repository;

import com.farm.erp.core.harvest.domain.HarvestRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HarvestRecordRepository extends JpaRepository<HarvestRecord, Long> {
    List<HarvestRecord> findBySeasonId(Long seasonId);
    List<HarvestRecord> findByHarvestDate(LocalDate date);
    List<HarvestRecord> findBySeasonIdAndHarvestDateBetween(Long seasonId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT h FROM HarvestRecord h JOIN FETCH h.details WHERE h.season.id = :seasonId")
    List<HarvestRecord> findBySeasonIdWithDetails(@Param("seasonId") Long seasonId);
}
