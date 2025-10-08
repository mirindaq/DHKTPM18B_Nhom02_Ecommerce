package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.request.staff.StaffAddRequest;
import iuh.fit.ecommerce.dtos.request.staff.StaffUpdateRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.staff.StaffResponse;
import iuh.fit.ecommerce.services.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/staffs")
@RequiredArgsConstructor
public class StaffController {
    private final StaffService staffService;

    @GetMapping("")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<StaffResponse>>>> getStaffs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "7") int size,
            @RequestParam(required = false) String staffName,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) Boolean status, // true/false
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false)  LocalDate endDate
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get staff success",
                staffService.getStaffs(page, size, staffName, email, phone, status, startDate, endDate)
        ));
    }


    @GetMapping("/{id}")
    public ResponseEntity<ResponseSuccess<StaffResponse>> getStaffByID(@PathVariable Long id) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get staff detail success",
                staffService.getStaffById(id)
        ));
    }

    @PostMapping("")
    public ResponseEntity<ResponseSuccess<StaffResponse>> createStaff(
            @Valid @RequestBody StaffAddRequest staffAddRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Create staff success",
                staffService.createStaff(staffAddRequest)
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResponseSuccess<StaffResponse>> updateStaff(
            @PathVariable Long id,
            @Valid @RequestBody StaffUpdateRequest staffUpdateRequest) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Update staff success",
                staffService.updateStaff(staffUpdateRequest, id)
        ));
    }

    @PutMapping("/change-active/{id}")
    public ResponseEntity<ResponseSuccess<Void>> changeActiveStaff(@PathVariable Long id) {
        staffService.changeActive(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Change active staff success",
                null
        ));
    }
}
