package com.farm.erp.core.production.repository;

import com.farm.erp.core.production.domain.Planting;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlantingRepository extends JpaRepository<Planting, Long> {
    @EntityGraph(attributePaths = { "season", "bed", "crop" })
    List<Planting> findBySeasonId(Long seasonId);

    @EntityGraph(attributePaths = { "season", "bed", "crop" })
    List<Planting> findByBedId(Long bedId);

    @EntityGraph(attributePaths = { "season", "bed", "crop" })
    List<Planting> findBySeasonIdAndBedId(Long seasonId, Long bedId);

    @EntityGraph(attributePaths = { "season", "bed", "crop" })
    List<Planting> findByBed_Line_House_FarmId(Long farmId);
}
