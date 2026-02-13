package com.farm.erp.core.production.repository;

import com.farm.erp.core.production.domain.WorkRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WorkRecordRepository extends JpaRepository<WorkRecord, Long> {

    List<WorkRecord> findByBedId(Long bedId);

    List<WorkRecord> findByWorkDate(LocalDate workDate);

    List<WorkRecord> findByBedIdAndWorkDate(Long bedId, LocalDate workDate);

    @Query("SELECT w FROM WorkRecord w WHERE w.workDate = :workDate ORDER BY w.bed.line.lineNumber ASC, w.bed.bedNumber ASC")
    List<WorkRecord> findByWorkDateOrderByBedLineLineNumberAscAndBedBedNumberAsc(LocalDate workDate);

    List<WorkRecord> findByBed_Line_HouseId(Long houseId);

    List<WorkRecord> findByBed_Line_House_FarmId(Long farmId);

    @Query("SELECT w FROM WorkRecord w WHERE w.bed.line.house.farm.id = :farmId AND w.workDate = :workDate ORDER BY w.bed.line.lineNumber, w.bed.bedNumber")
    List<WorkRecord> findByFarmIdAndWorkDate(Long farmId, LocalDate workDate);

    List<WorkRecord> findByWorkType(WorkRecord.WorkType workType);
}
