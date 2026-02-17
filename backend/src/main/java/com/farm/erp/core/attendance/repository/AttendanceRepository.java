package com.farm.erp.core.attendance.repository;

import com.farm.erp.core.attendance.domain.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<AttendanceRecord, Long> {

        List<AttendanceRecord> findByUserIdOrderByTimestampDesc(Long userId);

        List<AttendanceRecord> findByFarmIdOrderByTimestampDesc(Long farmId);

        List<AttendanceRecord> findByUserIdAndTimestampBetweenOrderByTimestampDesc(
                        Long userId, LocalDateTime start, LocalDateTime end);

        List<AttendanceRecord> findByFarmIdAndTimestampBetweenOrderByTimestampDesc(
                        Long farmId, LocalDateTime start, LocalDateTime end);

        List<AttendanceRecord> findByCompanyCodeOrderByTimestampDesc(String companyCode);

        List<AttendanceRecord> findByCompanyCodeAndTimestampBetweenOrderByTimestampDesc(
                        String companyCode, LocalDateTime start, LocalDateTime end);
}
