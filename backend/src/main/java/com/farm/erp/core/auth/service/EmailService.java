package com.farm.erp.core.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendVerificationCode(String to, String code) {
        log.info("Sending verification code {} to {}", code, to);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("[안티그래비티 팜] 이메일 인증 번호");
            message.setText("인증 번호: " + code + "\n3분 이내에 입력해주세요.");
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
            // 실제 운영 환경이 아니거나 SMTP 설정이 없는 경우를 대비해 로그로만 남기고 예외를 던지지 않을 수도 있습니다.
            // 하지만 여기서는 예외를 던져 상위 계층에서 처리하게 합니다.
            throw new RuntimeException("이메일 발송에 실패했습니다. 관리자에게 문의하세요.");
        }
    }
}
