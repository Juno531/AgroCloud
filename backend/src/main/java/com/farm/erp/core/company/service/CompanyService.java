package com.farm.erp.core.company.service;

import com.farm.erp.core.company.domain.Company;
import com.farm.erp.core.company.dto.CompanyDto;
import com.farm.erp.core.company.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyService {
    private final CompanyRepository companyRepository;

    @Transactional
    public CompanyDto.Response createCompany(CompanyDto.Request request) {
        if (companyRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Company name already exists");
        }
        if (companyRepository.findByCode(request.getCode()).isPresent()) {
            throw new IllegalArgumentException("Company code already exists");
        }

        Company company = Company.builder()
                .name(request.getName())
                .code(request.getCode())
                .businessNumber(request.getBusinessNumber())
                .address(request.getAddress())
                .phoneNumber(request.getPhoneNumber())
                .status(Company.CompanyStatus.ACTIVE)
                .build();

        return CompanyDto.Response.from(companyRepository.save(company));
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

        company.update(request.getName(), request.getAddress(), request.getPhoneNumber(), request.getStatus());
        return CompanyDto.Response.from(company);
    }

    @Transactional
    public void deleteCompany(Long id) {
        companyRepository.deleteById(id);
    }
}
