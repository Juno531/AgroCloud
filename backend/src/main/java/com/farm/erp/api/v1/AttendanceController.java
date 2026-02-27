package com.farm.erp.api.v1;

import com.farm.erp.api.v1.dto.AttendanceFilterRequest;
import com.farm.erp.api.v1.dto.AttendanceRequest;
import com.farm.erp.api.v1.dto.AttendanceResponse;
import com.farm.erp.api.v1.dto.AttendanceSummaryResponse;
import com.farm.erp.core.attendance.domain.AttendanceRecord;
import com.farm.erp.core.attendance.service.AttendanceExcelService;
import com.farm.erp.core.attendance.service.AttendanceService;
import com.farm.erp.core.auth.domain.User;
import com.farm.erp.core.auth.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final AttendanceExcelService attendanceExcelService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<AttendanceResponse> recordAttendance(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AttendanceRequest request,
            HttpServletRequest httpServletRequest) {

        // Get user by email (username in Spring Security)
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Parse attendance type
        AttendanceRecord.AttendanceType type = AttendanceRecord.AttendanceType.valueOf(request.getType());

        // Use company from user profile if available, otherwise from request
        String companyCode = user.getCompany() != null ? user.getCompany().getCode() : request.getCompanyCode();

        AttendanceRecord record = attendanceService.recordAttendance(user.getId(), type, request.getFarmId(),
                companyCode, request.getLatitude(), request.getLongitude());

        return ResponseEntity.ok(AttendanceResponse.from(record));
    }

    @GetMapping("/me")
    public ResponseEntity<List<AttendanceResponse>> getMyAttendance(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<AttendanceResponse> records = attendanceService.getUserAttendance(user.getId())
                .stream()
                .map(AttendanceResponse::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(records);
    }

    @GetMapping("/farm/{farmId}")
    public ResponseEntity<List<AttendanceResponse>> getFarmAttendance(
            @PathVariable("farmId") Long farmId,
            @RequestParam(value = "startDate", required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime startDate,
            @RequestParam(value = "endDate", required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime endDate) {

        List<AttendanceRecord> records;

        if (startDate != null && endDate != null) {
            records = attendanceService.getFarmAttendanceInRange(farmId, startDate, endDate);
        } else {
            records = attendanceService.getFarmAttendance(farmId);
        }

        List<AttendanceResponse> responses = records.stream()
                .map(AttendanceResponse::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/company/{companyCode}")
    public ResponseEntity<List<AttendanceResponse>> getCompanyAttendance(
            @PathVariable("companyCode") String companyCode,
            @RequestParam(value = "startDate", required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime startDate,
            @RequestParam(value = "endDate", required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime endDate) {

        List<AttendanceRecord> records;

        if (startDate != null && endDate != null) {
            records = attendanceService.getCompanyAttendanceInRange(companyCode, startDate, endDate);
        } else {
            records = attendanceService.getCompanyAttendance(companyCode);
        }

        List<AttendanceResponse> responses = records.stream()
                .map(AttendanceResponse::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/status")
    public ResponseEntity<String> getUserStatus(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        AttendanceRecord.AttendanceType status = attendanceService.getUserStatus(user.getId());

        if (status == null) {
            return ResponseEntity.ok("NONE");
        }

        return ResponseEntity.ok(status.toString());
    }

    @GetMapping("/summary")
    public ResponseEntity<List<AttendanceSummaryResponse>> getMonthlySummary(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("year") int year,
            @RequestParam("month") int month) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String companyCode = user.getCompany() != null ? user.getCompany().getCode() : null;
        if (companyCode == null) {
            return ResponseEntity.badRequest().build();
        }

        List<AttendanceSummaryResponse> summary = attendanceService.getMonthlySummary(companyCode, year, month);
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/filter")
    public List<AttendanceResponse> filterAttendance(@RequestBody AttendanceFilterRequest request) {
        return attendanceExcelService.filterAttendance(request).stream()
                .map(AttendanceResponse::from)
                .collect(Collectors.toList());
    }

    @PostMapping("/export")
    public ResponseEntity<byte[]> exportAttendance(@RequestBody AttendanceFilterRequest request) throws IOException {
        List<AttendanceRecord> records = attendanceExcelService.filterAttendance(request);
        byte[] excelContent = attendanceExcelService.generateAttendanceExcel(records);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attendance_export.xlsx")
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(excelContent.length)
                .body(excelContent);
    }
}
