package com.farm.erp.core.production.repository;

import com.farm.erp.core.production.domain.WorkKeyword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkKeywordRepository extends JpaRepository<WorkKeyword, Long> {
    List<WorkKeyword> findByFarmId(Long farmId);
}
