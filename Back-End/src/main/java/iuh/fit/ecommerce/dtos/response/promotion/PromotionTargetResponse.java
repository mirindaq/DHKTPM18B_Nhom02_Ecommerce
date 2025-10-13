package iuh.fit.ecommerce.dtos.response.promotion;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
@Builder
public class PromotionTargetResponse {
    private Long id;
    private Long productVariantId;
    private Long productId;
    private Long categoryId;
    private Long brandId;
}
