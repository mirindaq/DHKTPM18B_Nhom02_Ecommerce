package iuh.fit.ecommerce.dtos.request.productQuestion;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductQuestionAddRequest {
    @NotNull(message = "Content cannot be null")
//    @Size(min = 10, max = 500, message = "Content must be between 10 and 500 characters")
    private String content;


    @NotNull(message = "Product ID cannot be null")
    private Long productId;
}
