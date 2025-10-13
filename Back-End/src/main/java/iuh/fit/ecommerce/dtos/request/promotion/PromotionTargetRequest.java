package iuh.fit.ecommerce.dtos.request.promotion;

import jakarta.validation.constraints.Positive;
import iuh.fit.ecommerce.validation.ValidPromotionTarget;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@ValidPromotionTarget
public class PromotionTargetRequest {

    @Positive(message = "productId must be greater than 0")
    private Long productId;

    @Positive(message = "productVariantId must be greater than 0")
    private Long productVariantId;

    @Positive(message = "categoryId must be greater than 0")
    private Long categoryId;

    @Positive(message = "brandId must be greater than 0")
    private Long brandId;
}
