package com.farm.erp.core.attendance.service;

import com.farm.erp.core.attendance.domain.AttendanceRecord;
import com.farm.erp.core.attendance.repository.AttendanceRepository;
import com.farm.erp.core.auth.domain.User;
import com.farm.erp.core.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    @Transactional
    public AttendanceRecord recordAttendance(Long userId, AttendanceRecord.AttendanceType type, Long farmId,
            String companyCode) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Validate: prevent duplicate clock-ins
        List<AttendanceRecord> recentRecords = attendanceRepository
                .findByUserIdAndTimestampBetweenOrderByTimestampDesc(
                        userId,
                        LocalDateTime.now().minusHours(24),
                        LocalDateTime.now());

        if (!recentRecords.isEmpty()) {
            AttendanceRecord lastRecord = recentRecords.get(0);

            // Prevent consecutive same type records
            if (lastRecord.getType() == type) {
                throw new IllegalStateException(
                        type == AttendanceRecord.AttendanceType.CLOCK_IN
                                ? "이미 출근 처리되었습니다."
                                : "이미 퇴근 처리되었습니다.");
            }
        }

        AttendanceRecord record = AttendanceRecord.builder()
                .user(user)
                .type(type)
                .timestamp(LocalDateTime.now())
                .farmId(farmId)
                .companyCode(companyCode)
                .build();

        return attendanceRepository.save(record);
    }

    public List<AttendanceRecord> getUserAttendance(Long userId) {
        return attendanceRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    public List<AttendanceRecord> getFarmAttendance(Long farmId) {
        return attendanceRepository.findByFarmIdOrderByTimestampDesc(farmId);
    }

    public List<AttendanceRecord> getFarmAttendanceInRange(Long farmId, LocalDateTime start, LocalDateTime end) {
        return attendanceRepository.findByFarmIdAndTimestampBetweenOrderByTimestampDesc(farmId, start, end);
    }

    public List<AttendanceRecord> getCompanyAttendance(String companyCode) {
        return attendanceRepository.findByCompanyCodeOrderByTimestampDesc(companyCode);
    }

    public List<AttendanceRecord> getCompanyAttendanceInRange(String companyCode, LocalDateTime start,
            LocalDateTime end) {
        return attendanceRepository.findByCompanyCodeAndTimestampBetweenOrderByTimestampDesc(companyCode, start, end);
    }

    /**
     * Get user's current attendance status
     * 
     * @return CLOCK_IN if user is currently clocked in, CLOCK_OUT if clocked out,
     *         null if no records
     */
    public AttendanceRecord.AttendanceType getUserStatus(Long userId) {
        List<AttendanceRecord> recentRecords = attendanceRepository
                .findByUserIdAndTimestampBetweenOrderByTimestampDesc(
                        userId,
                        LocalDateTime.now().minusHours(24),
                        LocalDateTime.now());

        if (recentRecords.isEmpty()) {
            return null; // No recent records
        }

        // Return the type of the most recent record
        return recentRecords.get(0).getType();
    }
}
