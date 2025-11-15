package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.request.order.OrderCreationRequest;
import iuh.fit.ecommerce.dtos.response.base.ResponseWithPagination;
import iuh.fit.ecommerce.dtos.response.order.OrderResponse;
import iuh.fit.ecommerce.dtos.response.product.ProductResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.hibernate.query.Page;

import java.util.List;

public interface OrderService {
    Object customerCreateOrder(OrderCreationRequest orderCreationRequest, HttpServletRequest request);
    ResponseWithPagination<List<OrderResponse>> getMyOrders(int page, int size, String status, String startDate, String endDate);

}
