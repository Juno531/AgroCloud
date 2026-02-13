package com.farm.erp.core.production.repository;

import com.farm.erp.core.production.domain.PestRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PestRecordRepository extends JpaRepository<PestRecord, Long> {

    List<PestRecord> findByBedId(Long bedId);

    List<PestRecord> findByRecordDateBetween(LocalDate startDate, LocalDate endDate);

    List<PestRecord> findByPestType(PestRecord.PestType pestType);

    List<PestRecord> findByBed_Line_HouseId(Long houseId);

    List<PestRecord> findByBed_Line_House_FarmId(Long farmId);

    @Query("SELECT p FROM PestRecord p WHERE p.bed.line.house.farm.id = :farmId ORDER BY p.recordDate DESC")
    List<PestRecord> findByFarmIdOrderByRecordDateDesc(Long farmId);
}
