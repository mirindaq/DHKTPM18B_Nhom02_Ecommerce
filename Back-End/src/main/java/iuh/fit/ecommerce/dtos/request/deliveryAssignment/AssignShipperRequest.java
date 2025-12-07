package iuh.fit.ecommerce.dtos.request.deliveryAssignment;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
public class AssignShipperRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotNull(message = "Shipper ID is required")
    private Long shipperId;
}