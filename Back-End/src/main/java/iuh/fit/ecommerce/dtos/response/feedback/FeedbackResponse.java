package iuh.fit.ecommerce.dtos.response.feedback;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class FeedbackResponse {
    private Long id;
    private Long orderId;
    private Long productVariantId;
    private String productName;
    private String productImage;
    private Long customerId;
    private String customerName;
    private Integer rating;
    private String comment;
    private List<String> imageUrls;
    private String createdAt;
}
