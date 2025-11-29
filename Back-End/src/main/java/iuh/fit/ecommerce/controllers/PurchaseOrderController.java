package iuh.fit.ecommerce.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import iuh.fit.ecommerce.dtos.request.purchaseOrder.PurchaseOrderRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.purchaseOrder.PurchaseOrderResponse;
import iuh.fit.ecommerce.services.PurchaseOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/purchase-orders")
@RequiredArgsConstructor
@Tag(name = "Purchase Order Controller", description = "Controller for managing purchase orders")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @PostMapping("")
    public ResponseEntity<ResponseSuccess<PurchaseOrderResponse>> createPurchaseOrder(
            @Valid @RequestBody PurchaseOrderRequest request
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Create purchase order success",
                purchaseOrderService.createPurchaseOrder(request)
        ));
    }

    @GetMapping("")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<PurchaseOrderResponse>>>> getAllPurchaseOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String supplierId,
            @RequestParam(required = false) String supplierName,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get all purchase orders success",
                purchaseOrderService.getAllPurchaseOrders(page, size, supplierId, supplierName, startDate, endDate)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseSuccess<PurchaseOrderResponse>> getPurchaseOrderById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get purchase order detail success",
                purchaseOrderService.getPurchaseOrderById(id)
        ));
    }
}
