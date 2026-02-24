package com.farm.erp.core.attendance.service;

import com.farm.erp.core.attendance.domain.LeaveRecord;
import com.farm.erp.core.attendance.repository.LeaveRepository;
import com.farm.erp.core.auth.domain.User;
import com.farm.erp.core.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final UserRepository userRepository;

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
}
