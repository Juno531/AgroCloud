package com.farm.erp.core.company.service;

import com.farm.erp.core.auth.domain.User;
import com.farm.erp.core.auth.repository.UserRepository;
import com.farm.erp.core.company.domain.Company;
import com.farm.erp.core.company.dto.CompanyCreationRequest;
import com.farm.erp.core.company.dto.CompanyDto;
import com.farm.erp.core.company.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final com.farm.erp.core.hr.repository.EmployeeProfileRepository employeeProfileRepository;
    private final com.farm.erp.core.company.repository.RegistrationCodeRepository registrationCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.farm.erp.core.auth.repository.RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public CompanyDto.Response createCompany(CompanyCreationRequest request) {
        if (companyRepository.existsByName(request.getCompanyName())) {
            throw new IllegalArgumentException("Company name already exists");
        }
        if (companyRepository.findByCode(request.getCompanyCode()).isPresent()) {
            throw new IllegalArgumentException("Company code already exists");
        }
        if (userRepository.existsByEmail(request.getAdminEmail())) {
            throw new IllegalArgumentException("Admin email already exists");
        }

        Company company = Company.builder()
                .name(request.getCompanyName())
                .code(request.getCompanyCode())
                .businessNumber(request.getBusinessNumber())
                .address(request.getAddress())
                .phoneNumber(request.getPhoneNumber())
                .status(Company.CompanyStatus.ACTIVE)
                .build();

        Company savedCompany = companyRepository.save(company);

        // Create Master Admin User
        User adminUser = User.builder()
                .email(request.getAdminEmail())
                .password(passwordEncoder.encode(request.getAdminPassword()))
                .name(request.getAdminName())
                .role(User.Role.MASTER_ADMIN)
                .company(savedCompany)
                .build();

        userRepository.save(adminUser);

        return CompanyDto.Response.from(savedCompany);
    }

    public List<CompanyDto.Response> listCompanies() {
        return companyRepository.findAll().stream()
                .map(CompanyDto.Response::from)
                .collect(Collectors.toList());
    }

    public CompanyDto.Response getCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Company not found"));
        return CompanyDto.Response.from(company);
    }

    @Transactional
    public CompanyDto.Response updateCompany(Long id, CompanyDto.UpdateRequest request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Company not found"));

        company.update(request.getName(), request.getAddress(), request.getPhoneNumber(), request.getBusinessNumber(),
                request.getStatus());
        return CompanyDto.Response.from(company);
    }

    @Transactional
    public void deleteCompany(Long id) {
        // 1. Delete all registration codes for this company
        registrationCodeRepository.deleteAll(registrationCodeRepository.findByCompanyId(id));

        // 2. Find all users belonging to this company (filtered by company id via
        // relationship)
        List<User> users = userRepository.findAllByCompanyId(id);

        // 3. For each user, find and delete their EmployeeProfile if it exists
        for (User user : users) {
            employeeProfileRepository.findByUserId(user.getId())
                    .ifPresent(employeeProfileRepository::delete);

            refreshTokenRepository.findByUser(user)
                    .ifPresent(refreshTokenRepository::delete);

            userRepository.delete(user);
        }

        // 4. Finally delete the company
        companyRepository.deleteById(id);
    }
}
