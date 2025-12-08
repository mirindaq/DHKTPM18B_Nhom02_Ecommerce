package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.request.supplier.SupplierRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.supplier.SupplierResponse;
import iuh.fit.ecommerce.services.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

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
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
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
    public ResponseEntity<ResponseSuccess<SupplierResponse>> getSupplierById(@PathVariable String id) {
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
            @PathVariable String id,
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
    public ResponseEntity<ResponseSuccess<Void>> changeStatusSupplier(@PathVariable String id) {
        supplierService.changeStatusSupplier(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Thay đổi trạng thái nhà cung cấp thành công",
                null
        ));
    }
}