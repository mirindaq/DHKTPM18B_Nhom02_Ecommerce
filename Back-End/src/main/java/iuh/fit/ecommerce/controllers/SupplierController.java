package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.excel.ImportResult;
import iuh.fit.ecommerce.dtos.request.supplier.SupplierRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.supplier.SupplierResponse;
import iuh.fit.ecommerce.services.SupplierService;
import iuh.fit.ecommerce.services.excel.SupplierExcelService;
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
@RequestMapping("${api.prefix}/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;
    private final SupplierExcelService supplierExcelService; // Inject Service Excel

    /**
     * API Lấy danh sách nhà cung cấp (có phân trang và tìm kiếm)
     */
    @GetMapping("")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<SupplierResponse>>>> getSuppliers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) Boolean status,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Lấy danh sách nhà cung cấp thành công",
                supplierService.getSuppliers(page, size, name, phone, address, status, startDate, endDate)
        ));
    }

    /**
     * API Lấy chi tiết nhà cung cấp
     */
    @GetMapping("/{id}")
    public ResponseEntity<ResponseSuccess<SupplierResponse>> getSupplierById(@PathVariable Long id) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Lấy chi tiết nhà cung cấp thành công",
                supplierService.getSupplierById(id)
        ));
    }

    /**
     * API Tạo mới nhà cung cấp
     */
    @PostMapping("")
    public ResponseEntity<ResponseSuccess<SupplierResponse>> createSupplier(
            @Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Tạo nhà cung cấp thành công",
                supplierService.createSupplier(request)
        ));
    }

    /**
     * API Cập nhật nhà cung cấp
     */
    @PutMapping("/{id}")
    public ResponseEntity<ResponseSuccess<SupplierResponse>> updateSupplier(
            @PathVariable Long id,
            @Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Cập nhật nhà cung cấp thành công",
                supplierService.updateSupplier(id, request)
        ));
    }

    /**
     * API Thay đổi trạng thái (Active/Inactive)
     */
    @PutMapping("/change-status/{id}")
    public ResponseEntity<ResponseSuccess<Void>> changeStatusSupplier(@PathVariable Long id) {
        supplierService.changeStatusSupplier(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Thay đổi trạng thái nhà cung cấp thành công",
                null
        ));
    }

    // ========================================================================
    //                          EXCEL FUNCTIONALITY
    // ========================================================================

    /**
     * API Download Excel Template cho Supplier
     */
    @GetMapping("/template")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> downloadTemplate() {
        try {
            Workbook workbook = supplierExcelService.generateTemplate();
            byte[] bytes = supplierExcelService.workbookToBytes(workbook);

            ByteArrayResource resource = new ByteArrayResource(bytes);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=supplier_template.xlsx")
                    .contentType(MediaType.parseMediaType(
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .contentLength(bytes.length)
                    .body(resource);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate template: " + e.getMessage());
        }
    }

    /**
     * API Import Supplier từ file Excel
     */
    @PostMapping("/import")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseSuccess<ImportResult>> importSuppliers(
            @RequestParam("file") MultipartFile file) {

        try {
            if (file == null || file.isEmpty()) {
                throw new RuntimeException("File is null or empty! Please select a valid Excel file.");
            }

            // Có thể log ra console để debug như mẫu cũ nếu muốn
            // System.out.println("Received file: " + file.getOriginalFilename());

            ImportResult result = supplierExcelService.importExcel(file);

            return ResponseEntity.ok(new ResponseSuccess<>(
                    result.hasErrors() ? OK : CREATED,
                    result.getMessage(),
                    result));
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Import failed: " + e.getMessage(), e);
        }
    }

    /**
     * API Export danh sách Supplier ra Excel
     */
    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> exportSuppliers() {
        try {
            Workbook workbook = supplierExcelService.exportAllSuppliers();
            byte[] bytes = supplierExcelService.workbookToBytes(workbook);

            ByteArrayResource resource = new ByteArrayResource(bytes);

            String filename = "suppliers_" + LocalDate.now() + ".xlsx";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.parseMediaType(
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .contentLength(bytes.length)
                    .body(resource);
        } catch (Exception e) {
            throw new RuntimeException("Failed to export suppliers: " + e.getMessage());
        }
    }
}