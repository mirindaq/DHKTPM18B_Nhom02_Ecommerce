package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.request.order.OrderCreationRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.order.OrderResponse;
import iuh.fit.ecommerce.dtos.response.product.ProductResponse;
import iuh.fit.ecommerce.services.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.http.HttpStatus.CREATED;

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

    @GetMapping("/my-orders")
    public ResponseEntity<ResponseSuccess<ResponseWithPagination<List<OrderResponse>>>> getMyOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "7") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                org.springframework.http.HttpStatus.OK,
                "Get my orders success",
                orderService.getMyOrders(page, size, status, startDate, endDate)
        ));
    }
}
