package com.farm.erp.api.v1;

import com.farm.erp.api.v1.dto.LeaveRequest;
import com.farm.erp.api.v1.dto.LeaveResponse;
import com.farm.erp.core.attendance.domain.LeaveRecord;
import com.farm.erp.core.attendance.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/leaves")
@RequiredArgsConstructor
public class LeaveController {

        private final LeaveService leaveService;

        @PostMapping
        public ResponseEntity<LeaveResponse> saveLeave(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @RequestBody LeaveRequest request) {

                LeaveRecord record = leaveService.saveLeave(userDetails.getUsername(), request.getLeaveDate(),
                                request.getReason());
                return ResponseEntity.ok(LeaveResponse.from(record));
        }

        @DeleteMapping("/{date}")
        public ResponseEntity<Void> deleteLeave(
                        @AuthenticationPrincipal UserDetails userDetails,
                        @PathVariable("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

                leaveService.deleteLeave(userDetails.getUsername(), date);
                return ResponseEntity.noContent().build();
        }

        @GetMapping("/me")
        public ResponseEntity<List<LeaveResponse>> getMyLeaves(
                        @AuthenticationPrincipal UserDetails userDetails) {

                List<LeaveResponse> responses = leaveService.getUserLeavesByEmail(userDetails.getUsername())
                                .stream()
                                .map(LeaveResponse::from)
                                .collect(Collectors.toList());

                return ResponseEntity.ok(responses);
        }
}
