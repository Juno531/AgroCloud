package com.farm.erp.core.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoginAttemptService {

    private final RedisTemplate<String, String> redisTemplate;

    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCK_TIME_MINUTES = 15;
    private static final String ATTEMPT_PREFIX = "login:attempt:";
    private static final String LOCK_PREFIX = "login:lock:";

    public void loginSucceeded(String email) {
        String attemptKey = ATTEMPT_PREFIX + email;
        String lockKey = LOCK_PREFIX + email;
        
        redisTemplate.delete(attemptKey);
        redisTemplate.delete(lockKey);
        log.info("Login succeeded for: {}", email);
    }

    public void loginFailed(String email) {
        String attemptKey = ATTEMPT_PREFIX + email;
        String currentAttempts = redisTemplate.opsForValue().get(attemptKey);
        
        int attempts = currentAttempts == null ? 0 : Integer.parseInt(currentAttempts);
        attempts++;
        
        redisTemplate.opsForValue().set(attemptKey, String.valueOf(attempts), 1, TimeUnit.HOURS);
        log.warn("Login failed for: {} (Attempt {}/{})", email, attempts, MAX_ATTEMPTS);
        
        if (attempts >= MAX_ATTEMPTS) {
            lockAccount(email);
        }
    }

    private void lockAccount(String email) {
        String lockKey = LOCK_PREFIX + email;
        redisTemplate.opsForValue().set(lockKey, "locked", LOCK_TIME_MINUTES, TimeUnit.MINUTES);
        log.error("Account locked due to too many login attempts: {}", email);
    }

    public boolean isBlocked(String email) {
        String lockKey = LOCK_PREFIX + email;
        Boolean isLocked = redisTemplate.hasKey(lockKey);
        return Boolean.TRUE.equals(isLocked);
    }

    public int getAttemptsRemaining(String email) {
        String attemptKey = ATTEMPT_PREFIX + email;
        String currentAttempts = redisTemplate.opsForValue().get(attemptKey);
        
        int attempts = currentAttempts == null ? 0 : Integer.parseInt(currentAttempts);
        return Math.max(0, MAX_ATTEMPTS - attempts);
    }
}
