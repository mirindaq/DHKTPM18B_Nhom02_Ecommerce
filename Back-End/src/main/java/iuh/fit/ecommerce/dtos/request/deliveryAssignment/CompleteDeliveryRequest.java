package iuh.fit.ecommerce.dtos.request.deliveryAssignment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
public class CompleteDeliveryRequest {

    @NotNull(message = "Delivery assignment ID is required")
    private Long deliveryAssignmentId;

    @NotNull(message = "Success status is required")
    private Boolean success;

    @NotBlank(message = "Note is required")
    private String note;

    private List<String> imageUrls;
}