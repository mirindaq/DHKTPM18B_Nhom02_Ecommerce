package iuh.fit.ecommerce.dtos.response.productQuestion;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class ProductQuestionWithProductResponse {
    private Long id;
    private String content;
    private Boolean status;
    private String userName;
    private List<ProductQuestionAnswerResponse> answers;

    // Product info
    private Long productId;
    private String productName;
    private String productSlug;
    private String productImage;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
