package com.farm.erp.core.production.repository;

import com.farm.erp.core.production.domain.NutrientRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface NutrientRecordRepository extends JpaRepository<NutrientRecord, Long> {

    /**
     * Find all nutrient records by bed ID, ordered by record date descending
     */
    List<NutrientRecord> findByBedIdOrderByRecordDateDesc(Long bedId);

    /**
     * Find all nutrient records by planting ID, ordered by record date descending
     */
    List<NutrientRecord> findByPlantingIdOrderByRecordDateDesc(Long plantingId);

    /**
     * Find all nutrient records by farm ID through bed relation
     */
    @Query("SELECT nr FROM NutrientRecord nr " +
            "JOIN nr.bed b " +
            "JOIN b.line l " +
            "JOIN l.house h " +
            "WHERE h.farm.id = :farmId " +
            "ORDER BY nr.recordDate DESC")
    List<NutrientRecord> findByFarmIdOrderByRecordDateDesc(@Param("farmId") Long farmId);

    /**
     * Find nutrient records by date range
     */
    List<NutrientRecord> findByRecordDateBetweenOrderByRecordDateDesc(LocalDate startDate, LocalDate endDate);
}
