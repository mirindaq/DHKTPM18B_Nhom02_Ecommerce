package iuh.fit.ecommerce.dtos.response.deliveryAssignment;

import iuh.fit.ecommerce.dtos.response.order.OrderResponse;
import iuh.fit.ecommerce.dtos.response.shipper.ShipperResponse;
import iuh.fit.ecommerce.enums.DeliveryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryAssignmentResponse {
    private Long id;
    private OrderResponse order;
    private ShipperResponse shipper;
    private String expectedDeliveryDate;
    private DeliveryStatus deliveryStatus;
    private String deliveredAt;
    private String createdAt;
    private String note;
    private List<String> deliveryImages;
}