package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.order.OrderCreationRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.order.OrderResponse;
import iuh.fit.ecommerce.dtos.response.product.ProductResponse;
import iuh.fit.ecommerce.entities.Order;
import iuh.fit.ecommerce.enums.OrderStatus;
import jakarta.servlet.http.HttpServletRequest;
import org.hibernate.query.Page;

import java.util.List;

import java.time.LocalDate;
import java.util.List;

public interface OrderService {
    Object customerCreateOrder(OrderCreationRequest orderCreationRequest, HttpServletRequest request);
    ResponseWithPagination<List<OrderResponse>> getMyOrders(int page, int size, String status, String startDate, String endDate);

    Order findById(Long id);

    ResponseWithPagination<List<OrderResponse>> getAllOrdersForAdmin(
            String customerName, 
            LocalDate orderDate, 
            String customerPhone, 
            OrderStatus status, 
            Boolean isPickup, 
            int page, 
            int size
    );

    OrderResponse getOrderDetailById(Long id);

    OrderResponse confirmOrder(Long orderId);

    OrderResponse cancelOrder(Long orderId);

    OrderResponse processOrder(Long orderId);

    OrderResponse completeOrder(Long orderId);

    ResponseWithPagination<List<OrderResponse>> getOrdersNeedShipper(int page, int size);
}
