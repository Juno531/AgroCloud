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

    @GetMapping
    public ResponseEntity<List<EmployeeProfileResponse>> getAllEmployees(
            @RequestParam(required = false) Long farmId) {
        if (farmId != null) {
            return ResponseEntity.ok(employeeService.getEmployeesByFarm(farmId));
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
    public ResponseEntity<EmployeeProfileResponse> createEmployee(@RequestBody EmployeeProfileRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(employeeService.createEmployee(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeProfileResponse> updateEmployee(
            @PathVariable Long id,
            @RequestBody EmployeeProfileRequest request) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }
}
