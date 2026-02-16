package com.farm.erp.api.v1;

import com.farm.erp.api.v1.dto.AttendanceRequest;
import com.farm.erp.api.v1.dto.AttendanceResponse;
import com.farm.erp.core.attendance.domain.AttendanceRecord;
import com.farm.erp.core.attendance.service.AttendanceService;
import com.farm.erp.core.auth.domain.User;
import com.farm.erp.core.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<AttendanceResponse> recordAttendance(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody AttendanceRequest request) {

        // Get user by email (username in Spring Security)
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Parse attendance type
        AttendanceRecord.AttendanceType type = AttendanceRecord.AttendanceType.valueOf(request.getType());

        AttendanceRecord record = attendanceService.recordAttendance(user.getId(), type, request.getFarmId());

        return ResponseEntity.ok(AttendanceResponse.from(record));
    }

    @GetMapping("/me")
    public ResponseEntity<List<AttendanceResponse>> getMyAttendance(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = Long.parseLong(userDetails.getUsername().split("@")[0].replaceAll("[^0-9]", ""));

        List<AttendanceResponse> records = attendanceService.getUserAttendance(userId)
                .stream()
                .map(AttendanceResponse::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(records);
    }

    @GetMapping("/farm/{farmId}")
    public ResponseEntity<List<AttendanceResponse>> getFarmAttendance(
            @PathVariable Long farmId,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime startDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime endDate) {

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

    @GetMapping("/status")
    public ResponseEntity<String> getUserStatus(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        AttendanceRecord.AttendanceType status = attendanceService.getUserStatus(user.getId());

        if (status == null) {
            return ResponseEntity.ok("NONE"); // No recent records
        }

        return ResponseEntity.ok(status.toString());
    }
}
