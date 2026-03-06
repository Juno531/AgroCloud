package com.farm.erp.core.attendance.service;

import com.farm.erp.api.v1.dto.AttendanceSummaryResponse;
import com.farm.erp.core.attendance.domain.AttendanceRecord;
import com.farm.erp.core.attendance.repository.AttendanceRepository;
import com.farm.erp.core.attendance.repository.LeaveRepository;
import com.farm.erp.core.auth.domain.User;
import com.farm.erp.core.auth.repository.UserRepository;
import com.farm.erp.core.farm.repository.FarmRepository;
import com.farm.erp.core.hr.repository.EmployeeProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.IsoFields;
import java.time.DayOfWeek;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttendanceService {

        private final FarmRepository farmRepository;
        private final UserRepository userRepository;
        private final AttendanceRepository attendanceRepository;
        private final LeaveRepository leaveRepository;
        private final EmployeeProfileRepository employeeProfileRepository;

        @Transactional
        public AttendanceRecord recordAttendance(Long userId, AttendanceRecord.AttendanceType type, Long farmId,
                        String companyCode, java.math.BigDecimal latitude, java.math.BigDecimal longitude,
                        String reason, String remarks, Boolean isForceOutside) {
                LocalDateTime now = LocalDateTime.now();
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                com.farm.erp.core.farm.domain.Farm farm = farmRepository.findById(farmId)
                                .orElseThrow(() -> new IllegalArgumentException("Farm not found"));

                if (farm.getLatitude() == null || farm.getLongitude() == null) {
                        throw new IllegalStateException("농장의 위치 정보(위도/경도)가 설정되지 않았습니다. 관리자에게 문의하세요.");
                }
                if (latitude == null || longitude == null) {
                        throw new IllegalArgumentException("위치 정보가 없습니다. GPS 권한을 허용해주세요.");
                }
                int radius = farm.getAttendanceRadius() != null ? farm.getAttendanceRadius() : 300;
                double distance = calculateDistance(
                                farm.getLatitude().doubleValue(), farm.getLongitude().doubleValue(),
                                latitude.doubleValue(), longitude.doubleValue());

                AttendanceRecord.RecordStatus status = AttendanceRecord.RecordStatus.NORMAL;

                if (Boolean.TRUE.equals(isForceOutside) && reason != null && !reason.trim().isEmpty()) {
                        status = AttendanceRecord.RecordStatus.PENDING;
                } else if (distance > radius) {
                        throw new IllegalArgumentException(
                                        String.format("농장 반경 %dm 밖입니다. (현재 거리: %.0fm)", radius, distance));
                }

                if (type == AttendanceRecord.AttendanceType.CLOCK_IN) {
                        LocalTime currentTime = now.toLocalTime();
                        LocalTime startTime = farm.getAttendanceStartTime();
                        LocalTime endTime = farm.getAttendanceEndTime();

                        if (startTime != null && endTime != null) {
                                boolean isValidTime;
                                if (startTime.isBefore(endTime) || startTime.equals(endTime)) {
                                        isValidTime = !currentTime.isBefore(startTime) && !currentTime.isAfter(endTime);
                                } else {
                                        // Over midnight bounds (e.g., 22:00 to 06:00)
                                        isValidTime = !currentTime.isBefore(startTime) || !currentTime.isAfter(endTime);
                                }
                                if (!isValidTime) {
                                        throw new IllegalArgumentException("현재는 출근 허용 시간이 아닙니다.");
                                }
                        }
                }

                LocalDateTime timestampToRecord = now;
                if (type == AttendanceRecord.AttendanceType.CLOCK_IN
                                && status == AttendanceRecord.RecordStatus.NORMAL) {
                        try {
                                com.farm.erp.core.hr.domain.EmployeeProfile profile = employeeProfileRepository
                                                .findByUserId(userId).orElse(null);
                                if (profile != null && profile.getEmploymentType() != null) {
                                        if (profile.getEmploymentType() == com.farm.erp.core.hr.domain.EmploymentType.FULL_TIME
                                                        && farm.getRegularEmployeeStartTime() != null) {
                                                timestampToRecord = now.toLocalDate()
                                                                .atTime(farm.getRegularEmployeeStartTime());
                                        } else if (profile
                                                        .getEmploymentType() == com.farm.erp.core.hr.domain.EmploymentType.PART_TIME
                                                        && farm.getPartTimeEmployeeStartTime() != null) {
                                                timestampToRecord = now.toLocalDate()
                                                                .atTime(farm.getPartTimeEmployeeStartTime());
                                        }
                                }
                        } catch (Exception e) {
                                // Ignore and use now
                        }
                }

                List<AttendanceRecord> recentRecords = attendanceRepository
                                .findByUserIdAndTimestampBetweenOrderByTimestampDesc(
                                                userId,
                                                LocalDateTime.now().minusHours(24),
                                                LocalDateTime.now());

                if (!recentRecords.isEmpty()) {
                        AttendanceRecord lastRecord = recentRecords.get(0);
                        if (lastRecord.getType() == type) {
                                lastRecord.updateTimestamp(timestampToRecord);
                                // Update status and reason for retries
                                lastRecord.updateStatus(status);
                                if (reason != null) {
                                        lastRecord.updateReason(reason);
                                }
                                if (remarks != null) {
                                        lastRecord.updateRemarks(remarks);
                                }
                                return attendanceRepository.save(lastRecord);
                        }
                }

                LocalDateTime startOfWeek = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).withHour(0)
                                .withMinute(0).withSecond(0).withNano(0);
                LocalDateTime endOfWeek = now.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).withHour(23)
                                .withMinute(59)
                                .withSecond(59).withNano(999999999);

                List<AttendanceRecord> weekRecords = attendanceRepository
                                .findByUserIdAndTimestampBetweenOrderByTimestampDesc(userId, startOfWeek, endOfWeek);

                int weekNumber = now.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
                LocalDate today = now.toLocalDate();
                int workingDayIndex = 1;

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
                        workingDayIndex = (int) uniqueDaysThisWeek + 1;
                }

                AttendanceRecord record = AttendanceRecord.builder()
                                .user(user)
                                .type(type)
                                .timestamp(timestampToRecord)
                                .farmId(farmId)
                                .companyCode(companyCode)
                                .weekNumber(weekNumber)
                                .workingDayIndex(workingDayIndex)
                                .status(status)
                                .reason(reason)
                                .remarks(remarks)
                                .build();

                return attendanceRepository.save(record);
        }

        @Transactional
        public AttendanceRecord updateAttendanceStatus(Long id, AttendanceRecord.RecordStatus status) {
                AttendanceRecord record = attendanceRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found"));
                record.updateStatus(status);
                return attendanceRepository.save(record);
        }

        @Transactional
        public AttendanceRecord updateAttendanceRecord(Long id, LocalDateTime timestamp, String status, String reason) {
                AttendanceRecord record = attendanceRepository.findById(id)
                                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found"));

                if (timestamp != null) {
                        record.updateTimestamp(timestamp);
                }
                if (status != null && !status.trim().isEmpty()) {
                        try {
                                record.updateStatus(AttendanceRecord.RecordStatus.valueOf(status));
                        } catch (IllegalArgumentException e) {
                                // Ignore invalid status or handle appropriately
                        }
                }
                if (reason != null) {
                        record.updateReason(reason);
                }

                return attendanceRepository.save(record);
        }

        @Transactional
        public AttendanceRecord adminCreateRecord(Long userId, String typeStr, LocalDateTime timestamp,
                        String statusStr, String reason) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found"));

                String companyCode = user.getCompany() != null ? user.getCompany().getCode() : null;
                Long farmId = null;

                com.farm.erp.core.hr.domain.EmployeeProfile profile = employeeProfileRepository.findByUserId(userId)
                                .orElse(null);
                if (profile != null && profile.getFarm() != null) {
                        farmId = profile.getFarm().getId();
                } else if (companyCode != null) {
                        List<com.farm.erp.core.farm.domain.Farm> farms = farmRepository.findByCompanyCodeAndStatus(
                                        companyCode, com.farm.erp.core.farm.domain.FarmStatus.ACTIVE);
                        if (!farms.isEmpty()) {
                                farmId = farms.get(0).getId();
                        }
                }

                if (farmId == null) {
                        // 기본값 1L 등 설정 처리할 수 있으나, 일단 회사의 첫번째 활성 농장을 쓰도록 위에서 처리함. 만약 그래도 null이면 에러가 발생하게
                        // 됩니다.
                        // Throwing exception would be safer:
                        // throw new IllegalArgumentException("Cannot determine farm ID for this
                        // user.");
                        farmId = 1L; // Fallback to avoid complete breakdown if DB structure is missing farms
                                     // temporarily.
                }

                AttendanceRecord.AttendanceType type = AttendanceRecord.AttendanceType.valueOf(typeStr);
                AttendanceRecord.RecordStatus status = AttendanceRecord.RecordStatus.valueOf(statusStr);

                LocalDateTime startOfWeek = timestamp.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                                .withHour(0)
                                .withMinute(0).withSecond(0).withNano(0);
                LocalDateTime endOfWeek = timestamp.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).withHour(23)
                                .withMinute(59).withSecond(59).withNano(999999999);

                List<AttendanceRecord> weekRecords = attendanceRepository
                                .findByUserIdAndTimestampBetweenOrderByTimestampDesc(userId, startOfWeek, endOfWeek);

                int weekNumber = timestamp.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
                LocalDate today = timestamp.toLocalDate();
                int workingDayIndex = 1;

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
                        workingDayIndex = (int) uniqueDaysThisWeek + 1;
                }

                AttendanceRecord record = AttendanceRecord.builder()
                                .user(user)
                                .type(type)
                                .timestamp(timestamp)
                                .farmId(farmId)
                                .companyCode(companyCode)
                                .weekNumber(weekNumber)
                                .workingDayIndex(workingDayIndex)
                                .status(status)
                                .reason(reason)
                                .remarks("Created by Administrator")
                                .build();

                return attendanceRepository.save(record);
        }

        private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
                final int R = 6371 * 1000;
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
                return attendanceRepository.findByCompanyCodeAndTimestampBetweenOrderByTimestampDesc(companyCode, start,
                                end);
        }

        public AttendanceRecord getUserStatus(Long userId) {
                List<AttendanceRecord> recentRecords = attendanceRepository
                                .findByUserIdAndTimestampBetweenOrderByTimestampDesc(
                                                userId,
                                                LocalDateTime.now().minusHours(24),
                                                LocalDateTime.now());
                if (recentRecords.isEmpty()) {
                        return null;
                }
                return recentRecords.get(0);
        }

        /**
         * 관리자용: 특정 회사의 월별 날짜별 근무/휴무 현황 조회
         */
        public List<AttendanceSummaryResponse> getMonthlySummary(String companyCode, int year, int month) {
                LocalDate startDate = LocalDate.of(year, month, 1);
                LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

                LocalDateTime startDt = startDate.atStartOfDay();
                LocalDateTime endDt = endDate.atTime(LocalTime.MAX);

                List<AttendanceRecord> attendanceRecords = attendanceRepository
                                .findByCompanyCodeAndTimestampBetweenOrderByTimestampDesc(companyCode, startDt, endDt);

                // 날짜별 CLOCK_IN 1인 1회 집계
                Map<LocalDate, Map<Long, String>> workersByDate = new LinkedHashMap<>();
                for (AttendanceRecord record : attendanceRecords) {
                        if (record.getType() == AttendanceRecord.AttendanceType.CLOCK_IN) {
                                LocalDate date = record.getTimestamp().toLocalDate();
                                workersByDate.computeIfAbsent(date, k -> new LinkedHashMap<>())
                                                .putIfAbsent(record.getUser().getId(), record.getUser().getName());
                        }
                }

                // 해당 월 휴무 기록
                List<com.farm.erp.core.attendance.domain.LeaveRecord> leaveRecords = leaveRepository
                                .findByCompanyCodeAndDateBetween(companyCode, startDate, endDate);

                Map<LocalDate, Map<Long, String>> leavesByDate = new LinkedHashMap<>();
                Map<LocalDate, Map<Long, String>> leaveReasonsByDate = new LinkedHashMap<>();
                for (com.farm.erp.core.attendance.domain.LeaveRecord leave : leaveRecords) {
                        leavesByDate.computeIfAbsent(leave.getLeaveDate(), k -> new LinkedHashMap<>())
                                        .putIfAbsent(leave.getUser().getId(), leave.getUser().getName());
                        leaveReasonsByDate.computeIfAbsent(leave.getLeaveDate(), k -> new LinkedHashMap<>())
                                        .putIfAbsent(leave.getUser().getId(), leave.getReason());
                }

                // 해당 월 전체 날짜 순회 (근태/휴무 기록 유무에 무관하게 모든 날짜 포함)
                List<LocalDate> allDates = new ArrayList<>();
                for (LocalDate d = startDate; !d.isAfter(endDate); d = d.plusDays(1)) {
                        allDates.add(d);
                }

                List<User> allUsers = userRepository.findAllByCompany_Code(companyCode);

                // Fetch EmployeeProfiles to get employment type
                List<com.farm.erp.core.hr.domain.EmployeeProfile> profiles = employeeProfileRepository
                                .findByUserCompanyCode(companyCode);
                Map<Long, String> employmentTypeMap = profiles.stream()
                                .filter(p -> p.getEmploymentType() != null)
                                .collect(Collectors.toMap(
                                                p -> p.getUser().getId(),
                                                p -> p.getEmploymentType().name(),
                                                (v1, v2) -> v1));

                List<AttendanceSummaryResponse> result = new ArrayList<>();
                for (LocalDate date : allDates) {
                        Map<Long, String> workers = workersByDate.getOrDefault(date, new LinkedHashMap<>());
                        Map<Long, String> leaves = leavesByDate.getOrDefault(date, new LinkedHashMap<>());
                        Map<Long, String> leaveReasons = leaveReasonsByDate.getOrDefault(date, new LinkedHashMap<>());

                        List<AttendanceSummaryResponse.EmployeeSummary> workerList = workers.entrySet().stream()
                                        .map(e -> AttendanceSummaryResponse.EmployeeSummary.builder()
                                                        .userId(e.getKey())
                                                        .name(e.getValue())
                                                        .employmentType(employmentTypeMap.get(e.getKey()))
                                                        .build())
                                        .collect(Collectors.toList());

                        List<AttendanceSummaryResponse.EmployeeSummary> leaveList = leaves.entrySet().stream()
                                        .map(e -> AttendanceSummaryResponse.EmployeeSummary.builder()
                                                        .userId(e.getKey())
                                                        .name(e.getValue())
                                                        .employmentType(employmentTypeMap.get(e.getKey()))
                                                        .reason(leaveReasons.get(e.getKey()))
                                                        .build())
                                        .collect(Collectors.toList());

                        List<AttendanceSummaryResponse.EmployeeSummary> absenteeList = allUsers.stream()
                                        .filter(u -> !workers.containsKey(u.getId()) && !leaves.containsKey(u.getId()))
                                        .map(u -> AttendanceSummaryResponse.EmployeeSummary.builder()
                                                        .userId(u.getId())
                                                        .name(u.getName())
                                                        .employmentType(employmentTypeMap.get(u.getId()))
                                                        .build())
                                        .collect(Collectors.toList());

                        // 근무예정자: 전체 직원 중 해당 날짜 휴무자를 제외
                        List<AttendanceSummaryResponse.EmployeeSummary> scheduledList = allUsers.stream()
                                        .filter(u -> !leaves.containsKey(u.getId()))
                                        .map(u -> AttendanceSummaryResponse.EmployeeSummary.builder()
                                                        .userId(u.getId())
                                                        .name(u.getName())
                                                        .employmentType(employmentTypeMap.get(u.getId()))
                                                        .build())
                                        .collect(Collectors.toList());

                        // 고용형태별 근무예정자 카운트
                        int fullTimeScheduledCount = (int) scheduledList.stream()
                                        .filter(e -> "FULL_TIME".equals(e.getEmploymentType()))
                                        .count();
                        int partTimeScheduledCount = (int) scheduledList.stream()
                                        .filter(e -> "PART_TIME".equals(e.getEmploymentType()))
                                        .count();

                        result.add(AttendanceSummaryResponse.builder()
                                        .date(date)
                                        .workerCount(workers.size())
                                        .leaveCount(leaves.size())
                                        .absenteeCount(absenteeList.size())
                                        .fullTimeScheduledCount(fullTimeScheduledCount)
                                        .partTimeScheduledCount(partTimeScheduledCount)
                                        .workers(workerList)
                                        .leaves(leaveList)
                                        .absentees(absenteeList)
                                        .scheduledWorkers(scheduledList)
                                        .build());
                }

                return result;
        }
}
