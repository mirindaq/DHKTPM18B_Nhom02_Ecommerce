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
public class OrderSummaryResponse {
    private Long orderId;
    private String orderCode;
    private LocalDateTime orderDate;
    private String customerName;
    private String customerPhone;
    private Double totalPrice;
    private Double finalTotalPrice;
    private String paymentMethod;
    private String status;
}
