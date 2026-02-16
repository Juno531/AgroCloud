package com.farm.erp.core.company.service;

import com.farm.erp.core.company.domain.Company;
import com.farm.erp.core.company.domain.RegistrationCode;
import com.farm.erp.core.company.dto.RegistrationCodeDto;
import com.farm.erp.core.company.repository.CompanyRepository;
import com.farm.erp.core.company.repository.RegistrationCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RegistrationCodeService {
    private final RegistrationCodeRepository registrationCodeRepository;
    private final CompanyRepository companyRepository;

    @Transactional
    public RegistrationCodeDto.Response generateCode(RegistrationCodeDto.GenerateRequest request) {
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new IllegalArgumentException("Company not found"));

        String uniqueCode;
        do {
            // CODE-TYPE-RANDOM 형식 (예: FARM001-ADMIN-A1B2C3)
            String randomPart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            uniqueCode = String.format("%s-%s-%s", 
                company.getCode(), 
                request.getType(), 
                randomPart);
        } while (registrationCodeRepository.existsByCode(uniqueCode));

        RegistrationCode code = RegistrationCode.builder()
                .company(company)
                .code(uniqueCode)
                .type(request.getType())
                .expiresAt(request.getExpiresAt())
                .build();

        return RegistrationCodeDto.Response.from(registrationCodeRepository.save(code));
    }

    public List<RegistrationCodeDto.Response> listCodes(Long companyId) {
        return registrationCodeRepository.findByCompanyId(companyId).stream()
                .map(RegistrationCodeDto.Response::from)
                .collect(Collectors.toList());
    }
    
    public List<RegistrationCodeDto.Response> listAllCodes() {
        return registrationCodeRepository.findAll().stream()
                .map(RegistrationCodeDto.Response::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public RegistrationCode validateCode(String codeStr) {
        RegistrationCode code = registrationCodeRepository.findByCodeAndStatus(codeStr, RegistrationCode.CodeStatus.ACTIVE)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or inactive registration code"));

        if (!code.isValid()) {
            throw new IllegalArgumentException("Code expired");
        }
        return code;
    }

    @Transactional
    public void markCodeAsUsed(String codeStr) {
        RegistrationCode code = registrationCodeRepository.findByCodeAndStatus(codeStr, RegistrationCode.CodeStatus.ACTIVE)
                .orElseThrow(() -> new IllegalArgumentException("Invalid code"));
        code.use();
    }
    
    @Transactional
    public void deleteCode(Long id) {
        registrationCodeRepository.deleteById(id);
    }
}
