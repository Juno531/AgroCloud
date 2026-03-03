package com.farm.erp.api.v1;

import com.farm.erp.api.v1.dto.DashboardAttendanceResponse;
import com.farm.erp.api.v1.dto.DashboardPendingApprovalResponse;
import com.farm.erp.api.v1.dto.AttendanceStatusUpdateRequest;
import com.farm.erp.core.attendance.domain.AttendanceRecord;
import com.farm.erp.core.attendance.service.AttendanceService;
import com.farm.erp.core.attendance.service.DashboardService;
import com.farm.erp.core.auth.domain.User;
import com.farm.erp.core.auth.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final AttendanceService attendanceService;
    private final UserRepository userRepository;

    /** 오늘 출근 현황 (총원 vs 출근자) */
    @GetMapping("/attendance-today")
    public ResponseEntity<DashboardAttendanceResponse> getTodayAttendance(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String companyCode = user.getCompany() != null ? user.getCompany().getCode() : null;
        if (companyCode == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(dashboardService.getTodayAttendanceSummary(companyCode));
    }

    /** 승인 대기 중인 출근 목록 */
    @GetMapping("/pending-approvals")
    public ResponseEntity<List<DashboardPendingApprovalResponse>> getPendingApprovals(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String companyCode = user.getCompany() != null ? user.getCompany().getCode() : null;
        if (companyCode == null) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(dashboardService.getPendingApprovals(companyCode));
    }

    /** 승인 대기 건 처리 (PATCH) — 기존 AttendanceService 재사용 */
    @PatchMapping("/pending-approvals/{id}/status")
    public ResponseEntity<Void> updateApprovalStatus(
            @PathVariable Long id,
            @Valid @RequestBody AttendanceStatusUpdateRequest request) {

        AttendanceRecord.RecordStatus status = AttendanceRecord.RecordStatus.valueOf(request.getStatus());
        attendanceService.updateAttendanceStatus(id, status);
        return ResponseEntity.ok().build();
    }
}
