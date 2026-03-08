package com.farm.erp.core.attendance.service;

import com.farm.erp.api.v1.dto.DashboardAttendanceResponse;
import com.farm.erp.api.v1.dto.DashboardPendingApprovalResponse;
import com.farm.erp.core.attendance.domain.AttendanceRecord;
import com.farm.erp.core.attendance.repository.AttendanceRepository;
import com.farm.erp.core.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

        private final AttendanceRepository attendanceRepository;
        private final UserRepository userRepository;

        /**
         * 오늘 출근 현황 — 총원 vs 출근자 수
         */
        public DashboardAttendanceResponse getTodayAttendanceSummary(String companyCode) {
                LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
                LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

                // 오늘 CLOCK_IN 레코드 조회 (중복 user 제거)
                List<AttendanceRecord> todayRecords = attendanceRepository
                                .findByCompanyCodeAndTypeAndTimestampBetweenOrderByTimestampDesc(
                                                companyCode, AttendanceRecord.AttendanceType.CLOCK_IN, startOfDay,
                                                endOfDay);

                // 필터링: MASTER_ADMIN 권한을 가진 사용자의 기록은 제외
                Set<Long> presentUserIds = todayRecords.stream()
                                .filter(r -> r.getUser()
                                                .getRole() != com.farm.erp.core.auth.domain.User.Role.MASTER_ADMIN)
                                .map(r -> r.getUser().getId())
                                .collect(Collectors.toSet());

                // 전체 인원수 조회 시 MASTER_ADMIN은 제외
                int total = (int) userRepository.countByCompany_CodeAndRoleNot(companyCode,
                                com.farm.erp.core.auth.domain.User.Role.MASTER_ADMIN);
                int present = presentUserIds.size();

                return DashboardAttendanceResponse.builder()
                                .total(total)
                                .present(present)
                                .absent(total - present)
                                .build();
        }

        /**
         * 승인 대기 중인 출근 목록 (PENDING 상태)
         */
        public List<DashboardPendingApprovalResponse> getPendingApprovals(String companyCode) {
                return attendanceRepository
                                .findByCompanyCodeAndStatusOrderByTimestampDesc(
                                                companyCode, AttendanceRecord.RecordStatus.PENDING)
                                .stream()
                                .map(r -> DashboardPendingApprovalResponse.builder()
                                                .id(r.getId())
                                                .userId(r.getUser().getId())
                                                .userName(r.getUser().getName())
                                                .type(r.getType().name())
                                                .timestamp(r.getTimestamp())
                                                .reason(r.getReason())
                                                .build())
                                .collect(Collectors.toList());
        }
}
