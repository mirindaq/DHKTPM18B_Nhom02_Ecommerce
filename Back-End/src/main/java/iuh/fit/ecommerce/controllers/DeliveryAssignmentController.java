package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.request.deliveryAssignment.AssignShipperRequest;
import iuh.fit.ecommerce.dtos.request.deliveryAssignment.CompleteDeliveryRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.deliveryAssignment.DeliveryAssignmentResponse;
import iuh.fit.ecommerce.services.DeliveryAssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/delivery-assignments")
@RequiredArgsConstructor
public class DeliveryAssignmentController {
    private final DeliveryAssignmentService deliveryAssignmentService;

    @PostMapping("/assign-shipper")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ResponseSuccess<Void>> assignShipperToOrder(
            @Valid @RequestBody AssignShipperRequest assignShipperRequest) {
        deliveryAssignmentService.assignShipperToOrder(assignShipperRequest);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Shipper assigned successfully",
                null
        ));
    }

    @PutMapping("/delivery/{deliveryAssignmentId}/start")
    @PreAuthorize("hasRole('SHIPPER')")
    public ResponseEntity<ResponseSuccess<Void>> startDelivery(
            @PathVariable Long deliveryAssignmentId) {
        deliveryAssignmentService.startDelivery(deliveryAssignmentId);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Delivery started",
                null
        ));
    }

    @PutMapping("/delivery/complete")
    @PreAuthorize("hasRole('SHIPPER')")
    public ResponseEntity<ResponseSuccess<Void>> completeDelivery(
            @Valid @RequestBody CompleteDeliveryRequest request) {
        deliveryAssignmentService.completeDelivery(request);
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Delivery completed",
                null
        ));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SHIPPER')")
    public ResponseEntity<ResponseSuccess<DeliveryAssignmentResponse>> getDeliveryAssignmentById(
            @PathVariable Long id) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get delivery assignment successfully",
                deliveryAssignmentService.getDeliveryAssignmentById(id)
        ));
    }

    @GetMapping("/my-deliveries")
    @PreAuthorize("hasRole('SHIPPER')")
    public ResponseEntity<ResponseSuccess<List<DeliveryAssignmentResponse>>> getMyDeliveries() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get my deliveries successfully",
                deliveryAssignmentService.getMyDeliveries()
        ));
    }

    @GetMapping("/my-delivering-orders")
    @PreAuthorize("hasRole('SHIPPER')")
    public ResponseEntity<ResponseSuccess<List<DeliveryAssignmentResponse>>> getMyDeliveringOrders() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get my delivering orders successfully",
                deliveryAssignmentService.getMyDeliveringOrders()
        ));
    }
}