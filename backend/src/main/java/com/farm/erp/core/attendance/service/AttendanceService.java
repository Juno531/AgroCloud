package com.farm.erp.core.attendance.service;

import com.farm.erp.core.attendance.domain.AttendanceRecord;
import com.farm.erp.core.attendance.repository.AttendanceRepository;
import com.farm.erp.core.auth.domain.User;
import com.farm.erp.core.auth.repository.UserRepository;
import com.farm.erp.core.farm.repository.FarmRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.IsoFields;
import java.time.DayOfWeek;
import java.time.temporal.TemporalAdjusters;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttendanceService {

    private final FarmRepository farmRepository;
    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;

    @Transactional
    public AttendanceRecord recordAttendance(Long userId, AttendanceRecord.AttendanceType type, Long farmId,
            String companyCode, java.math.BigDecimal latitude, java.math.BigDecimal longitude, String clientIp) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // 유효한 농장인지 확인
        com.farm.erp.core.farm.domain.Farm farm = farmRepository.findById(farmId)
                .orElseThrow(() -> new IllegalArgumentException("Farm not found"));

        // 농장에 위치 정보가 설정되어 있는지 확인
        boolean isIpMatched = false;

        // IP 인증 설정이 되어있을 경우 네트워크 검증 수행
        if (farm.getAttendanceIpAddress() != null && !farm.getAttendanceIpAddress().isEmpty()) {
            // X-Forwarded-For는 여러 IP가 콤마로 구분될 수 있음
            if (clientIp != null) {
                String[] clientIps = clientIp.split(",");
                for (String ip : clientIps) {
                    if (farm.getAttendanceIpAddress().equals(ip.trim())) {
                        isIpMatched = true;
                        break;
                    }
                }
            }

            // IP가 등록되어 있지만 일치하지 않으면 바로 차단 (엄격한 통제)
            if (!isIpMatched) {
                throw new IllegalArgumentException(
                        "지정된 사내 네트워크(" + farm.getAttendanceIpAddress() + ")가 아닙니다. 현재 접속 IP: " + clientIp);
            }
        }

        // IP 일치 상태가 아니면(즉, IP 설정 자체가 안 되어 있는 경우) 거리 검사 실행
        // IP가 일치(isIpMatched == true)하는 경우에는 거리와 상관없이 출퇴근을 허용합니다(생략).
        if (!isIpMatched) {
            if (farm.getLatitude() == null || farm.getLongitude() == null) {
                throw new IllegalStateException("농장의 위치 정보(위도/경도)가 설정되지 않았습니다. 관리자에게 문의하세요.");
            }

            // 사용자의 위치 정보가 있는지 확인
            if (latitude == null || longitude == null) {
                throw new IllegalArgumentException("위치 정보가 없습니다. GPS 권한을 허용해주세요.");
            }

            // 반경 설정 (기본값 300m)
            int radius = farm.getAttendanceRadius() != null ? farm.getAttendanceRadius() : 300;

            // 거리 계산 (Haversine Formula) 및 반경 확인
            double distance = calculateDistance(
                    farm.getLatitude().doubleValue(), farm.getLongitude().doubleValue(),
                    latitude.doubleValue(), longitude.doubleValue());

            if (distance > radius) {
                throw new IllegalArgumentException(
                        String.format("농장 반경 %dm 밖입니다. (현재 거리: %.0fm)", radius, distance));
            }
        }

        // Validate: prevent duplicate clock-ins
        List<AttendanceRecord> recentRecords = attendanceRepository
                .findByUserIdAndTimestampBetweenOrderByTimestampDesc(
                        userId,
                        LocalDateTime.now().minusHours(24),
                        LocalDateTime.now());

        if (!recentRecords.isEmpty()) {
            AttendanceRecord lastRecord = recentRecords.get(0);

            // 동일한 타입이 연속될 경우 처리
            if (lastRecord.getType() == type) {
                // 이미 기록이 있다면 최신 시간으로 업데이트 (출근/퇴근 공통)
                lastRecord.updateTimestamp(LocalDateTime.now());
                return attendanceRepository.save(lastRecord);
            }
        }

        // 1. 달력 기준 이번 주 시작일(월)과 종료일(일) 구하기
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfWeek = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).withHour(0)
                .withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfWeek = now.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).withHour(23).withMinute(59)
                .withSecond(59).withNano(999999999);

        // 2. 이번 주 전체 기록 가져오기
        List<AttendanceRecord> weekRecords = attendanceRepository
                .findByUserIdAndTimestampBetweenOrderByTimestampDesc(userId, startOfWeek, endOfWeek);

        // 3. weekNumber (ISO 기준의 연간 주차)
        int weekNumber = now.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);

        // 4. workingDayIndex 계산
        LocalDate today = now.toLocalDate();
        int workingDayIndex = 1;

        // 오늘 이미 등록된 기록이 있는지 찾기
        boolean hasRecordToday = false;
        long uniqueDaysThisWeek = weekRecords.stream()
                .map(r -> r.getTimestamp().toLocalDate())
                .distinct()
                .count();

        for (AttendanceRecord r : weekRecords) {
            if (r.getTimestamp().toLocalDate().equals(today)) {
                hasRecordToday = true;
                workingDayIndex = r.getWorkingDayIndex() != null ? r.getWorkingDayIndex() : 1;
                break;
            }
        }

        if (!hasRecordToday) {
            // 오늘 등록된 기록이 없다면, 이전 출근 일수 + 1
            workingDayIndex = (int) uniqueDaysThisWeek + 1;
        }

        AttendanceRecord record = AttendanceRecord.builder()
                .user(user)
                .type(type)
                .timestamp(now)
                .farmId(farmId)
                .companyCode(companyCode)
                .weekNumber(weekNumber)
                .workingDayIndex(workingDayIndex)
                .build();

        return attendanceRepository.save(record);
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371 * 1000; // Earth radius in meters

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
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
