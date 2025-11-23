package iuh.fit.ecommerce.dtos.response.product;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ProductVariantOrderResponse {
    private Long id;
    private String sku;
    private Double price;
    private Integer stock;
    private String productName;
    private String productThumbnail;
    private String brandName;
    private String categoryName;
}

