package com.farm.erp.core.production.repository;

import com.farm.erp.core.production.domain.Crop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CropRepository extends JpaRepository<Crop, Long> {
    boolean existsByName(String name);
}
