package com.farm.erp.api.v1;

import com.farm.erp.api.v1.dto.EmployeeProfileRequest;
import com.farm.erp.api.v1.dto.EmployeeProfileResponse;
import com.farm.erp.core.hr.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    private final com.farm.erp.core.auth.repository.UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<EmployeeProfileResponse>> getAllEmployees(
            @RequestParam(required = false) Long farmId,
            @RequestParam(required = false) String companyCode) {
        if (farmId != null) {
            return ResponseEntity.ok(employeeService.getEmployeesByFarm(farmId));
        }
        if (companyCode != null) {
            return ResponseEntity.ok(employeeService.getEmployeesByCompanyCode(companyCode));
        }
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeProfileResponse> getEmployee(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployee(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<EmployeeProfileResponse> getEmployeeByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(employeeService.getEmployeeByUserId(userId));
    }

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<EmployeeProfileResponse> registerEmployee(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @jakarta.validation.Valid @RequestBody com.farm.erp.core.hr.dto.EmployeeRegistrationRequest request) {

        com.farm.erp.core.auth.domain.User adminUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(employeeService.registerEmployee(request, adminUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeProfileResponse> updateEmployee(
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody EmployeeProfileRequest request) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }
}
