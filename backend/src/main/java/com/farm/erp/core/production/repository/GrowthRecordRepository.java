package com.farm.erp.core.production.repository;

import com.farm.erp.core.production.domain.GrowthRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GrowthRecordRepository extends JpaRepository<GrowthRecord, Long> {

    List<GrowthRecord> findByPlantingId(Long plantingId);

    List<GrowthRecord> findByPlanting_CropIdOrderByRecordDateDesc(Long cropId);

    List<GrowthRecord> findByRecordDateBetween(LocalDate startDate, LocalDate endDate);

    List<GrowthRecord> findByPlantingIdOrderByRecordDateDesc(Long plantingId);

    List<GrowthRecord> findByPlanting_Bed_Line_House_FarmId(Long farmId);
}
