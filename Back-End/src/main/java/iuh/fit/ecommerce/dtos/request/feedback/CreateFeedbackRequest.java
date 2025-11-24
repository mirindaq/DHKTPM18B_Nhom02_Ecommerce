package iuh.fit.ecommerce.dtos.request.feedback;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateFeedbackRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotNull(message = "Product variant ID is required")
    private Long productVariantId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    private String comment;

    private List<String> imageUrls;
}
