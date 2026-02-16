package com.farm.erp.core.audit.service;

import com.farm.erp.core.audit.domain.AuditLog;
import com.farm.erp.core.audit.repository.AuditLogRepository;
import com.farm.erp.core.auth.domain.User;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @Async
    @Transactional
    public void logAction(User user, String action, String entityType, Long entityId,
                         Object oldValue, Object newValue, String ipAddress, String userAgent) {
        try {
            String oldValueJson = oldValue != null ? objectMapper.writeValueAsString(oldValue) : null;
            String newValueJson = newValue != null ? objectMapper.writeValueAsString(newValue) : null;

            AuditLog auditLog = AuditLog.builder()
                    .userId(user.getId())
                    .userEmail(user.getEmail())
                    .userName(user.getName())
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .oldValue(oldValueJson)
                    .newValue(newValueJson)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit log created: {} {} {} by {}", action, entityType, entityId, user.getEmail());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize audit log values", e);
        }
    }

    @Async
    @Transactional
    public void logLogin(User user, String ipAddress, String userAgent) {
        AuditLog auditLog = AuditLog.builder()
                .userId(user.getId())
                .userEmail(user.getEmail())
                .userName(user.getName())
                .action("LOGIN")
                .entityType("User")
                .entityId(user.getId())
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build();

        auditLogRepository.save(auditLog);
        log.info("Login logged for user: {}", user.getEmail());
    }

    @Async
    @Transactional
    public void logLogout(User user, String ipAddress) {
        AuditLog auditLog = AuditLog.builder()
                .userId(user.getId())
                .userEmail(user.getEmail())
                .userName(user.getName())
                .action("LOGOUT")
                .entityType("User")
                .entityId(user.getId())
                .ipAddress(ipAddress)
                .build();

        auditLogRepository.save(auditLog);
        log.info("Logout logged for user: {}", user.getEmail());
    }
}
