package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.order.OrderCreationRequest;
import iuh.fit.ecommerce.entities.Order;
import jakarta.servlet.http.HttpServletRequest;

public interface OrderService {
    Object customerCreateOrder(OrderCreationRequest orderCreationRequest, HttpServletRequest request);
    Order findById(Long id);
}
