package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.request.order.OrderCreationRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.services.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
