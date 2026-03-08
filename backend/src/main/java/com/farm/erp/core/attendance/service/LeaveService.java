package com.farm.erp.core.attendance.service;

import com.farm.erp.core.attendance.domain.LeaveRecord;
import com.farm.erp.core.attendance.repository.LeaveRepository;
import com.farm.erp.core.auth.domain.User;
import com.farm.erp.core.auth.repository.UserRepository;
import com.farm.erp.core.hr.repository.EmployeeProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final UserRepository userRepository;
    private final EmployeeProfileRepository employeeProfileRepository;

    @Transactional
    public LeaveRecord saveLeave(String email, LocalDate leaveDate, String reason) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return leaveRepository.findByUserIdAndLeaveDate(user.getId(), leaveDate)
                .orElseGet(() -> leaveRepository.save(LeaveRecord.builder()
                        .user(user)
                        .leaveDate(leaveDate)
                        .reason(reason)
                        .build()));
    }

    @Transactional
    public void deleteLeave(String email, LocalDate leaveDate) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        leaveRepository.deleteByUserIdAndLeaveDate(user.getId(), leaveDate);
    }

    public List<LeaveRecord> getUserLeaves(Long userId) {
        return leaveRepository.findByUserId(userId);
    }

    public List<LeaveRecord> getUserLeavesByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return leaveRepository.findByUserId(user.getId());
    }

    public List<LeaveRecord> getUserLeavesInRange(Long userId, LocalDate start, LocalDate end) {
        return leaveRepository.findByUserIdAndLeaveDateBetween(userId, start, end);
    }

    public List<LeaveRecord> getUserLeavesByFarmInRange(Long farmId, LocalDate start, LocalDate end) {
        return leaveRepository.findByLeaveDateBetween(start, end).stream()
                .filter(l -> {
                    com.farm.erp.core.hr.domain.EmployeeProfile profile = employeeProfileRepository
                            .findByUserId(l.getUser().getId()).orElse(null);
                    return profile != null && profile.getFarm() != null && profile.getFarm().getId().equals(farmId);
                })
                .collect(Collectors.toList());
    }

    public List<LeaveRecord> getUserLeavesByCompanyInRange(String companyCode, LocalDate start, LocalDate end) {
        return leaveRepository.findByLeaveDateBetween(start, end).stream()
                .filter(l -> l.getUser().getCompany() != null && l.getUser().getCompany().getCode().equals(companyCode))
                .collect(Collectors.toList());
    }
}
