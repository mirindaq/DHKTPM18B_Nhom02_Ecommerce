package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.request.order.OrderCreationRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.order.OrderResponse;
import iuh.fit.ecommerce.enums.OrderStatus;
import iuh.fit.ecommerce.services.OrderService;
import jakarta.servlet.http.HttpServletRequest;
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
@RequestMapping("${api.prefix}/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping(value = "")
    public ResponseEntity<ResponseSuccess<Object>> customerCreateOrder(@Valid @RequestBody OrderCreationRequest orderCreationRequest,
                                                                       HttpServletRequest request){
        return ResponseEntity.ok(new ResponseSuccess<>(
                CREATED,
                "Create Customer success",
                orderService.customerCreateOrder(orderCreationRequest, request)
        ));
    }

    @GetMapping("/admin")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<OrderResponse>>>> getAllOrdersForAdmin(
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) LocalDate orderDate,
            @RequestParam(required = false) String customerPhone,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) Boolean isPickup,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get all orders success",
                orderService.getAllOrdersForAdmin(customerName, orderDate, customerPhone, status, isPickup, page, size)
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseSuccess<OrderResponse>> getOrderDetailById(@PathVariable Long id) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get order detail success",
                orderService.getOrderDetailById(id)
        ));
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<ResponseSuccess<OrderResponse>> confirmOrder(@PathVariable Long id) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Confirm order success",
                orderService.confirmOrder(id)
        ));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ResponseSuccess<OrderResponse>> cancelOrder(@PathVariable Long id) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Cancel order success",
                orderService.cancelOrder(id)
        ));
    }

    @PutMapping("/{id}/process")
    public ResponseEntity<ResponseSuccess<OrderResponse>> processOrder(@PathVariable Long id) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Process order success",
                orderService.processOrder(id)
        ));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ResponseSuccess<OrderResponse>> completeOrder(@PathVariable Long id) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Complete order success",
                orderService.completeOrder(id)
        ));
    }
}
