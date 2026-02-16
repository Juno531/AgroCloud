package com.farm.erp.api.company;

import com.farm.erp.common.dto.ApiResponse;
import com.farm.erp.core.company.dto.RegistrationCodeDto;
import com.farm.erp.core.company.service.RegistrationCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/super-admin/registration-codes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class RegistrationCodeController {
    private final RegistrationCodeService registrationCodeService;

    @PostMapping
    public ResponseEntity<ApiResponse<RegistrationCodeDto.Response>> generateCode(@RequestBody RegistrationCodeDto.GenerateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(registrationCodeService.generateCode(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RegistrationCodeDto.Response>>> listCodes(@RequestParam(required = false) Long companyId) {
        if (companyId != null) {
            return ResponseEntity.ok(ApiResponse.success(registrationCodeService.listCodes(companyId)));
        }
        return ResponseEntity.ok(ApiResponse.success(registrationCodeService.listAllCodes()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCode(@PathVariable Long id) {
        registrationCodeService.deleteCode(id);
        return ResponseEntity.ok(ApiResponse.success());
    }
}
