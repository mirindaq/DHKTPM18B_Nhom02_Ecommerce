package iuh.fit.ecommerce.dtos.response.purchaseOrder;

import iuh.fit.ecommerce.dtos.response.product.ProductVariantOrderResponse;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class PurchaseOrderDetailResponse {
    private Long id;
    private Double price;
    private Long quantity;
    private ProductVariantOrderResponse productVariant;
}
