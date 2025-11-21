package iuh.fit.ecommerce.dtos.response.order;

import iuh.fit.ecommerce.dtos.response.customer.CustomerResponse;
import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.entities.OrderDetail;
import iuh.fit.ecommerce.enums.OrderStatus;
import iuh.fit.ecommerce.enums.PaymentMethod;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class OrderResponse {
    private Long id;
    private String receiverAddress;
    private String receiverName;
    private String receiverPhone;
    private String orderDate;
    private OrderStatus status;
    private String note;
    private PaymentMethod paymentMethod;
    private Boolean isPickup;
    private Double totalPrice;
    private Double totalDiscount;
    private Double finalTotalPrice;
    private CustomerResponse customer;
    private List<OrderDetailResponse> orderDetails;
}
