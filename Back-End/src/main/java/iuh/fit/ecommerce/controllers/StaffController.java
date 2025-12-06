package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.excel.ImportResult;
import iuh.fit.ecommerce.services.ImportProgressService;
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
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/staffs")
@RequiredArgsConstructor
public class StaffController {
        private final StaffService staffService;
        private final StaffExcelService staffExcelService;
        private final ImportProgressService importProgressService;

        @GetMapping("")
        public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<StaffResponse>>>> getStaffs(
                        @RequestParam(defaultValue = "1") int page,
                        @RequestParam(defaultValue = "7") int size,
                        @RequestParam(required = false) String staffName,
                        @RequestParam(required = false) String email,
                        @RequestParam(required = false) String phone,
                        @RequestParam(required = false) Boolean status, // true/false
                        @RequestParam(required = false) LocalDate startDate,
                        @RequestParam(required = false) LocalDate endDate) {
                return ResponseEntity.ok(new ResponseSuccess<>(
                                OK,
                                "Get staff success",
                                staffService.getStaffs(page, size, staffName, email, phone, status, startDate,
                                                endDate)));
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
        
        // SSE endpoint for progress tracking
        @GetMapping("/import-progress/{jobId}")
        public SseEmitter getImportProgress(@PathVariable String jobId) {
                return importProgressService.createEmitter(jobId);
        }
        
        // Async import endpoint
        @PostMapping("/import-async")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ResponseSuccess<Map<String, String>>> importStaffsAsync(
                        @RequestParam(value = "file", required = false) MultipartFile file) {
                
                try {
                        if (file == null || file.isEmpty()) {
                                throw new RuntimeException("File is null or empty! Please select a valid Excel file.");
                        }
                        
                        String jobId = UUID.randomUUID().toString();
                        
                        // Start async import with progress tracking
                        CompletableFuture.runAsync(() -> {
                                try {
                                        // Parse Excel
                                        var dataList = staffExcelService.parseExcel(file);
                                        ImportResult result = ImportResult.builder()
                                                .totalRows(dataList.size())
                                                .successCount(0)
                                                .errorCount(0)
                                                .errors(new java.util.ArrayList<>())
                                                .build();
                                        
                                        // Validate all rows
                                        var validData = new java.util.ArrayList<iuh.fit.ecommerce.dtos.excel.StaffExcelDTO>();
                                        for (int i = 0; i < dataList.size(); i++) {
                                                final int rowIndex = i + 4;
                                                staffExcelService.validateRow(dataList.get(i), rowIndex, result);
                                                if (!result.getErrors().stream().anyMatch(e -> e.getRowIndex() == rowIndex)) {
                                                        validData.add(dataList.get(i));
                                                }
                                        }
                                        
                                        if (validData.isEmpty()) {
                                                importProgressService.sendError(jobId, "No valid data to import");
                                                return;
                                        }
                                        
                                        // Save with progress tracking
                                        staffExcelService.saveDataWithProgress(validData, jobId);
                                        
                                } catch (Exception e) {
                                        importProgressService.sendError(jobId, "Import failed: " + e.getMessage());
                                }
                        });
                        
                        return ResponseEntity.ok(new ResponseSuccess<>(
                                        OK,
                                        "Import started",
                                        Map.of("jobId", jobId)));
                } catch (Exception e) {
                        throw new RuntimeException("Failed to start import: " + e.getMessage(), e);
                }
        }
}
