package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.excel.ImportResult;
import iuh.fit.ecommerce.dtos.request.staff.StaffAddRequest;
import iuh.fit.ecommerce.dtos.request.staff.StaffUpdateRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.staff.StaffResponse;
import iuh.fit.ecommerce.services.StaffService;
import iuh.fit.ecommerce.services.excel.StaffExcelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/staffs")
@RequiredArgsConstructor
public class StaffController {
        private final StaffService staffService;
        private final StaffExcelService staffExcelService;

        @GetMapping("")
        public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<StaffResponse>>>> getStaffs(
                @RequestParam(defaultValue = "1") int page,
                @RequestParam(defaultValue = "7") int size,
                @RequestParam(required = false) String staffName,
                @RequestParam(required = false) String email,
                @RequestParam(required = false) String phone,
                @RequestParam(required = false) Boolean status,
                @RequestParam(required = false) LocalDate joinDate,
                @RequestParam(required = false) Long roleId) {
                return ResponseEntity.ok(new ResponseSuccess<>(
                        OK,
                        "Get staff success",
                        staffService.getStaffs(page, size, staffName, email, phone, status, joinDate, roleId)));
        }

        @GetMapping("/{id}")
        public ResponseEntity<ResponseSuccess<StaffResponse>> getStaffByID(@PathVariable Long id) {
                return ResponseEntity.ok(new ResponseSuccess<>(
                        OK,
                        "Get staff detail success",
                        staffService.getStaffById(id)));
        }

        @PostMapping("")
        public ResponseEntity<ResponseSuccess<StaffResponse>> createStaff(
                @Valid @RequestBody StaffAddRequest staffAddRequest) {
                return ResponseEntity.ok(new ResponseSuccess<>(
                        CREATED,
                        "Create staff success",
                        staffService.createStaff(staffAddRequest)));
        }

        @PutMapping("/{id}")
        public ResponseEntity<ResponseSuccess<StaffResponse>> updateStaff(
                @PathVariable Long id,
                @Valid @RequestBody StaffUpdateRequest staffUpdateRequest) {
                return ResponseEntity.ok(new ResponseSuccess<>(
                        OK,
                        "Update staff success",
                        staffService.updateStaff(staffUpdateRequest, id)));
        }

        @PutMapping("/change-active/{id}")
        public ResponseEntity<ResponseSuccess<Void>> changeActiveStaff(@PathVariable Long id) {
                staffService.changeActive(id);
                return ResponseEntity.ok(new ResponseSuccess<>(
                        OK,
                        "Change active staff success",
                        null));
        }

        @GetMapping("/active")
        public ResponseEntity<ResponseSuccess<List<StaffResponse>>> getAllActiveStaffs() {
                return ResponseEntity.ok(new ResponseSuccess<>(
                        OK,
                        "Get active staffs success",
                        staffService.getAllActiveStaffs()));
        }

        // Download Excel template
        @GetMapping("/template")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<Resource> downloadTemplate() {
                try {
                        Workbook workbook = staffExcelService.generateTemplate();
                        byte[] bytes = staffExcelService.workbookToBytes(workbook);

                        ByteArrayResource resource = new ByteArrayResource(bytes);

                        return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION,
                                        "attachment; filename=staff_template.xlsx")
                                .contentType(MediaType.parseMediaType(
                                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                                .contentLength(bytes.length)
                                .body(resource);
                } catch (Exception e) {
                        throw new RuntimeException("Failed to generate template: " + e.getMessage());
                }
        }

        @PostMapping("/import")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ResponseSuccess<ImportResult>> importStaffs(
                @RequestParam(value = "file", required = false) MultipartFile file) {

                try {
                        if (file == null || file.isEmpty()) {
                                throw new RuntimeException("File is null or empty! Please select a valid Excel file.");
                        }

                        System.out.println("Received file: " + file.getOriginalFilename() + ", Size: " + file.getSize());

                        ImportResult result = staffExcelService.importExcel(file);

                        return ResponseEntity.ok(new ResponseSuccess<>(
                                result.hasErrors() ? OK : CREATED,
                                result.getMessage(),
                                result));
                } catch (Exception e) {
                        e.printStackTrace();
                        throw new RuntimeException("Import failed: " + e.getMessage(), e);
                }
        }

        @GetMapping("/export")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<Resource> exportStaffs() {
                try {
                        Workbook workbook = staffExcelService.exportAllStaff();
                        byte[] bytes = staffExcelService.workbookToBytes(workbook);

                        ByteArrayResource resource = new ByteArrayResource(bytes);

                        String filename = "staffs_" + LocalDate.now() + ".xlsx";

                        return ResponseEntity.ok()
                                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                                .contentType(MediaType.parseMediaType(
                                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                                .contentLength(bytes.length)
                                .body(resource);
                } catch (Exception e) {
                        throw new RuntimeException("Failed to export staffs: " + e.getMessage());
                }
        }
}