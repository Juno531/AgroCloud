package com.farm.erp.api.company;

import com.farm.erp.common.dto.ApiResponse;
import com.farm.erp.core.company.dto.CompanyDto;
import com.farm.erp.core.company.service.CompanyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/super-admin/companies")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
@Slf4j
public class CompanyController {
    private final CompanyService companyService;

    @PostMapping
    public ResponseEntity<ApiResponse<CompanyDto.Response>> createCompany(@RequestBody CompanyDto.Request request) {
        return ResponseEntity.ok(ApiResponse.success(companyService.createCompany(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> listCompanies() {
        try {
            log.debug("Fetching all companies for super-admin");
            return ResponseEntity.ok(ApiResponse.success(companyService.listCompanies()));
        } catch (Exception e) {
            log.error("Error fetching companies: ", e);
            // 에러 메시지를 프론트엔드에 노출하여 원인 파악 (디버깅용)
            return ResponseEntity.status(500).body(ApiResponse.error("500", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyDto.Response>> getCompany(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(companyService.getCompany(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyDto.Response>> updateCompany(@PathVariable Long id, @RequestBody CompanyDto.UpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(companyService.updateCompany(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Connection Successful");
    }
}
