package com.farm.erp.core.attendance.repository;

import com.farm.erp.core.attendance.domain.LeaveRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveRepository extends JpaRepository<LeaveRecord, Long> {

        @Query("SELECT l FROM LeaveRecord l JOIN FETCH l.user WHERE l.user.id = :userId")
        List<LeaveRecord> findByUserId(@Param("userId") Long userId);

        @Query("SELECT l FROM LeaveRecord l JOIN FETCH l.user WHERE l.user.id = :userId AND l.leaveDate BETWEEN :startDate AND :endDate")
        List<LeaveRecord> findByUserIdAndLeaveDateBetween(@Param("userId") Long userId,
                        @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

        @Query("SELECT l FROM LeaveRecord l JOIN FETCH l.user WHERE l.user.id = :userId AND l.leaveDate = :leaveDate")
        Optional<LeaveRecord> findByUserIdAndLeaveDate(@Param("userId") Long userId,
                        @Param("leaveDate") LocalDate leaveDate);

        void deleteByUserIdAndLeaveDate(Long userId, LocalDate leaveDate);

        @org.springframework.data.jpa.repository.Modifying
        @org.springframework.transaction.annotation.Transactional
        void deleteByUserId(Long userId);

        List<LeaveRecord> findByLeaveDateBetween(LocalDate startDate, LocalDate endDate);
}
