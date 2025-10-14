package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.request.promotion.PromotionAddRequest;
import iuh.fit.ecommerce.dtos.request.promotion.PromotionUpdateRequest;
import iuh.fit.ecommerce.dtos.request.voucher.VoucherAddRequest;
import iuh.fit.ecommerce.dtos.request.voucher.VoucherUpdateRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.promotion.PromotionResponse;
import iuh.fit.ecommerce.dtos.response.voucher.VoucherAvailableResponse;
import iuh.fit.ecommerce.dtos.response.voucher.VoucherResponse;
import iuh.fit.ecommerce.services.PromotionService;
import iuh.fit.ecommerce.services.VoucherService;
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
@RequestMapping("${api.prefix}/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    @PostMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseSuccess<VoucherResponse>> createVoucher(
            @Valid @RequestBody VoucherAddRequest request
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Create Voucher success",
                voucherService.createVoucher(request)
        ));
    }

    @PutMapping("/{id}/send")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseSuccess<Void>> sendVoucherToCustomers(@PathVariable Long id) {
        voucherService.sendVoucherToCustomers(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Send voucher to customers success",
                null
        ));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseSuccess<VoucherResponse>> getVoucherById(@PathVariable Long id) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get Voucher success",
                voucherService.getVoucherById(id)
        ));
    }

    @GetMapping("/available")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ResponseSuccess<List<VoucherAvailableResponse>>> getAvailableVouchers( ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get available vouchers success",
                voucherService.getAvailableVouchersForCustomer()
        ));
    }


    @GetMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<VoucherResponse>>>> getAllVouchers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get Vouchers success",
                voucherService.getAllVouchers(page, limit, name, type, active, startDate, endDate)
        ));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseSuccess<VoucherResponse>> updateVoucher(
            @PathVariable Long id,
            @Valid @RequestBody VoucherUpdateRequest request
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Update Voucher success",
                voucherService.updateVoucher(id, request)
        ));
    }


    @PutMapping("/change-status/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseSuccess<Void>> changeStatusVoucher(@PathVariable Long id) {
        voucherService.changeStatusVoucher(id);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Change status Voucher success",
                null
        ));
    }
}
