package iuh.fit.ecommerce.dtos.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductOrderDetailResponse {
    private Long orderId;
    private String orderCode;
    private LocalDateTime orderDate;
    private String customerName;
    private Long quantityOrdered;
    private Double unitPrice;
    private Double totalPrice;
}
