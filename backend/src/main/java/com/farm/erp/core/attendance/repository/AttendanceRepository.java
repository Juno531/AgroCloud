package com.farm.erp.core.attendance.repository;

import com.farm.erp.core.attendance.domain.AttendanceRecord;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttendanceRepository
                extends JpaRepository<AttendanceRecord, Long>, QuerydslPredicateExecutor<AttendanceRecord> {

        @EntityGraph(attributePaths = { "user" })
        List<AttendanceRecord> findByUserIdOrderByTimestampDesc(Long userId);

        @EntityGraph(attributePaths = { "user" })
        List<AttendanceRecord> findByFarmIdOrderByTimestampDesc(Long farmId);

        @EntityGraph(attributePaths = { "user" })
        List<AttendanceRecord> findByUserIdAndTimestampBetweenOrderByTimestampDesc(
                        Long userId, LocalDateTime start, LocalDateTime end);

        @EntityGraph(attributePaths = { "user" })
        List<AttendanceRecord> findByFarmIdAndTimestampBetweenOrderByTimestampDesc(
                        Long farmId, LocalDateTime start, LocalDateTime end);

        @EntityGraph(attributePaths = { "user" })
        List<AttendanceRecord> findByCompanyCodeOrderByTimestampDesc(String companyCode);

        @EntityGraph(attributePaths = { "user" })
        List<AttendanceRecord> findByCompanyCodeAndTimestampBetweenOrderByTimestampDesc(
                        String companyCode, LocalDateTime start, LocalDateTime end);

        void deleteByFarmId(Long farmId);

        // 오늘 특정 companyCode의 CLOCK_IN 레코드 조회 (출근 현황용)
        @EntityGraph(attributePaths = { "user" })
        List<AttendanceRecord> findByCompanyCodeAndTypeAndTimestampBetweenOrderByTimestampDesc(
                        String companyCode, AttendanceRecord.AttendanceType type,
                        LocalDateTime start, LocalDateTime end);

        // PENDING 상태 출근 목록 조회 (승인 대기용)
        @EntityGraph(attributePaths = { "user" })
        List<AttendanceRecord> findByCompanyCodeAndStatusOrderByTimestampDesc(
                        String companyCode, AttendanceRecord.RecordStatus status);
}
