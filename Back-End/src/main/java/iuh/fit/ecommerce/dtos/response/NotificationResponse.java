package iuh.fit.ecommerce.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private String type;
    private Long orderId;
    private String orderStatus;
    private Long deliveryAssignmentId;
    private Long shipperId;
    private String deliveryStatus;
    private String action;
    private String message;
    private Long timestamp;
}

