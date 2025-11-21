package iuh.fit.ecommerce.dtos.response.order;

import iuh.fit.ecommerce.dtos.response.product.ProductVariantOrderResponse;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class OrderDetailResponse {
    private Long id;
    private Double price;
    private Long quantity;
    private Double discount;
    private Double finalPrice;
    private ProductVariantOrderResponse productVariant;
}
